#!/usr/bin/env python3
"""
Database initialization script for Query and Buy
"""

from database import engine
from models import Base
import os
from dotenv import load_dotenv

def init_database():
    """Initialize the database with all tables."""
    load_dotenv()
    
    print("Creating database tables...")
    
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
        
        # Test database connection
        with engine.connect() as conn:
            from sqlalchemy import text
            result = conn.execute(text("SELECT 1"))
            result.fetchone()
            print("✅ Database connection test successful!")
            
    except Exception as e:
        print(f"❌ Database initialization failed: {str(e)}")
        print("\nTroubleshooting:")
        print("1. Make sure PostgreSQL is running")
        print("2. Check your DATABASE_URL in .env file")
        print("3. Ensure the database 'queryandbuy' exists")
        print("4. Verify PostgreSQL credentials")
        return False
    
    return True

if __name__ == "__main__":
    print("🚀 Initializing Query and Buy Database...")
    print("=" * 50)
    
    success = init_database()
    
    if success:
        print("\n🎉 Database initialization completed successfully!")
        print("You can now start the backend server.")
    else:
        print("\n💥 Database initialization failed!")
        print("Please check the error messages above and try again.")
