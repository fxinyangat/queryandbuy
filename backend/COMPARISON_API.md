# Product Comparison API with Grok AI Integration

## Overview

The Product Comparison API provides AI-powered analysis of selected products using Grok AI. It fetches detailed product information and reviews, then generates comprehensive comparisons and answers user questions.

## Environment Variables

Add these to your `.env` file:

```bash
# Grok AI API Configuration
GROK_API_KEY=your_grok_api_key_here
GROK_API_URL=https://api.x.ai/v1

# Existing Walmart/Amazon API keys (same as before)
WALMART_API_KEY=your_walmart_api_key_here
AMAZON_API_KEY=your_amazon_api_key_here
```

## API Endpoints

### POST `/api/compare`

Generate AI-powered comparison analysis for selected products.

**Request Body:**
```json
{
  "products": [
    {
      "id": "product_id_1",
      "platform": "walmart",
      "url": "product_url_1",
      "name": "Product Name",
      "price": 29.99,
      "rating": 4.5
    },
    {
      "id": "product_id_2", 
      "platform": "amazon",
      "url": "product_url_2",
      "name": "Product Name 2",
      "price": 34.99,
      "rating": 4.2
    }
  ],
  "user_question": "Which product offers the best value for money?"
}
```

**Response:**
```json
{
  "products": [
    {
      "id": "product_id_1",
      "platform": "walmart",
      "name": "Product Name",
      "price": 29.99,
      "rating": 4.5,
      "details": {
        "detail": {
          "description": "Product description...",
          "key_features": ["Feature 1", "Feature 2"],
          "gen_ai_description": "AI analysis...",
          "review_summary_text": "Customer reviews summary..."
        }
      },
      "reviews": [
        {
          "rating": 5,
          "review_title": "Great product!",
          "review_text": "Excellent quality...",
          "date": "2024-01-15",
          "author_name": "John Doe"
        }
      ],
      "review_summary": {
        "total_reviews": 150,
        "average_rating": 4.5,
        "review_highlights": [...]
      }
    }
  ],
  "ai_analysis": {
    "analysis": "Comprehensive AI analysis of the products...",
    "products_analyzed": 2,
    "user_question": "Which product offers the best value for money?",
    "context_summary": {
      "total_products": 2,
      "total_reviews": 300,
      "price_range": {
        "min": 29.99,
        "max": 34.99,
        "avg": 32.49
      }
    }
  },
  "comparison_metadata": {
    "total_products": 2,
    "platforms": ["walmart", "amazon"],
    "price_range": {
      "min": 29.99,
      "max": 34.99,
      "avg": 32.49
    },
    "rating_range": {
      "min": 4.2,
      "max": 4.5,
      "avg": 4.35
    }
  }
}
```

### GET `/api/compare/health`

Health check endpoint for the comparison service.

**Response:**
```json
{
  "status": "healthy",
  "services": {
    "walmart": true,
    "amazon": true,
    "comparison": true
  }
}
```

## Features

### AI-Powered Analysis
- **Comprehensive Context**: Uses detailed product information, reviews, and specifications
- **Smart Comparisons**: Analyzes price, quality, features, and customer satisfaction
- **User Questions**: Answers specific user questions about the products
- **Actionable Recommendations**: Provides clear recommendations and reasoning

### Data Enrichment
- **Product Details**: Fetches complete product specifications and descriptions
- **Customer Reviews**: Analyzes recent reviews and sentiment
- **Review Highlights**: Extracts key insights from customer feedback
- **Cross-Platform**: Supports both Walmart and Amazon products

### Intelligent Prompting
- **Context-Aware**: Creates prompts based on available product data
- **Question-Specific**: Adapts analysis to user's specific questions
- **Structured Output**: Provides organized, easy-to-read analysis
- **Data-Driven**: Uses specific metrics and review data

## Usage Examples

### Basic Comparison
```bash
curl -X POST "http://localhost:8000/api/compare" \
  -H "Content-Type: application/json" \
  -d '{
    "products": [
      {"id": "123", "platform": "walmart", "url": "https://walmart.com/product/123"},
      {"id": "456", "platform": "amazon", "url": "https://amazon.com/product/456"}
    ]
  }'
```

### Comparison with Question
```bash
curl -X POST "http://localhost:8000/api/compare" \
  -H "Content-Type: application/json" \
  -d '{
    "products": [
      {"id": "123", "platform": "walmart", "url": "https://walmart.com/product/123"},
      {"id": "456", "platform": "amazon", "url": "https://amazon.com/product/456"}
    ],
    "user_question": "Which product is better for daily use?"
  }'
```

## Error Handling

- **400 Bad Request**: Invalid input (no products, too many products)
- **500 Internal Server Error**: API service issues or Grok API failures
- **Graceful Degradation**: Continues with basic product info if detailed fetch fails

## Rate Limits

- Maximum 5 products per comparison
- Grok API rate limits apply
- Consider implementing caching for repeated comparisons 