from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Query and Buy API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Query and Buy API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is working"}

@app.get("/test")
async def test():
    return {"test": "success"} 