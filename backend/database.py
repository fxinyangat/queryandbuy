from sqlalchemy import create_engine
from sqlalchemy.engine.url import make_url
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Database configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:admin@localhost:5432/queryandbuy"
)

# Create SQLAlchemy engine with sensible production defaults
# - Ensure sslmode=require for managed Postgres providers (e.g., Railway)
# - Enable pool_pre_ping to recycle broken connections
try:
    url = make_url(DATABASE_URL)
    # If using Postgres and sslmode is not specified, require SSL
    if url.get_backend_name().startswith("postgresql"):
        existing_query = dict(url.query) if getattr(url, "query", None) else {}
        if "sslmode" not in existing_query:
            url = url.set(query={**existing_query, "sslmode": "require"})
    engine = create_engine(url, pool_pre_ping=True)
except Exception:
    # Fallback to the original URL as a last resort
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
