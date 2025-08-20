from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
import os
from dotenv import load_dotenv
from services.walmart_service import WalmartService
from services.amazon_service import AmazonService
from services.comparison_service import ComparisonService
from services.grok_service import GrokService
from services.user_service import UserService
from services.activity_service import ActivityService
from database import get_db, engine
from models import Base
from schemas import UserRegisterRequest, UserLoginRequest, AuthResponse, ErrorResponse
from schemas import (
    SearchHistoryListResponse,
    SearchHistoryItem,
    SearchHistoryUpdateRequest,
    FavoriteRequest,
    FavoriteListResponse,
    FavoriteItem,
    EventRequest,
    EventListResponse,
    EventItem,
    ComparisonSessionCreateRequest,
    ComparisonSessionListResponse,
    ComparisonSessionItem,
    ChatMessageListResponse,
    ChatMessageItem,
    SessionProductsPatchRequest,
)
from pydantic import BaseModel as PydBaseModel
from auth_middleware import get_current_user, get_current_user_optional
from starlette.requests import Request as StarletteRequest

# Load environment variables
load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

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
except Exception as e:
    print(f"Warning: Walmart service not available - {e}")
    walmart_service = None

# Initialize Amazon service
try:
    amazon_service = AmazonService()
except Exception as e:
    print(f"Warning: Amazon service not available - {e}")
    amazon_service = None

# Initialize Comparison service
try:
    comparison_service = ComparisonService()
except Exception as e:
    print(f"Warning: Comparison service not available - {e}")
    comparison_service = None

# Initialize Grok summarizer
try:
    grok_summarizer = GrokService()
except Exception as e:
    print(f"Warning: Grok summarizer not available - {e}")
    grok_summarizer = None

class SearchRequest(BaseModel):
    query: str
    platform: str = "walmart_search"
    page: int = 1
    log: Optional[bool] = True  # when False, do not store in search_history

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

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "message": "Query and Buy API is running",
        "services": {
            "walmart_service": walmart_service is not None,
            "amazon_service": amazon_service is not None,
            "comparison_service": comparison_service is not None
        },
        "version": "1.0.0"
    }

@app.post("/api/search", response_model=SearchResponse)
async def search_products(request: SearchRequest, current_user = Depends(get_current_user_optional), db = Depends(get_db)):
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
        # Log search history if authenticated and logging enabled
        try:
            if (request.log is None or request.log is True) and current_user and "user_id" in current_user:
                activity = ActivityService(db)
                activity.log_search(
                    user_id=current_user["user_id"],
                    search_query=request.query,
                    platform=request.platform,
                    results_count=results.get("total_results", 0),
                )
        except Exception:
            # Non-fatal; continue
            pass

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
        # No logging here; POST /api/search is the single logging path

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

# ============================================================================
# SEARCH QUERY SUMMARIZER (Grok)
# ============================================================================

@app.get("/api/search/summarize")
async def summarize_query(text: str):
    if not grok_summarizer:
        raise HTTPException(status_code=503, detail="Summarizer not configured")
    try:
        short = grok_summarizer.summarize_query(text)
        return {"summary": short}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summarization failed: {str(e)}")

# ============================================================================
# ACTIVITY: SEARCH HISTORY ENDPOINTS
# ============================================================================

@app.get("/api/activity/searches", response_model=SearchHistoryListResponse)
async def list_search_history(limit: int = 20, offset: int = 0, current_user = Depends(get_current_user), db = Depends(get_db)):
    try:
        service = ActivityService(db)
        items, total = service.list_search_history(current_user["user_id"], limit=limit, offset=offset)
        # Map ORM rows to response dicts to avoid serialization mismatches
        mapped = [
            {
                "search_id": it.search_id,
                "search_query": it.search_query,
                "platform": it.platform,
                "results_count": it.results_count,
                "created_at": it.created_at,
                "custom_label": it.custom_label,
            }
            for it in items
        ]
        return {"items": mapped, "total": total}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch search history: {str(e)}")

