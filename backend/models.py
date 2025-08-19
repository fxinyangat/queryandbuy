from sqlalchemy import Column, String, DateTime, Boolean, Text, Integer, ForeignKey, JSON, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import uuid

class User(Base):
    __tablename__ = "users"
    
    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(30), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    email_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user_sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    user_events = relationship("UserEvent", back_populates="user", cascade="all, delete-orphan")
    search_history = relationship("SearchHistory", back_populates="user", cascade="all, delete-orphan")
    chat_history = relationship("ChatHistory", back_populates="user", cascade="all, delete-orphan")

class UserSession(Base):
    __tablename__ = "user_sessions"
    
    session_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    session_token = Column(String(255), nullable=False, unique=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    ip_address = Column(String(45), nullable=True)  # INET type
    user_agent = Column(Text, nullable=True)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="user_sessions")

class UserEvent(Base):
    __tablename__ = "user_events"
    
    event_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    session_id = Column(UUID(as_uuid=True), ForeignKey("user_sessions.session_id"), nullable=True)
    event_type = Column(String(50), nullable=False, index=True)
    event_data = Column(JSON, nullable=True)
    event_timestamp = Column(DateTime(timezone=True), server_default=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="user_events")

    # deprecated: liked_products removed in favor of user_favorites defined in schema

class UserFavorite(Base):
    __tablename__ = "user_favorites"

    favorite_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    product_id = Column(String(255), nullable=False)
    user_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)

class SearchHistory(Base):
    __tablename__ = "search_history"
    
    search_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    search_query = Column(String(500), nullable=False)
    query_key = Column(String(512), nullable=True, index=True)
    # Align column name to existing DB schema: column is named "platform"
    platform = Column(String(50), nullable=False)
    results_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    custom_label = Column(String(200), nullable=True)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="search_history")

# Minimal Products model to satisfy FK for user_favorites insert when favoriting
class Product(Base):
    __tablename__ = "products"

    product_id = Column(String(255), primary_key=True)
    platform_name = Column(String(50), nullable=False)
    product_name = Column(String(500), nullable=False)
    product_description = Column(Text, nullable=True)
    product_url = Column(Text, nullable=True)
    image_url = Column(Text, nullable=True)
    thumbnail_url = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)

class ProductPrice(Base):
    __tablename__ = "product_prices"

    price_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(String(255), nullable=False)
    current_price = Column(Numeric(10, 2), nullable=True)
    original_price = Column(Numeric(10, 2), nullable=True)
    currency_code = Column(String(3), nullable=True, default='USD')
    currency_symbol = Column(String(5), nullable=True, default='$')
    is_in_stock = Column(Boolean, default=True)
    shipping_cost = Column(Numeric(10, 2), nullable=True)
    shipping_info = Column(Text, nullable=True)
    price_recorded_at = Column(DateTime(timezone=True), server_default=func.now())

class ProductRating(Base):
    __tablename__ = "product_ratings"

    rating_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(String(255), nullable=False)
    average_rating = Column(Numeric(3, 2), nullable=True)
    total_review_count = Column(Integer, nullable=True)
    rating_recorded_at = Column(DateTime(timezone=True), server_default=func.now())

class ChatHistory(Base):
    __tablename__ = "chat_history"
    
    chat_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    message = Column(Text, nullable=False)
    response = Column(Text, nullable=True)
    context = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="chat_history")

# ===== Comparison session models to match existing DB schema =====
class ComparisonSession(Base):
    __tablename__ = "comparison_sessions"

    comparison_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    session_name = Column(String(255), nullable=True)
    original_search_query = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)

class ComparisonProduct(Base):
    __tablename__ = "comparison_products"

    comparison_id = Column(UUID(as_uuid=True), ForeignKey("comparison_sessions.comparison_id"), primary_key=True)
    product_id = Column(String(255), primary_key=True)
    added_at = Column(DateTime(timezone=True), server_default=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    message_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    comparison_id = Column(UUID(as_uuid=True), ForeignKey("comparison_sessions.comparison_id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    message_type = Column(String(20), nullable=False)  # 'user' or 'ai'
    message_content = Column(Text, nullable=False)
    ai_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)
