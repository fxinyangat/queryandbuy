from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import datetime
import uuid

# User Registration
class UserRegisterRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    username: str
    password: str
    
    @validator('first_name', 'last_name')
    def validate_names(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Name must be at least 2 characters long')
        if len(v.strip()) > 50:
            raise ValueError('Name must be less than 50 characters')
        return v.strip()
    
    @validator('username')
    def validate_username(cls, v):
        if len(v.strip()) < 3:
            raise ValueError('Username must be at least 3 characters long')
        if len(v.strip()) > 30:
            raise ValueError('Username must be less than 30 characters')
        if not v.replace('_', '').isalnum():
            raise ValueError('Username can only contain letters, numbers, and underscores')
        return v.strip().lower()
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if len(v) > 128:
            raise ValueError('Password must be less than 128 characters')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one number')
        return v

# User Login
class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

# Password reset
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordValidateResponse(BaseModel):
    ok: bool

class ResetPasswordRequest(BaseModel):
    email: Optional[EmailStr] = None
    token: Optional[str] = None
    code: Optional[str] = None
    new_password: str

# Token Response
class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

# User Response
class UserResponse(BaseModel):
    user_id: uuid.UUID
    username: str
    email: str
    first_name: str
    last_name: str
    is_active: bool
    email_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Auth Response
class AuthResponse(BaseModel):
    user: UserResponse
    token: TokenResponse

# Error Response
class ErrorResponse(BaseModel):
    error: str
    message: str
    details: Optional[dict] = None

# -------- Activity / Search History --------
class SearchHistoryItem(BaseModel):
    search_id: uuid.UUID
    search_query: str
    platform: str
    results_count: int
    created_at: datetime
    custom_label: Optional[str] = None

    class Config:
        from_attributes = True

class SearchHistoryListResponse(BaseModel):
    items: List[SearchHistoryItem]
    total: int

class SearchHistoryUpdateRequest(BaseModel):
    custom_label: Optional[str] = None

# -------- Favorites --------
class FavoriteRequest(BaseModel):
    product_id: str
    user_notes: Optional[str] = None
    # Optional product snapshot to satisfy FK and improve UX
    platform_name: Optional[str] = None
    product_name: Optional[str] = None
    product_url: Optional[str] = None
    image_url: Optional[str] = None

class FavoriteItem(BaseModel):
    favorite_id: uuid.UUID
    product_id: str
    user_notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class FavoriteListResponse(BaseModel):
    items: List[FavoriteItem]
    total: int

# -------- User Events (product interactions) --------
class EventRequest(BaseModel):
    event_type: str  # e.g., 'product_view', 'product_save', 'product_compare'
    product_id: Optional[str] = None
    action: Optional[str] = None  # e.g., 'add'|'remove' for compares/saves
    source: Optional[str] = None  # e.g., 'results_grid', 'product_detail'
    metadata: Optional[dict] = None  # any additional context

class EventItem(BaseModel):
    event_id: uuid.UUID
    event_type: str
    event_timestamp: datetime
    event_data: dict

    class Config:
        from_attributes = True

class EventListResponse(BaseModel):
    items: List[EventItem]
    total: int

# -------- Comparison sessions & chat --------
class ProductSnapshot(BaseModel):
    product_id: str
    platform_name: Optional[str] = None
    product_name: Optional[str] = None
    product_url: Optional[str] = None
    image_url: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    currency_code: Optional[str] = None
    currency_symbol: Optional[str] = None
    in_stock: Optional[bool] = None
    average_rating: Optional[float] = None
    total_reviews: Optional[int] = None

class ComparisonSessionCreateRequest(BaseModel):
    product_ids: List[str]
    original_search_query: Optional[str] = None
    session_name: Optional[str] = None
    products: Optional[List[ProductSnapshot]] = None

class ProductPreview(BaseModel):
    product_id: str
    image_url: Optional[str] = None

class ComparisonSessionItem(BaseModel):
    comparison_id: uuid.UUID
    session_name: Optional[str]
    original_search_query: Optional[str]
    created_at: datetime
    updated_at: datetime
    products_preview: Optional[List[ProductPreview]] = None

    class Config:
        from_attributes = True

class ComparisonSessionListResponse(BaseModel):
    items: List[ComparisonSessionItem]
    total: int

class ChatMessageItem(BaseModel):
    message_id: uuid.UUID
    message_type: str
    message_content: str
    created_at: datetime

    class Config:
        from_attributes = True

class ChatMessageListResponse(BaseModel):
    items: List[ChatMessageItem]
    total: int

class SessionProductsPatchRequest(BaseModel):
    action: str  # 'add' | 'remove'
    product_id: str
    # Optional snapshot to enrich products table on 'add'
    platform_name: Optional[str] = None
    product_name: Optional[str] = None
    product_url: Optional[str] = None
    image_url: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    currency_code: Optional[str] = None
    currency_symbol: Optional[str] = None
    in_stock: Optional[bool] = None
    average_rating: Optional[float] = None
    total_reviews: Optional[int] = None
