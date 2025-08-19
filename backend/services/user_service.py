from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from models import User, UserSession
from schemas import UserRegisterRequest, UserLoginRequest
from auth_utils import get_password_hash, verify_password, create_access_token, create_refresh_token
from datetime import datetime, timedelta
from typing import Optional, Tuple
import uuid

class UserService:
    def __init__(self, db: Session):
        self.db = db
    
    def register_user(self, user_data: UserRegisterRequest) -> Tuple[bool, str, Optional[User]]:
        """Register a new user."""
        try:
            # Check if user already exists
            existing_user = self.db.query(User).filter(
                (User.email == user_data.email) | (User.username == user_data.username)
            ).first()
            
            if existing_user:
                if existing_user.email == user_data.email:
                    return False, "Email already registered", None
                else:
                    return False, "Username already taken", None
            
            # Create new user
            hashed_password = get_password_hash(user_data.password)
            new_user = User(
                username=user_data.username,
                email=user_data.email,
                first_name=user_data.first_name,
                last_name=user_data.last_name,
                password_hash=hashed_password
            )
            
            self.db.add(new_user)
            self.db.commit()
            self.db.refresh(new_user)
            
            return True, "User registered successfully", new_user
            
        except IntegrityError:
            self.db.rollback()
            return False, "Database error occurred", None
        except Exception as e:
            self.db.rollback()
            return False, f"Registration failed: {str(e)}", None
    
    def authenticate_user(self, email: str, password: str) -> Tuple[bool, str, Optional[User]]:
        """Authenticate a user with email and password."""
        try:
            user = self.db.query(User).filter(User.email == email).first()
            
            if not user:
                return False, "Invalid email or password", None
            
            if not verify_password(password, user.password_hash):
                return False, "Invalid email or password", None
            
            if not user.is_active:
                return False, "Account is deactivated", None
            
            return True, "Authentication successful", user
            
        except Exception as e:
            return False, f"Authentication failed: {str(e)}", None
    
    def create_user_session(self, user: User, ip_address: str = None, user_agent: str = None) -> Tuple[str, str]:
        """Create access and refresh tokens for a user."""
        # Create access token
        access_token = create_access_token(
            data={"sub": str(user.user_id), "email": user.email, "username": user.username}
        )
        
        # Create refresh token
        refresh_token = create_refresh_token(
            data={"sub": str(user.user_id)}
        )
        
        # Store session in database
        session = UserSession(
            user_id=user.user_id,
            session_token=refresh_token,
            expires_at=datetime.utcnow() + timedelta(days=7),
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        self.db.add(session)
        self.db.commit()
        
        return access_token, refresh_token

    def refresh_user_session(self, refresh_token: str, ip_address: str | None = None, user_agent: str | None = None) -> Tuple[User, str, str] | Tuple[None, None, None]:
        """Validate an existing refresh token, rotate it, and return new access/refresh tokens.

        Sliding expiration: extends session expiry window when refreshed.
        """
        # Look up session by refresh token
        session_row = (
            self.db.query(UserSession)
            .filter(UserSession.session_token == refresh_token, UserSession.deleted_at == None)
            .first()
        )
        if not session_row:
            return None, None, None
        # Check not expired
        if session_row.expires_at and session_row.expires_at < datetime.utcnow():
            return None, None, None
        # Load user
        user = self.db.query(User).filter(User.user_id == session_row.user_id).first()
        if not user or not user.is_active:
            return None, None, None
        # Issue new tokens
        access_token = create_access_token(
            data={"sub": str(user.user_id), "email": user.email, "username": user.username}
        )
        new_refresh = create_refresh_token(data={"sub": str(user.user_id)})
        # Rotate & extend expiry (sliding window)
        session_row.session_token = new_refresh
        session_row.expires_at = datetime.utcnow() + timedelta(days=7)
        if ip_address:
            session_row.ip_address = ip_address
        if user_agent:
            session_row.user_agent = user_agent
        self.db.commit()
        return user, access_token, new_refresh

    def invalidate_session_by_refresh(self, refresh_token: str) -> bool:
        """Soft-delete a session row by its refresh token."""
        row = (
            self.db.query(UserSession)
            .filter(UserSession.session_token == refresh_token, UserSession.deleted_at == None)
            .first()
        )
        if not row:
            return False
        row.deleted_at = datetime.utcnow()
        self.db.commit()
        return True

    def slide_expiry_for_user(self, user_id: uuid.UUID, minutes: int = 30) -> None:
        """Extend session expiry for active sessions for a user (sliding window)."""
        try:
            window = datetime.utcnow() + timedelta(days=7)
            self.db.query(UserSession).filter(
                UserSession.user_id == user_id,
                UserSession.deleted_at == None
            ).update({UserSession.expires_at: window}, synchronize_session=False)
            self.db.commit()
        except Exception:
            self.db.rollback()
    
    def get_user_by_id(self, user_id: uuid.UUID) -> Optional[User]:
        """Get user by ID."""
        return self.db.query(User).filter(User.user_id == user_id).first()
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        return self.db.query(User).filter(User.email == email).first()
    
    def get_user_by_username(self, username: str) -> Optional[User]:
        """Get user by username."""
        return self.db.query(User).filter(User.username == username).first()
    
    def update_user_verification(self, user_id: uuid.UUID, is_verified: bool = True) -> bool:
        """Update user verification status."""
        try:
            user = self.get_user_by_id(user_id)
            if user:
                user.email_verified = is_verified
                self.db.commit()
                return True
            return False
        except Exception:
            self.db.rollback()
            return False
    
    def get_user_sessions(self, user_id: uuid.UUID) -> list:
        """Get all active sessions for a user."""
        try:
            sessions = self.db.query(UserSession).filter(
                UserSession.user_id == user_id,
                UserSession.expires_at > datetime.utcnow()
            ).all()
            
            return [
                {
                    "session_id": str(session.session_id),
                    "ip_address": session.ip_address,
                    "user_agent": session.user_agent,
                    "created_at": session.created_at.isoformat(),
                    "expires_at": session.expires_at.isoformat()
                }
                for session in sessions
            ]
        except Exception:
            return []
    
    def deactivate_user_session(self, token: str) -> bool:
        """Deactivate a user session."""
        try:
            session = self.db.query(UserSession).filter(
                UserSession.session_token == token
            ).first()
            
            if session:
                # Since there's no is_active column, we'll delete the session
                self.db.delete(session)
                self.db.commit()
                return True
            return False
        except Exception:
            self.db.rollback()
            return False
