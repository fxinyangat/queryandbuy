from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
import os
from dotenv import load_dotenv
from services.walmart_service import WalmartService
from services.amazon_service import AmazonService
from services.comparison_service import ComparisonService

# Load environment variables
load_dotenv()

app = FastAPI(title="Query and Buy API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "https://shopqnb.com",
        "https://www.shopqnb.com",
        "https://queryandbuy.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Walmart service
try:
    walmart_service = WalmartService()
except ValueError as e:
    print(f"Warning: {e}")
    walmart_service = None

# Initialize Amazon service
try:
    amazon_service = AmazonService()
except ValueError as e:
    print(f"Warning: {e}")
    amazon_service = None

# Initialize Comparison service
try:
    comparison_service = ComparisonService()
except ValueError as e:
    print(f"Warning: {e}")
    comparison_service = None

class SearchRequest(BaseModel):
    query: str
    platform: str = "walmart_search"
    page: int = 1

class SearchResponse(BaseModel):
    query: str
    results: List[Dict]
    total_results: int
    page: int

class ProductDetailsResponse(BaseModel):
    id: str
    platform: str
    details: Dict

class ProductReviewsResponse(BaseModel):
    url: str
    page: int
    reviews: List[Dict]
    total_results: int
    success: bool
    platform: str
    no_of_pages: int
    result_count: int
    credits_used: int
    remaining_credits: float

class ComparisonRequest(BaseModel):
    products: List[Dict]
    user_question: Optional[str] = None
    original_search_query: Optional[str] = None

class ComparisonResponse(BaseModel):
    ai_analysis: str
    products_analyzed: int
    original_search_query: Optional[str] = None
    user_question: Optional[str] = None

    

@app.get("/")
async def root():
    return {"message": "Query and Buy API is running"}

@app.post("/api/search", response_model=SearchResponse)
async def search_products(request: SearchRequest):
    """
    Search for products using the Walmart API
    """
    if not walmart_service:
        raise HTTPException(status_code=500, detail="Walmart service not configured")
    
    try:
        # Search Walmart
        results = walmart_service.search_products(
            query=request.query,
            page=request.page,
            platform=request.platform
        )
        
        return SearchResponse(
            query=results["query"],
            results=results["results"],
            total_results=results["total_results"],
            page=results["page"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@app.get("/api/search/walmart")
async def search_walmart_endpoint(query: str, page: int = 1):
    """
    Direct Walmart search endpoint
    """
    if not walmart_service:
        raise HTTPException(status_code=500, detail="Walmart service not configured")
    
    try:
        results = walmart_service.search_products(
            query=query,
            page=page,
            platform="walmart_search"
        )
        
        return {
            "query": results["query"],
            "results": results["results"],
            "total_results": results["total_results"],
            "page": results["page"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Walmart search failed: {str(e)}")

@app.get("/api/search/amazon")
async def search_amazon_endpoint(query: str, page: int = 1):
    """
    Direct Amazon search endpoint
    """
    if not amazon_service:
        raise HTTPException(status_code=500, detail="Amazon service not configured")
    
    try:
        results = amazon_service.search_products(
            query=query,
            page=page,
            platform="amazon_search"
        )
        
        return {
            "query": results["query"],
            "results": results["results"],
            "total_results": results["total_results"],
            "page": results["page"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Amazon search failed: {str(e)}")

@app.get("/api/product/{product_id}", response_model=ProductDetailsResponse)
async def get_product_details(product_id: str, platform: str = "walmart_detail"):
    """
    Get detailed information about a specific product
    
    Args:
        product_id (str): Product ID
        platform (str): Platform for product details (default: walmart_detail)
    """
    if not walmart_service:
        raise HTTPException(status_code=500, detail="Walmart service not configured")
    
    try:
        results = walmart_service.get_product_details(
            product_id=product_id,
            platform=platform
        )
        
        return ProductDetailsResponse(
            id=results["id"],
            platform=results["platform"],
            details=results["details"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Product details request failed: {str(e)}")

@app.get("/api/reviews", response_model=ProductReviewsResponse)
async def get_product_reviews(url: str, page: int = 1, platform: str = "walmart_reviews"):
    """
    Get reviews for a specific product
    
    Args:
        url (str): Product URL
        page (int): Page number for pagination (default: 1)
        platform (str): Platform for reviews (default: walmart_reviews)
    """
    if not walmart_service:
        raise HTTPException(status_code=500, detail="Walmart service not configured")
    
    try:
        results = walmart_service.get_product_reviews(
            url=url,
            page=page,
            platform=platform
        )
        
        return ProductReviewsResponse(
            url=results["url"],
            page=results["page"],
            reviews=results["reviews"],
            total_results=results["total_results"],
            success=results["success"],
            platform=results["platform"],
            no_of_pages=results["no_of_pages"],
            result_count=results["result_count"],
            credits_used=results["credits_used"],
            remaining_credits=results["remaining_credits"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Product reviews request failed: {str(e)}")

@app.get("/api/amazon/product/{product_id}", response_model=ProductDetailsResponse)
async def get_amazon_product_details(product_id: str, platform: str = "amazon_detail"):
    """
    Get detailed information about a specific Amazon product
    
    Args:
        product_id (str): Product ID
        platform (str): Platform for product details (default: amazon_detail)
    """
    if not amazon_service:
        raise HTTPException(status_code=500, detail="Amazon service not configured")
    
    try:
        results = amazon_service.get_product_details(
            product_id=product_id,
            platform=platform
        )
        
        return ProductDetailsResponse(
            id=results["id"],
            platform=results["platform"],
            details=results["details"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Amazon product details request failed: {str(e)}")

@app.get("/api/amazon/reviews", response_model=ProductReviewsResponse)
async def get_amazon_product_reviews(url: str, page: int = 1, platform: str = "amazon_reviews"):
    """
    Get reviews for a specific Amazon product
    
    Args:
        url (str): Product URL
        page (int): Page number for pagination (default: 1)
        platform (str): Platform for reviews (default: amazon_reviews)
    """
    if not amazon_service:
        raise HTTPException(status_code=500, detail="Amazon service not configured")
    
    try:
        results = amazon_service.get_product_reviews(
            url=url,
            page=page,
            platform=platform
        )
        
        return ProductReviewsResponse(
            url=results["url"],
            page=results["page"],
            reviews=results["reviews"],
            total_results=results["total_results"],
            success=results["success"],
            platform=results["platform"],
            no_of_pages=results["no_of_pages"],
            result_count=results["result_count"],
            credits_used=results["credits_used"],
            remaining_credits=results["remaining_credits"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Amazon product reviews request failed: {str(e)}")

@app.post("/api/compare", response_model=ComparisonResponse)
def compare_products(request: ComparisonRequest):
    """
    Generate AI-powered comparison analysis for selected products
    
    Args:
        request (ComparisonRequest): Contains list of products and optional user question
    """
    if not comparison_service:
        raise HTTPException(status_code=500, detail="Comparison service not configured")
    
    try:
        # Validate input
        if not request.products or len(request.products) < 1:
            raise HTTPException(status_code=400, detail="At least one product is required for comparison")
        
        if len(request.products) > 5:
            raise HTTPException(status_code=400, detail="Maximum 5 products can be compared at once")
        
        # Generate comparison
        comparison_result = comparison_service.compare_products(
            selected_products=request.products,
            user_question=request.user_question,
            original_search_query=request.original_search_query
        )
        
        return ComparisonResponse(
            ai_analysis=comparison_result["ai_analysis"],
            products_analyzed=comparison_result["products_analyzed"],
            original_search_query=comparison_result["original_search_query"],
            user_question=comparison_result["user_question"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Product comparison failed: {str(e)}")

@app.get("/api/compare/health")
async def compare_health_check():
    """
    Health check endpoint for comparison service
    """
    return {
        "status": "healthy",
        "services": {
            "walmart": walmart_service is not None,
            "amazon": amazon_service is not None,
            "comparison": comparison_service is not None
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 







    