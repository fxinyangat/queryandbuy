import requests
import json
from typing import Dict, List, Optional
from fastapi import HTTPException
import os
from dotenv import load_dotenv

load_dotenv()

class GrokService:
    def __init__(self):
        self.api_key = os.getenv("GROK_API_KEY")
        self.base_url = os.getenv("GROK_API_URL", "https://api.x.ai/v1")
        
        if not self.api_key:
            raise ValueError("GROK_API_KEY environment variable is required")
    
    def analyze_products(self, products_data: List[Dict], user_question: str = None, original_search_query: str = None) -> str:
        """
        Analyze products using Grok AI
        
        Args:
            products_data: List of product details including reviews
            user_question: Optional specific question from user
            original_search_query: The original search query that found these products
            
        Returns:
            String containing the AI analysis
        """
        try:
            print(f"GrokService: Analyzing {len(products_data)} products")
            print(f"GrokService: User question: {user_question}")
            print(f"GrokService: Original search query: {original_search_query}")
            
            # Prepare the context with all product information
            context = self._prepare_context(products_data)
            print(f"GrokService: Context length: {len(context)} characters")
            
            # Create the prompt for Grok
            prompt = self._create_prompt(context, user_question, original_search_query)
            print(f"GrokService: Prompt length: {len(prompt)} characters")
            
            # Call Grok API
            response = self._call_grok_api(prompt)
            print(f"GrokService: Response length: {len(response)} characters")
            
            return response
            
        except Exception as e:
            print(f"GrokService: Error in analyze_products: {str(e)}")
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Grok analysis failed: {str(e)}")
    
    def _prepare_context(self, products_data: List[Dict]) -> str:
        """Prepare comprehensive context from product data"""
        context_parts = []
        
        for i, product in enumerate(products_data, 1):
            product_info = f"PRODUCT {i}:\n"
            product_info += f"Name: {product.get('name', 'N/A')}\n"
            product_info += f"Price: ${product.get('price', 'N/A')}\n"
            product_info += f"Rating: {product.get('rating', 'N/A')}/5\n"
            product_info += f"Total Reviews: {product.get('total_reviews', 'N/A')}\n"
            
            # Add detailed product information if available
            if 'details' in product and 'detail' in product['details']:
                detail = product['details']['detail']
                product_info += f"Brand: {detail.get('brand', 'N/A')}\n"
                product_info += f"Description: {detail.get('description', 'N/A')[:500]}...\n"
                
                # Add key features
                if 'key_features' in detail:
                    product_info += "Key Features:\n"
                    for feature in detail['key_features'][:5]:  # Limit to 5 features
                        product_info += f"- {feature}\n"
                
                # Add AI description if available
                if 'gen_ai_description' in detail:
                    product_info += f"AI Analysis: {detail['gen_ai_description']}\n"
                
                # Add review summary
                if 'review_summary_text' in detail:
                    product_info += f"Review Summary: {detail['review_summary_text']}\n"
            
            # Add recent reviews
            if 'reviews' in product and product['reviews']:
                product_info += "Recent Reviews:\n"
                for review in product['reviews'][:3]:  # Limit to 3 reviews
                    product_info += f"- Rating: {review.get('rating', 'N/A')}/5\n"
                    product_info += f"  Title: {review.get('review_title', 'N/A')}\n"
                    product_info += f"  Text: {review.get('review_text', 'N/A')[:200]}...\n"
            
            context_parts.append(product_info)
        
        return "\n\n".join(context_parts)
    
    def _create_prompt(self, context: str, user_question: str = None, original_search_query: str = None) -> str:
        """Create the prompt for Grok AI"""
        
        if user_question:
            prompt = f"""You are a friendly, helpful shopping assistant. The user was looking for: "{original_search_query}"

PRODUCT INFORMATION:
{context}

USER QUESTION: {user_question}

SAFETY GUIDELINES:
- Only provide advice based on the product information provided
- Don't make claims about products you don't have information for
- If you're unsure about something, say so rather than guessing
- Don't give medical, legal, or financial advice
- Don't make absolute claims about product performance or guarantees
- Be honest about limitations of the information available
- If asked about safety, recommend checking official product documentation

IMPORTANT: 
- Answer naturally and conversationally, like a helpful friend
- Don't be overly formal or robotic
- If mentioning their search, say it naturally like "since you're looking for electronics" instead of "based on your search for 'electronics for men'"
- Keep responses concise but friendly
- Use bullet points for clarity when helpful
- Be direct and honest in your advice
- Always remind users to verify information and read product details

If they ask about features, list the key features naturally.
If they ask about comparison, focus on the main differences.
If they ask about value, give a brief, honest assessment.

Sound human and helpful while being safe and responsible!"""
        else:
            prompt = f"""You are a friendly, helpful shopping assistant. The user was looking for: "{original_search_query}"

PRODUCT INFORMATION:
{context}

SAFETY GUIDELINES:
- Only provide advice based on the product information provided
- Don't make claims about products you don't have information for
- If you're unsure about something, say so rather than guessing
- Don't give medical, legal, or financial advice
- Don't make absolute claims about product performance or guarantees
- Be honest about limitations of the information available

Please give a natural, helpful overview of these products. Focus on:
- Key features and benefits
- Price and value assessment  
- Main pros and cons
- Quick recommendation

Keep it conversational and easy to read. Always remind users to verify information and read product details."""
        
        return prompt
    
    def _call_grok_api(self, prompt: str) -> str:
        """Make API call to Grok"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "grok-3-mini",
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "max_tokens": 2000,
            "temperature": 0.7
        }
        
        print(f"GrokService: Making API call to {self.base_url}/v1/chat/completions")
        print(f"GrokService: API Key present: {bool(self.api_key)}")
        print(f"GrokService: Payload keys: {list(payload.keys())}")
        
        try:
            response = requests.post(
                f"{self.base_url}/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=30
            )
            print(f"GrokService: Response status: {response.status_code}")
            print(f"GrokService: Response headers: {dict(response.headers)}")
            
            if not response.ok:
                print(f"GrokService: Error response: {response.text}")
                response.raise_for_status()
            
            result = response.json()
            print(f"GrokService: Response keys: {list(result.keys())}")
            
            return result['choices'][0]['message']['content']
            
        except requests.exceptions.RequestException as e:
            print(f"GrokService: RequestException: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Grok API request failed: {str(e)}")
        except KeyError as e:
            print(f"GrokService: KeyError: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Unexpected response format from Grok API: {str(e)}")
        except Exception as e:
            print(f"GrokService: Unexpected error: {str(e)}")
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Grok API call failed: {str(e)}") 