@app.delete("/api/activity/searches/{search_id}")
async def delete_search_history_item(search_id: str, current_user = Depends(get_current_user), db = Depends(get_db)):
    try:
        service = ActivityService(db)
        ok = service.delete_search(current_user["user_id"], search_id)
        if not ok:
            raise HTTPException(status_code=404, detail="Search history item not found")
        return {"deleted": True, "soft": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete search item: {str(e)}")

@app.patch("/api/activity/searches/{search_id}")
async def update_search_history_item(search_id: str, body: SearchHistoryUpdateRequest, current_user = Depends(get_current_user), db = Depends(get_db)):
    try:
        service = ActivityService(db)
        updated = service.update_search_label(current_user["user_id"], search_id, body.custom_label)
        if not updated:
            raise HTTPException(status_code=404, detail="Search history item not found")
        return {"ok": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update search item: {str(e)}")

@app.delete("/api/activity/searches")
async def clear_search_history(current_user = Depends(get_current_user), db = Depends(get_db)):
    try:
        service = ActivityService(db)
        count = service.clear_search_history(current_user["user_id"])
        return {"cleared": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear search history: {str(e)}")

# ============================================================================
# FAVORITES ENDPOINTS (user_favorites)
# ============================================================================

@app.post("/api/favorites", response_model=FavoriteItem)
async def add_favorite(body: FavoriteRequest, current_user = Depends(get_current_user), db = Depends(get_db)):
    try:
        service = ActivityService(db)
        # Temporary compatibility helper: ensure minimal product row exists for FK
        service.ensure_product_exists(
            product_id=body.product_id,
            platform_name=body.platform_name,
            product_name=body.product_name,
            product_url=body.product_url,
            image_url=body.image_url,
        )
        fav = service.add_favorite(current_user["user_id"], product_id=body.product_id, user_notes=body.user_notes)
        return fav
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add favorite: {str(e)}")

@app.delete("/api/favorites/{product_id}")
async def remove_favorite(product_id: str, current_user = Depends(get_current_user), db = Depends(get_db)):
    try:
        service = ActivityService(db)
        ok = service.remove_favorite(current_user["user_id"], product_id)
        if not ok:
            raise HTTPException(status_code=404, detail="Favorite not found")
        return {"deleted": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to remove favorite: {str(e)}")

@app.get("/api/favorites", response_model=FavoriteListResponse)
async def list_favorites(limit: int = 20, offset: int = 0, current_user = Depends(get_current_user), db = Depends(get_db)):
    try:
        service = ActivityService(db)
        items, total = service.list_favorites(current_user["user_id"], limit=limit, offset=offset)
        return FavoriteListResponse(items=items, total=total)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch favorites: {str(e)}")

@app.get("/api/favorites/{product_id}")
async def is_favorite(product_id: str, current_user = Depends(get_current_user), db = Depends(get_db)):
    try:
        service = ActivityService(db)
        exists = service.is_favorite(current_user["user_id"], product_id)
        return {"exists": exists}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to check favorite: {str(e)}")

# ============================================================================
# USER EVENTS (product interactions)
# ============================================================================

@app.post("/api/activity/events")
async def create_event(body: EventRequest, current_user = Depends(get_current_user), db = Depends(get_db)):
    try:
        # Optional: whitelist event types to those present in event_types
        allowed = {"search", "product_view", "product_save", "product_compare", "chat_message", "outbound_click", "share"}
        if body.event_type not in allowed:
            raise HTTPException(status_code=400, detail="Invalid event type")

        data = body.metadata or {}
        if body.product_id:
            data["product_id"] = body.product_id
        if body.action:
            data["action"] = body.action

        service = ActivityService(db)
        event = service.log_event(current_user["user_id"], event_type=body.event_type, event_data=data)
        return {"event_id": str(event.event_id)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create event: {str(e)}")

@app.get("/api/activity/events", response_model=EventListResponse)
async def list_events(event_type: Optional[str] = None, limit: int = 20, offset: int = 0, current_user = Depends(get_current_user), db = Depends(get_db)):
    try:
        service = ActivityService(db)
        items, total = service.list_events(current_user["user_id"], event_type=event_type, limit=limit, offset=offset)
        return EventListResponse(items=items, total=total)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch events: {str(e)}")

# ============================================================================
# COMPARISON SESSIONS & CHAT MESSAGES
# ============================================================================

@app.post("/api/compare/sessions")
async def create_comparison_session(body: ComparisonSessionCreateRequest, current_user = Depends(get_current_user), db = Depends(get_db)):
    try:
        if not body.product_ids:
            raise HTTPException(status_code=400, detail="product_ids is required")
        service = ActivityService(db)
        # Best-effort: ensure product rows exist from snapshots if provided
        if body.products:
            for p in body.products:
                try:
                    service.ensure_product_exists(
                        product_id=p.product_id,
                        platform_name=p.platform_name,
                        product_name=p.product_name,
                        product_url=p.product_url,
                        image_url=p.image_url,
                        price=getattr(p, 'price', None),
                        original_price=getattr(p, 'original_price', None),
                        currency_code=getattr(p, 'currency_code', None),
                        currency_symbol=getattr(p, 'currency_symbol', None),
                        is_in_stock=getattr(p, 'in_stock', None),
                        average_rating=getattr(p, 'average_rating', None),
                        total_review_count=getattr(p, 'total_reviews', None),
                    )
                except Exception:
                    pass
        session = service.create_comparison_session(
            user_id=current_user["user_id"],
            product_ids=body.product_ids,
            original_search_query=body.original_search_query,
            session_name=body.session_name,
        )
        return {"comparison_id": str(session.comparison_id)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create comparison session: {str(e)}")

@app.get("/api/compare/sessions", response_model=ComparisonSessionListResponse)
async def list_comparison_sessions(limit: int = 20, offset: int = 0, current_user = Depends(get_current_user), db = Depends(get_db)):
    try:
        service = ActivityService(db)
        # Only sessions with at least 2 messages
        items, total = service.list_comparison_sessions(current_user["user_id"], limit=limit, offset=offset, min_messages=2)
        # Attach a small products preview (first up to 3 images)
        try:
            from models import ComparisonProduct, Product
            enriched = []
            for sess in items:
                rows = (
                    db.query(ComparisonProduct)
                    .filter(ComparisonProduct.comparison_id == sess.comparison_id)
                    .limit(3)
                    .all()
                )
                previews = []
                for r in rows:
                    prod = db.query(Product).filter(Product.product_id == r.product_id).first()
                    previews.append({
                        "product_id": r.product_id,
                        "image_url": getattr(prod, "image_url", None),
                    })
                enriched.append({
                    "comparison_id": sess.comparison_id,
                    "session_name": sess.session_name,
                    "original_search_query": sess.original_search_query,
                    "created_at": sess.created_at,
                    "updated_at": sess.updated_at,
                    "products_preview": previews,
                })
            return {"items": enriched, "total": total}
        except Exception:
            return ComparisonSessionListResponse(items=items, total=total)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch comparison sessions: {str(e)}")

@app.delete("/api/compare/sessions")
async def clear_comparison_sessions(current_user = Depends(get_current_user), db = Depends(get_db)):
    try:
        service = ActivityService(db)
        count = service.clear_comparison_sessions(current_user["user_id"])
        return {"cleared": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear comparison sessions: {str(e)}")

@app.get("/api/compare/sessions/{comparison_id}", response_model=ComparisonSessionItem)
async def get_comparison_session(comparison_id: str, current_user = Depends(get_current_user), db = Depends(get_db)):
    try:
        service = ActivityService(db)
        session = service.get_comparison_session(current_user["user_id"], comparison_id)
        if not session:
            raise HTTPException(status_code=404, detail="Comparison session not found")
        return session
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch comparison session: {str(e)}")

@app.get("/api/compare/sessions/{comparison_id}/messages", response_model=ChatMessageListResponse)
async def list_chat_messages(comparison_id: str, limit: int = 50, offset: int = 0, current_user = Depends(get_current_user), db = Depends(get_db)):
    try:
        service = ActivityService(db)
        items, total = service.list_chat_messages(current_user["user_id"], comparison_id, limit=limit, offset=offset)
        return ChatMessageListResponse(items=items, total=total)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch messages: {str(e)}")

class ChatMessageCreateRequest(BaseModel):
    message_content: str

@app.post("/api/compare/sessions/{comparison_id}/messages")
async def add_chat_message(comparison_id: str, body: ChatMessageCreateRequest, current_user = Depends(get_current_user), db = Depends(get_db)):
    try:
        if not body.message_content or not body.message_content.strip():
            raise HTTPException(status_code=400, detail="message_content is required")

        activity = ActivityService(db)
        # Save user message
        user_msg = activity.add_chat_message(
            user_id=current_user["user_id"],
            comparison_id=comparison_id,
            message_type="user",
            message_content=body.message_content.strip(),
        )

        # Generate AI reply synchronously and return it
        session = activity.get_comparison_session(current_user["user_id"], comparison_id)
        if not session:
            raise HTTPException(status_code=404, detail="Comparison session not found")

        # Collect product ids and include enriched snapshot (price, rating, stock, name, image)
        products_rows = activity.list_comparison_products(comparison_id)
        selected_products = []
        try:
            from models import Product, ProductPrice, ProductRating
            for row in products_rows:
                prod = db.query(Product).filter(Product.product_id == row.product_id).first()
                price_row = (
                    db.query(ProductPrice)
                    .filter(ProductPrice.product_id == row.product_id)
                    .order_by(ProductPrice.price_recorded_at.desc())
                    .first()
                )
                rating_row = (
                    db.query(ProductRating)
                    .filter(ProductRating.product_id == row.product_id)
                    .order_by(ProductRating.rating_recorded_at.desc())
                    .first()
                )
                selected_products.append({
                    "id": row.product_id,
                    "platform": (prod.platform_name if prod else None) or "walmart",
                    "url": getattr(prod, "product_url", None),
                    "name": getattr(prod, "product_name", None),
                    "image": getattr(prod, "image_url", None),
                    "price": getattr(price_row, "current_price", None),
                    "original_price": getattr(price_row, "original_price", None),
                    "currency": getattr(price_row, "currency_code", None),
                    "currency_symbol": getattr(price_row, "currency_symbol", None),
                    "in_stock": getattr(price_row, "is_in_stock", None),
                    "rating": getattr(rating_row, "average_rating", None),
                    "total_reviews": getattr(rating_row, "total_review_count", None),
                })
        except Exception:
            selected_products = [{"id": row.product_id, "platform": "walmart"} for row in products_rows]

        if not comparison_service:
            raise HTTPException(status_code=500, detail="Comparison service not configured")

        comp = comparison_service.compare_products(
            selected_products=selected_products,
            user_question=body.message_content.strip(),
            original_search_query=session.original_search_query,
        )

        ai_content = comp.get("ai_analysis") or "I analyzed the products based on your question."
        activity.add_chat_message(
            user_id=current_user["user_id"],
            comparison_id=comparison_id,
            message_type="ai",
            message_content=ai_content,
        )

        return {"ok": True, "ai_message": ai_content}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add message: {str(e)}")

# List products for a comparison session (enriched snapshot)
@app.get("/api/compare/sessions/{comparison_id}/products")
async def list_comparison_products(comparison_id: str, current_user = Depends(get_current_user), db = Depends(get_db)):
    try:
        service = ActivityService(db)
        session = service.get_comparison_session(current_user["user_id"], comparison_id)
        if not session:
            raise HTTPException(status_code=404, detail="Comparison session not found")
        items = service.list_comparison_products(comparison_id)
        # Join with products, latest price and rating to return a rich snapshot for UI
        try:
            from models import Product, ProductPrice, ProductRating
            snapshots = []
            for it in items:
                prod = db.query(Product).filter(Product.product_id == it.product_id).first()
                # Latest price
                price_row = (
                    db.query(ProductPrice)
                    .filter(ProductPrice.product_id == it.product_id)
                    .order_by(ProductPrice.price_recorded_at.desc())
                    .first()
                )
                # Latest rating
                rating_row = (
                    db.query(ProductRating)
                    .filter(ProductRating.product_id == it.product_id)
                    .order_by(ProductRating.rating_recorded_at.desc())
                    .first()
                )
                snapshots.append({
                    "product_id": it.product_id,
                    "product_name": getattr(prod, "product_name", None),
                    "image_url": getattr(prod, "image_url", None),
                    "product_url": getattr(prod, "product_url", None),
                    "platform_name": getattr(prod, "platform_name", None),
                    "price": getattr(price_row, "current_price", None),
                    "original_price": getattr(price_row, "original_price", None),
                    "currency_code": getattr(price_row, "currency_code", None),
                    "currency_symbol": getattr(price_row, "currency_symbol", None),
                    "in_stock": getattr(price_row, "is_in_stock", None),
                    "average_rating": getattr(rating_row, "average_rating", None),
                    "total_reviews": getattr(rating_row, "total_review_count", None),
                })
            return {"products": snapshots}
        except Exception:
            # Fallback to IDs only
            return {"products": [{"product_id": it.product_id} for it in items]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch comparison products: {str(e)}")

@app.patch("/api/compare/sessions/{comparison_id}/products")
async def patch_comparison_products(comparison_id: str, body: SessionProductsPatchRequest, current_user = Depends(get_current_user), db = Depends(get_db)):
    try:
        service = ActivityService(db)
        # Best-effort ensure product exists for FK
        if body.action == 'add':
            try:
                service.ensure_product_exists(
                    product_id=body.product_id,
                    platform_name=body.platform_name,
                    product_name=body.product_name,
                    product_url=body.product_url,
                    image_url=body.image_url,
                    # In future, FE can pass these when available
                    price=getattr(body, 'price', None),
                    original_price=getattr(body, 'original_price', None),
                    currency_code=getattr(body, 'currency_code', None),
                    currency_symbol=getattr(body, 'currency_symbol', None),
                    is_in_stock=getattr(body, 'in_stock', None),
                    average_rating=getattr(body, 'average_rating', None),
                    total_review_count=getattr(body, 'total_reviews', None),
                )
            except Exception:
                pass
            ok = service.add_comparison_product(current_user["user_id"], comparison_id, body.product_id)
        elif body.action == 'remove':
            ok = service.remove_comparison_product(current_user["user_id"], comparison_id, body.product_id)
        else:
            raise HTTPException(status_code=400, detail="Invalid action")
        if not ok:
            # Clarify whether session missing (ownership) vs product not in session
            owned = service.get_comparison_session(current_user["user_id"], comparison_id)
            if not owned:
                raise HTTPException(status_code=403, detail="You do not have access to this comparison session")
            raise HTTPException(status_code=404, detail="Product not found in this comparison session")
        return {"ok": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update comparison products: {str(e)}")

# Lightweight enrich endpoint to fetch best-known details for a list of product ids
class EnrichProductsRequest(PydBaseModel):
    product_ids: List[str]

@app.post("/api/compare/sessions/enrich_session_products")
async def enrich_session_products(body: EnrichProductsRequest, current_user = Depends(get_current_user), db = Depends(get_db)):
    try:
        ids = list(dict.fromkeys([pid for pid in (body.product_ids or []) if pid]))
        if not ids:
            return {"products": []}
        from models import Product, ProductPrice, ProductRating
        out = []
        for pid in ids:
            prod = db.query(Product).filter(Product.product_id == pid).first()
            price_row = (
                db.query(ProductPrice)
                .filter(ProductPrice.product_id == pid)
                .order_by(ProductPrice.price_recorded_at.desc())
                .first()
            )
            rating_row = (
                db.query(ProductRating)
                .filter(ProductRating.product_id == pid)
                .order_by(ProductRating.rating_recorded_at.desc())
                .first()
            )
            out.append({
                "product_id": pid,
                "product_name": getattr(prod, "product_name", None) if prod else None,
                "image_url": getattr(prod, "image_url", None) if prod else None,
                "product_url": getattr(prod, "product_url", None) if prod else None,
                "platform_name": getattr(prod, "platform_name", None) if prod else None,
                "price": getattr(price_row, "current_price", None),
                "original_price": getattr(price_row, "original_price", None),
                "currency_code": getattr(price_row, "currency_code", None),
                "currency_symbol": getattr(price_row, "currency_symbol", None),
                "in_stock": getattr(price_row, "is_in_stock", None),
                "average_rating": getattr(rating_row, "average_rating", None),
                "total_reviews": getattr(rating_row, "total_review_count", None),
            })
        return {"products": out}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to enrich products: {str(e)}")

# ============================================================================
# AUTHENTICATION ENDPOINTS
# ============================================================================

@app.post("/api/auth/register", response_model=AuthResponse)
async def register_user(
    user_data: UserRegisterRequest,
    request: Request,
    db = Depends(get_db)
):
    """
    Register a new user
    
    Args:
        user_data (UserRegisterRequest): User registration data
        request: HTTP request object
        db: Database session
    """
    try:
        user_service = UserService(db)
        success, message, user = user_service.register_user(user_data)
        
        if not success:
            raise HTTPException(status_code=400, detail=message)
        
        # Create user session with IP and User Agent
        access_token, refresh_token = user_service.create_user_session(
            user, 
            ip_address=request.client.host,
            user_agent=request.headers.get("user-agent")
        )
        
        return AuthResponse(
            user=user,
            token={
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer",
                "expires_in": 1800  # 30 minutes
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@app.post("/api/auth/login", response_model=AuthResponse)
async def login_user(
    user_data: UserLoginRequest,
    request: Request,
    db = Depends(get_db)
):
    """
    Login user
    
    Args:
        user_data (UserLoginRequest): User login credentials
        request: HTTP request object
        db: Database session
    """
    try:
        user_service = UserService(db)
        success, message, user = user_service.authenticate_user(user_data.email, user_data.password)
        
        if not success:
            raise HTTPException(status_code=401, detail=message)
        
        # Create user session with IP and User Agent
        access_token, refresh_token = user_service.create_user_session(
            user, 
            ip_address=request.client.host,
            user_agent=request.headers.get("user-agent")
        )
        
        return AuthResponse(
            user=user,
            token={
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer",
                "expires_in": 1800  # 30 minutes
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

class RefreshRequest(BaseModel):
    refresh_token: str

@app.post("/api/auth/refresh", response_model=AuthResponse)
async def refresh_tokens(
    body: RefreshRequest,
    request: Request,
    db = Depends(get_db)
):
    try:
        if not body.refresh_token:
            raise HTTPException(status_code=400, detail="refresh_token is required")
        user_service = UserService(db)
        user, access_token, new_refresh = user_service.refresh_user_session(
            refresh_token=body.refresh_token,
            ip_address=request.client.host,
            user_agent=request.headers.get("user-agent"),
        )
        if not user:
            raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
        return AuthResponse(
            user=user,
            token={
                "access_token": access_token,
                "refresh_token": new_refresh,
                "token_type": "bearer",
                "expires_in": 1800
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Refresh failed: {str(e)}")

@app.get("/api/auth/me")
async def get_current_user_info(
    current_user = Depends(get_current_user)
):
    """
    Get current user information
    
    Args:
        current_user: Current authenticated user
    """
    return current_user

@app.get("/api/auth/sessions")
async def get_user_sessions(
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Get user's active sessions
    
    Args:
        current_user: Current authenticated user
        db: Database session
    """
    try:
        user_service = UserService(db)
        sessions = user_service.get_user_sessions(current_user["user_id"])
        return {"sessions": sessions}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get sessions: {str(e)}")

@app.post("/api/auth/logout")
async def logout_user(
    request: StarletteRequest,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Logout user (deactivate current session)
    
    Args:
        current_user: Current authenticated user
        db: Database session
    """
    try:
        # Invalidate the refresh token provided by the client if present
        token = None
        try:
            body = await request.json()
            token = body.get('refresh_token')
        except Exception:
            token = None
        if token:
            user_service = UserService(db)
            user_service.invalidate_session_by_refresh(token)
        return {"message": "Logged out successfully", "invalidated": bool(token)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Logout failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 







    