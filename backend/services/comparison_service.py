import asyncio
from typing import Dict, List, Optional
from fastapi import HTTPException
from .walmart_service import WalmartService
from .amazon_service import AmazonService
from .grok_service import GrokService

class ComparisonService:
    def __init__(self):
        self.walmart_service = WalmartService()
        self.amazon_service = AmazonService()
        self.grok_service = GrokService()
    
    def compare_products(self, selected_products: List[Dict], user_question: str = None, original_search_query: str = None) -> Dict:
        """
        Compare selected products using AI analysis
        
        Args:
            selected_products: List of products with basic info (id, platform, url, etc.)
            user_question: Optional specific question from user
            original_search_query: The original search query that found these products
            
        Returns:
            Dict containing AI analysis of the products
        """
        try:
            print(f"Starting comparison for {len(selected_products)} products")
            print(f"User question: {user_question}")
            print(f"Original search query: {original_search_query}")
            
            # Fetch detailed information for all selected products
            enriched_products = self._fetch_all_product_data(selected_products)
            print(f"Enriched {len(enriched_products)} products with details")
            
            # Generate AI analysis using Grok (synchronous call)
            ai_analysis = self.grok_service.analyze_products(
                products_data=enriched_products,
                user_question=user_question,
                original_search_query=original_search_query
            )
            
            return {
                "ai_analysis": ai_analysis,
                "products_analyzed": len(enriched_products),
                "original_search_query": original_search_query,
                "user_question": user_question
            }
            
        except Exception as e:
            print(f"Error in compare_products: {str(e)}")
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Product comparison failed: {str(e)}")
    
    def _fetch_all_product_data(self, selected_products: List[Dict]) -> List[Dict]:
        """Fetch product details and reviews for all selected products"""
        enriched_products = []
        
        for product in selected_products:
            try:
                # Fetch product details
                product_details = self._get_product_details(product)
                
                # Fetch product reviews
                product_reviews = self._get_product_reviews(product)
                
                # Combine all information
                enriched_product = {
                    **product,  # Keep original product info
                    "details": product_details.get("details", {}),
                    "reviews": product_reviews.get("reviews", [])
                }
                
                enriched_products.append(enriched_product)
                
            except Exception as e:
                print(f"Error fetching data for product {product.get('id')}: {str(e)}")
                # Add product with basic info if detailed fetch fails
                enriched_products.append(product)
        
        return enriched_products
    
    def _get_product_details(self, product: Dict) -> Dict:
        """Get detailed product information"""
        product_id = product.get('id')
        platform = product.get('platform', 'walmart')
        
        if platform == 'walmart' or platform == 'walmart_detail':
            return self.walmart_service.get_product_details(product_id, "walmart_detail")
        elif platform == 'amazon' or platform == 'amazon_detail':
            return self.amazon_service.get_product_details(product_id, "amazon_detail")
        else:
            # Default to Walmart
            return self.walmart_service.get_product_details(product_id, "walmart_detail")
    
    def _get_product_reviews(self, product: Dict) -> Dict:
        """Get product reviews"""
        product_url = product.get('url')
        platform = product.get('platform', 'walmart')
        
        if not product_url:
            return {"reviews": [], "total_results": 0}
        
        if platform == 'walmart' or platform == 'walmart_reviews':
            return self.walmart_service.get_product_reviews(product_url, 1, "walmart_reviews")
        elif platform == 'amazon' or platform == 'amazon_reviews':
            return self.amazon_service.get_product_reviews(product_url, 1, "amazon_reviews")
        else:
            # Default to Walmart
            return self.walmart_service.get_product_reviews(product_url, 1, "walmart_reviews") 