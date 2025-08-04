# Query and Buy Backend API

This is the backend API for the Query and Buy application, which provides Walmart product search functionality.

## Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure environment variables:**
   - Copy `env.example` to `.env`
   - Add your Walmart API key to the `.env` file:
     ```
     WALMART_API_KEY=your_actual_api_key_here
     ```

3. **Run the API server:**
   ```bash
   python main.py
   ```
   
   Or using uvicorn directly:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

The API will be available at `http://localhost:8000`

## API Endpoints

### 1. Health Check
- **GET** `/`
- Returns a simple status message

### 2. Search Products (POST)
- **POST** `/api/search`
- **Body:**
  ```json
  {
    "query": "men's jackets",
    "platform": "walmart_search",
    "page": 1
  }
  ```
- **Response:**
  ```json
  {
    "query": "men's jackets",
    "results": [...],
    "total_results": 100,
    "page": 1
  }
  ```

### 3. Direct Walmart Search (GET)
- **GET** `/api/search/walmart?query=men's jackets&page=1`
- **Response:** Same as POST endpoint

## API Documentation

Once the server is running, you can access:
- **Interactive API docs:** `http://localhost:8000/docs`
- **ReDoc documentation:** `http://localhost:8000/redoc`

## Project Structure

```
backend/
├── main.py                 # FastAPI application
├── requirements.txt        # Python dependencies
├── env.example            # Environment variables template
├── services/
│   ├── walmart_service.py # Walmart API service
│   ├── search_service.py  # General search service
│   └── query_processor.py # Query processing utilities
└── WalmartAPIs/
    └── walmart_main.ipynb # Original notebook with search function
```

## Error Handling

The API includes comprehensive error handling for:
- Missing API keys
- Network errors
- Invalid requests
- Server errors

All errors return appropriate HTTP status codes and descriptive error messages.

## Development

To run in development mode with auto-reload:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Testing

You can test the API using curl:

```bash
# Test health check
curl http://localhost:8000/

# Test Walmart search
curl "http://localhost:8000/api/search/walmart?query=jackets&page=1"

# Test POST search
curl -X POST "http://localhost:8000/api/search" \
  -H "Content-Type: application/json" \
  -d '{"query": "men jackets", "page": 1}'
``` 