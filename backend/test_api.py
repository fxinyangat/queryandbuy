#!/usr/bin/env python3
"""
Test script for the Query and Buy API
"""

import requests
import json
import sys

BASE_URL = "http://localhost:8000"

def test_health_check():
    """Test the health check endpoint"""
    print("Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_walmart_search(query="jackets"):
    """Test the Walmart search endpoint"""
    print(f"\nTesting Walmart search with query: '{query}'...")
    try:
        response = requests.get(f"{BASE_URL}/api/search/walmart", params={"query": query, "page": 1})
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Query: {data.get('query')}")
            print(f"Total results: {data.get('total_results')}")
            print(f"Page: {data.get('page')}")
            print(f"Number of products returned: {len(data.get('results', []))}")
            
            # Show first product if available
            if data.get('results'):
                first_product = data['results'][0]
                print(f"First product: {first_product.get('title', 'No title')}")
                print(f"Price: ${first_product.get('price', 'N/A')}")
        else:
            print(f"Error response: {response.text}")
            
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_post_search(query="men jackets"):
    """Test the POST search endpoint"""
    print(f"\nTesting POST search with query: '{query}'...")
    try:
        payload = {
            "query": query,
            "platform": "walmart_search",
            "page": 1
        }
        response = requests.post(f"{BASE_URL}/api/search", json=payload)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Query: {data.get('query')}")
            print(f"Total results: {data.get('total_results')}")
            print(f"Page: {data.get('page')}")
            print(f"Number of products returned: {len(data.get('results', []))}")
        else:
            print(f"Error response: {response.text}")
            
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def main():
    """Run all tests"""
    print("Query and Buy API Test Suite")
    print("=" * 40)
    
    # Test health check
    health_ok = test_health_check()
    
    # Test Walmart search
    walmart_ok = test_walmart_search()
    
    # Test POST search
    post_ok = test_post_search()
    
    print("\n" + "=" * 40)
    print("Test Results:")
    print(f"Health Check: {'✓' if health_ok else '✗'}")
    print(f"Walmart Search: {'✓' if walmart_ok else '✗'}")
    print(f"POST Search: {'✓' if post_ok else '✗'}")
    
    if all([health_ok, walmart_ok, post_ok]):
        print("\nAll tests passed! 🎉")
        return 0
    else:
        print("\nSome tests failed! ❌")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 