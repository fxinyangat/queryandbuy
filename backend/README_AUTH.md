# Query and Buy - Backend Authentication Setup

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Environment Configuration
Create a `.env` file in the backend directory with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:admin@localhost:5432/queryandbuy

# JWT Configuration
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# API Keys
WALMART_API_KEY=your-walmart-api-key-here

# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=True
```

### 3. Initialize Database
```bash
python init_db.py
```

### 4. Start the Server
```bash
python main.py
```

## 🔐 Authentication Endpoints

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "password": "SecurePass123"
}
```

### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

### Logout User
```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

## 🛡️ Security Features

- **Password Hashing**: Uses bcrypt for secure password storage
- **JWT Tokens**: Access and refresh token system
- **Input Validation**: Comprehensive server-side validation
- **SQL Injection Protection**: SQLAlchemy ORM with parameterized queries
- **CORS Configuration**: Proper CORS setup for frontend integration

## 📊 Database Schema

The authentication system includes the following tables:
- `users` - User accounts and profiles
- `user_sessions` - Active user sessions and tokens
- `user_events` - User activity tracking
- `user_favorites` - User's saved/wishlist products (canonical per schema)
- `search_history` - User's search queries
- `chat_history` - User's AI chat interactions

## 🔧 Configuration

### Database Connection
Make sure PostgreSQL is running and the database `queryandbuy` exists:
```sql
CREATE DATABASE queryandbuy;
```

### JWT Secret Key
Generate a secure secret key for JWT tokens:
```python
import secrets
print(secrets.token_urlsafe(32))
```

## 🧪 Testing

Test the authentication endpoints using curl or Postman:

```bash
# Register a new user
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "email": "test@example.com",
    "username": "testuser",
    "password": "TestPass123"
  }'

# Login
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check if PostgreSQL is running
   - Verify DATABASE_URL in .env file
   - Ensure database exists

2. **Import Errors**
   - Make sure all dependencies are installed
   - Check Python path and virtual environment

3. **JWT Token Issues**
   - Verify SECRET_KEY is set in .env
   - Check token expiration settings

### Logs
Check the console output for detailed error messages and debugging information.
