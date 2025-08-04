from typing import Dict, List
import aiohttp
import asyncio
from .query_processor import QueryProcessor

class SearchService:
    def __init__(self):
        self.query_processor = QueryProcessor()
        
    async def search(self, query: str) -> Dict:
        # Process the natural language query
        query_params = self.query_processor.process_query(query)
        
        # For MVP, just search Amazon
        results = await self._search_amazon(query_params)
        
        # Basic ranking (just price and rating for now)
        ranked_results = self._rank_results(results)
        
        return {
            "query": query,
            "products": ranked_results
        }
    
    async def _search_amazon(self, params: Dict) -> List[Dict]:
        # TODO: Implement Amazon API call
        # For MVP, return mock data
        return [
            {
                "id": "123",
                "title": "Sample Product",
                "price": 99.99,
                "rating": 4.5,
                "image": "https://example.com/image.jpg",
                "url": "https://amazon.com/product/123"
            }
        ]
    
    def _rank_results(self, results: List[Dict]) -> List[Dict]:
        # Simple ranking by rating and price
        return sorted(
            results,
            key=lambda x: (x.get('rating', 0), -x.get('price', 0))
        ) 
    