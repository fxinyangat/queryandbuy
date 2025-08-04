import requests
import os
from typing import Dict, List, Optional
from fastapi import HTTPException

class AmazonService:
    def __init__(self):
        self.api_key = os.getenv("WALMART_API_KEY")  # Using same API key as mentioned
        self.base_url = "https://data.unwrangle.com/api/getter/?"
        
        if not self.api_key:
            raise ValueError("WALMART_API_KEY environment variable is not set")
    
    def search_products(self, query: str, page: int = 1, platform: str = "amazon_search") -> Dict:
        """
        Search for products on Amazon using the unwrangle API
        
        Args:
            query (str): Search query
            page (int): Page number for pagination
            platform (str): Platform to search (default: amazon_search)
            
        Returns:
            Dict: Search results containing products and metadata
        """
        url = f"{self.base_url}platform={platform}&search={query}&page={page}&api_key={self.api_key}"
        
        try:
            response = requests.get(url)
            response.raise_for_status()
            results = response.json()
            
            # Standardize the response format
            return {
                "query": query,
                "results": results.get("results", []),
                "total_results": results.get("total_results", 0),
                "page": page,
                "platform": platform
            }
            
        except requests.exceptions.RequestException as e:
            raise HTTPException(
                status_code=500, 
                detail=f"Amazon API request failed: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=500, 
                detail=f"Unexpected error during Amazon search: {str(e)}"
            )
    
    def get_product_details(self, product_id: str, platform: str = "amazon_detail") -> Dict:
        """
        Get detailed information about a specific product
        
        Args:
            product_id (str): Product ID
            platform (str): Platform for product details (default: amazon_detail)
            
        Returns:
            Dict: Product details
        """
        url = f"{self.base_url}platform={platform}&item_id={product_id}&api_key={self.api_key}"
        
        try:
            response = requests.get(url)
            response.raise_for_status()
            results = response.json()
            
            return {
                "id": product_id,
                "platform": platform,
                "details": results
            }
            
        except requests.exceptions.RequestException as e:
            raise HTTPException(
                status_code=500, 
                detail=f"Amazon product details API request failed: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=500, 
                detail=f"Unexpected error during Amazon product details request: {str(e)}"
            )
    
    def get_product_reviews(self, url: str, page: int = 1, platform: str = "amazon_reviews") -> Dict:
        """
        Get reviews for a specific product
        
        Args:
            url (str): Product URL
            page (int): Page number for pagination (default: 1)
            platform (str): Platform for reviews (default: amazon_reviews)
            
        Returns:
            Dict: Product reviews
        """
        # URL encode the product URL to handle special characters
        import urllib.parse
        encoded_url = urllib.parse.quote(url, safe='')
        
        api_url = f"{self.base_url}url={encoded_url}&page={page}&platform={platform}&api_key={self.api_key}"
        
        try:
            response = requests.get(api_url)
            response.raise_for_status()
            results = response.json()
            
            # Handle the actual API response structure
            return {
                "url": results.get("url", url),
                "page": results.get("page", page),
                "reviews": results.get("reviews", []),
                "total_results": results.get("total_results", 0),
                "success": results.get("success", False),
                "platform": results.get("platform", platform),
                "no_of_pages": results.get("no_of_pages", 0),
                "result_count": results.get("result_count", 0),
                "credits_used": results.get("credits_used", 0),
                "remaining_credits": results.get("remaining_credits", 0)
            }
            
        except requests.exceptions.RequestException as e:
            raise HTTPException(
                status_code=500, 
                detail=f"Amazon product reviews API request failed: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=500, 
                detail=f"Unexpected error during Amazon product reviews request: {str(e)}"
            )
    
    def format_product_data(self, raw_product: Dict) -> Dict:
        """
        Format raw product data from Amazon API to standardized format
        
        Args:
            raw_product (Dict): Raw product data from API
            
        Returns:
            Dict: Formatted product data
        """
        return {
            "id": raw_product.get("id", ""),
            "title": raw_product.get("title", ""),
            "price": raw_product.get("price", 0.0),
            "original_price": raw_product.get("original_price", 0.0),
            "rating": raw_product.get("rating", 0.0),
            "review_count": raw_product.get("review_count", 0),
            "image_url": raw_product.get("image_url", ""),
            "product_url": raw_product.get("product_url", ""),
            "availability": raw_product.get("availability", "Unknown"),
            "platform": "amazon"
        } 