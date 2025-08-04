import React, { useState } from 'react';
import Header from './components/header/Header';
import SearchBar from './components/search/SearchBar';
import Logo from './components/common/Logo';
import ResultsGrid from './components/results/ResultsGrid';
import ProductDetail from './components/product/ProductDetail';
import { COLORS } from './styles/colors';
import logo from './assets/logo.png'; // Make sure to add the logo to this path
import Sidebar from './components/sidebar/Sidebar';
import CompareBar from './components/comparison/CompareBar';
import ComparisonView from './components/comparison/ComparisonView';
import { API_BASE_URL } from './config';
import './App.css';

function App() {
    const [hasSearched, setHasSearched] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [searchHistory, setSearchHistory] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [isComparing, setIsComparing] = useState(false);
    const [searchError, setSearchError] = useState(null);

    // Update the mock products with AI insights
    const mockProducts = [
        {
            id: 1,
            image: 'https://picsum.photos/300/300',
            title: 'Wireless Noise Cancelling Headphones',
            price: 299.99,
            originalPrice: 399.99,
            rating: 4.5,
            reviews: 128,
            source: 'Amazon',
            shipping: 'Free Shipping',
            aiInsights: "Great noise cancellation for busy environments, but battery life is average at 20 hours. Perfect for commuters who prioritize sound quality."
        },
        {
            id: 2,
            image: 'https://picsum.photos/300/301',
            title: 'Smart 4K Ultra HD TV 55"',
            price: 699.99,
            originalPrice: 899.99,
            rating: 4.8,
            reviews: 256,
            source: 'Best Buy',
            shipping: 'Free Shipping',
            aiInsights: "Excellent color accuracy and HDR performance. Gaming mode has low 12ms latency, but built-in speakers are just average."
        },
        {
            id: 3,
            image: 'https://picsum.photos/301/300',
            title: 'Premium Coffee Maker with Grinder',
            price: 199.99,
            rating: 4.7,
            reviews: 89,
            source: 'Target',
            shipping: '2-Day Delivery',
            aiInsights: "Built-in grinder ensures fresh coffee. Programmable features are great, but cleaning requires extra attention."
        },
        {
            id: 4,
            image: 'https://picsum.photos/300/302',
            title: 'Ergonomic Office Chair',
            price: 249.99,
            originalPrice: 299.99,
            rating: 4.6,
            reviews: 167,
            source: 'Walmart',
            shipping: 'Free Shipping',
            aiInsights: "Strong lumbar support and adjustable armrests. Great for 8-hour workdays, though assembly takes about 30 minutes."
        },
        {
            id: 5,
            image: 'https://picsum.photos/300/303',
            title: 'Wireless Gaming Mouse',
            price: 79.99,
            rating: 4.7,
            reviews: 342,
            source: 'Amazon',
            shipping: 'Free Shipping',
            aiInsights: "Excellent 16000 DPI sensor and ergonomic design. Battery lasts 70 hours but slightly heavier than wired alternatives."
        },
        {
            id: 6,
            image: 'https://picsum.photos/300/304',
            title: 'Smart 4K Ultra HD TV 55"',
            price: 699.99,
            originalPrice: 899.99,
            rating: 4.8,
            reviews: 256,
            source: 'Best Buy',
            shipping: 'Free Shipping',
            aiInsights: "Excellent color accuracy and HDR performance. Gaming mode has low 12ms latency, but built-in speakers are just average."
        },
        {
            id: 7,
            image: 'https://picsum.photos/301/300',
            title: 'Premium Coffee Maker with Grinder',
            price: 199.99,
            rating: 4.7,
            reviews: 89,
            source: 'Target',
            shipping: '2-Day Delivery',
            aiInsights: "Built-in grinder ensures fresh coffee. Programmable features are great, but cleaning requires extra attention."
        },
        {
            id: 8,
            image: 'https://picsum.photos/300/302',
            title: 'Ergonomic Office Chair',
            price: 249.99,
            originalPrice: 299.99,
            rating: 4.6,
            reviews: 167,
            source: 'Walmart',
            shipping: 'Free Shipping',
            aiInsights: "Strong lumbar support and adjustable armrests. Great for 8-hour workdays, though assembly takes about 30 minutes."
        },
        {
            id: 9,
            image: 'https://picsum.photos/300/305',
            title: 'Wireless Noise Cancelling Headphones',
            price: 299.99,
            originalPrice: 399.99,
            rating: 4.5,
            reviews: 128,
            source: 'Amazon',
            shipping: 'Free Shipping',
            aiInsights: "Great noise cancellation for busy environments, but battery life is average at 20 hours. Perfect for commuters who prioritize sound quality."
        },
        {
            id: 10,
            image: 'https://picsum.photos/300/306',
            title: 'Smart 4K Ultra HD TV 55"',
            price: 699.99,
            originalPrice: 899.99,
            rating: 4.8,
            reviews: 256,
            source: 'Best Buy',
            shipping: 'Free Shipping',
            aiInsights: "Excellent color accuracy and HDR performance. Gaming mode has low 12ms latency, but built-in speakers are just average."
        },
        {
            id: 11,
            image: 'https://picsum.photos/301/300',
            title: 'Premium Coffee Maker with Grinder',
            price: 199.99,
            rating: 4.7,
            reviews: 89,
            source: 'Target',
            shipping: '2-Day Delivery',
            aiInsights: "Built-in grinder ensures fresh coffee. Programmable features are great, but cleaning requires extra attention."
        },
        {
            id: 12,
            image: 'https://picsum.photos/300/302',
            title: 'Ergonomic Office Chair',
            price: 249.99,
            originalPrice: 299.99,
            rating: 4.6,
            reviews: 167,
            source: 'Walmart',
            shipping: 'Free Shipping',
            aiInsights: "Strong lumbar support and adjustable armrests. Great for 8-hour workdays, though assembly takes about 30 minutes."
        },
        {
            id: 13,
            image: 'https://picsum.photos/300/307',
            title: 'Wireless Noise Cancelling Headphones',
            price: 299.99,
            originalPrice: 399.99,
            rating: 4.5,
            reviews: 128,
            source: 'Amazon',
            shipping: 'Free Shipping',
            aiInsights: "Great noise cancellation for busy environments, but battery life is average at 20 hours. Perfect for commuters who prioritize sound quality."
        },
        {
            id: 14,
            image: 'https://picsum.photos/300/308',
            title: 'Smart 4K Ultra HD TV 55"',
            price: 699.99,
            originalPrice: 899.99,
            rating: 4.8,
            reviews: 256,
            source: 'Best Buy',
            shipping: 'Free Shipping',
            aiInsights: "Excellent color accuracy and HDR performance. Gaming mode has low 12ms latency, but built-in speakers are just average."
        },
        {
            id: 15,
            image: 'https://picsum.photos/301/300',
            title: 'Premium Coffee Maker with Grinder',
            price: 199.99,
            rating: 4.7,
            reviews: 89,
            source: 'Target',
            shipping: '2-Day Delivery',
            aiInsights: "Built-in grinder ensures fresh coffee. Programmable features are great, but cleaning requires extra attention."
        },
        {
            id: 16,
            image: 'https://picsum.photos/300/302',
            title: 'Ergonomic Office Chair',
            price: 249.99,
            originalPrice: 299.99,
            rating: 4.6,
            reviews: 167,
            source: 'Walmart',
            shipping: 'Free Shipping',
            aiInsights: "Strong lumbar support and adjustable armrests. Great for 8-hour workdays, though assembly takes about 30 minutes."
        },
        {
            id: 17,
            image: 'https://picsum.photos/300/309',
            title: 'Wireless Noise Cancelling Headphones',
            price: 299.99,
            originalPrice: 399.99,
            rating: 4.5,
            reviews: 128,
            source: 'Amazon',
            shipping: 'Free Shipping',
            aiInsights: "Great noise cancellation for busy environments, but battery life is average at 20 hours. Perfect for commuters who prioritize sound quality."
        },
        {
            id: 18,
            image: 'https://picsum.photos/300/310',
            title: 'Smart 4K Ultra HD TV 55"',
            price: 699.99,
            originalPrice: 899.99,
            rating: 4.8,
            reviews: 256,
            source: 'Best Buy',
            shipping: 'Free Shipping',
            aiInsights: "Excellent color accuracy and HDR performance. Gaming mode has low 12ms latency, but built-in speakers are just average."
        },
        {
            id: 19,
            image: 'https://picsum.photos/301/300',
            title: 'Premium Coffee Maker with Grinder',
            price: 199.99,
            rating: 4.7,
            reviews: 89,
            source: 'Target',
            shipping: '2-Day Delivery',
            aiInsights: "Built-in grinder ensures fresh coffee. Programmable features are great, but cleaning requires extra attention."
        },
        {
            id: 20,
            image: 'https://picsum.photos/300/302',
            title: 'Ergonomic Office Chair',
            price: 249.99,
            originalPrice: 299.99,
            rating: 4.6,
            reviews: 167,
            source: 'Walmart',
            shipping: 'Free Shipping',
            aiInsights: "Strong lumbar support and adjustable armrests. Great for 8-hour workdays, though assembly takes about 30 minutes."
        }
    ];

    const handleSearch = async (query) => {
        setIsLoading(true);
        setHasSearched(true);
        
        // Store the search query for use in comparison
        localStorage.setItem('lastSearchQuery', query);
        
        // Add to search history if not already present
        if (query && !searchHistory.includes(query)) {
            setSearchHistory(prev => [query, ...prev].slice(0, 10));
        }
        
        try {
            setSearchError(null); // Clear any previous errors
            // Call the Walmart API
            const response = await fetch(`${API_BASE_URL}/api/search/walmart?query=${encodeURIComponent(query)}&page=1`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();

            console.log("original products list from walmart api",data)
            
            // Transform the API response to match frontend format
            const transformedResults = data.results.map(product => ({
                id: product.id,
                image: product.image_url || product.thumbnail,
                thumbnail: product.thumbnail,
                title: product.name,
                price: product.price,
                originalPrice: product.price_reduced || null,
                rating: product.rating,
                reviews: product.total_reviews,
                source: 'Walmart',
                shipping: product.in_stock ? 'In Stock' : 'Out of Stock',
                aiInsights: "Great value for money with good customer reviews. Free shipping available and competitive pricing compared to other retailers.",
                url: product.url,
                currency: product.currency,
                currency_symbol: product.currency_symbol,
                model_no: product.model_no,
                seller_name: product.seller_name,
                is_sponsored: product.is_sponsored
            }));
            
            console.log("transformed products list from walmart api",transformedResults)
            setSearchResults(transformedResults);
        } catch (error) {
            console.error('Search failed:', error);
            setSearchError('Failed to fetch search results. Please try again.');
            // Fallback to mock data if API fails
            setSearchResults(mockProducts);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProductSelect = async (product) => {
        console.log("=== PRODUCT SELECT STARTED ===");
        console.log("Selected product:", product);
        console.log("Product ID:", product.id);
        console.log("Product ID type:", typeof product.id);
        
        setSelectedProduct(product);
        // Add class to prevent body scroll when detail is open
        document.body.style.overflow = 'hidden';
        
        // Optionally fetch additional product details if we have a product ID
        if (product.id && typeof product.id === 'string') {
            console.log("Making API call for product details...");
            try {
                const apiUrl = `${API_BASE_URL}/api/product/${product.id}?platform=walmart_detail`;
                console.log("API URL:", apiUrl);
                
                console.log("Starting fetch request...");
                let response;
                try {
                    response = await fetch(apiUrl);
                    console.log("Fetch completed!");
                    console.log("API Response status:", response.status);
                    console.log("API Response ok:", response.ok);
                } catch (fetchError) {
                    console.error("Fetch error:", fetchError);
                    console.error("Fetch error message:", fetchError.message);
                    throw fetchError;
                }
                
                if (response.ok) {
                    const detailData = await response.json();

                    console.log("=== PRODUCT DETAILS API RESPONSE ===");
                    console.log("Full API Response:", detailData);
                    console.log("Details object:", detailData.details);
                    console.log("Images array:", detailData.details?.images);
                    console.log("Image URL:", detailData.details?.image_url);
                    console.log("All available keys in details:", Object.keys(detailData.details || {}));
                    console.log("=== END PRODUCT DETAILS API RESPONSE ===");
                    
                    // Extract images from the details response
                    const productImages = [];
                    const productVariants = [];
                    
                    // Add main images array if available (from details.detail.images)
                    if (detailData.details && detailData.details.detail && detailData.details.detail.images && Array.isArray(detailData.details.detail.images)) {
                        detailData.details.detail.images.forEach(img => {
                            if (img && !productImages.includes(img)) {
                                productImages.push(img);
                            }
                        });
                    }
                    
                    // Add variant images if available (from details.detail.variants)
                    if (detailData.details && detailData.details.detail && detailData.details.detail.variants && Array.isArray(detailData.details.detail.variants)) {
                        detailData.details.detail.variants.forEach(variant => {
                            if (variant.image_urls && Array.isArray(variant.image_urls) && variant.image_urls.length > 0) {
                                variant.image_urls.forEach(img => {
                                    if (img && !productImages.includes(img)) {
                                        productImages.push(img);
                                    }
                                });
                            }
                            // Store variants for UI
                            productVariants.push(variant);
                        });
                    }
                    
                    console.log("Extracted product images:", productImages);
                    console.log("Product variants:", productVariants);
                    
                    // Update the product with additional details, images, and variants
                    setSelectedProduct(prev => ({
                        ...prev,
                        details: detailData.details,
                        productImages: productImages,
                        productVariants: productVariants
                    }));
                }
            } catch (error) {
                console.error('=== API CALL FAILED ===');
                console.error('Failed to fetch product details:', error);
                console.error('Error details:', error.message);
                // Continue with existing product data
            }
        } else {
            console.log("No product ID or invalid ID type, skipping API call");
        }
        console.log("=== PRODUCT SELECT ENDED ===");
    };

    const handleCloseDetail = () => {
        setSelectedProduct(null);
        // Restore body scroll
        document.body.style.overflow = 'auto';
    };

    const handleHistoryItemClick = (query) => {
        handleSearch(query);
        setIsSidebarExpanded(false);
    };

    const handleClearHistory = () => {
        setSearchHistory([]);
    };

    const toggleSidebar = () => {
        setIsSidebarExpanded(!isSidebarExpanded);
    };

    const handleCompareToggle = (product) => {
        setSelectedProducts(prev => {
            const isSelected = prev.some(p => p.id === product.id);
            if (isSelected) {
                return prev.filter(p => p.id !== product.id);
            }
            // Allow 1-4 products
            if (prev.length < 4) {
                return [...prev, product];
            }
            return prev;
        });
    };

    const startComparison = () => {
        setIsComparing(true);
    };

    const handleCloseComparison = () => {
        setIsComparing(false);
        setSelectedProducts([]);
    };

    const handleRemoveProduct = (productId) => {
        setSelectedProducts(prev => prev.filter(product => product.id !== productId));
    };

    return (
        <div className={`App ${hasSearched ? 'search-mode' : ''} ${isSidebarExpanded ? 'sidebar-expanded' : ''}`}>
            <Header>
                {hasSearched && (
                    <Logo 
                        src={logo} 
                        isCollapsed={hasSearched}
                    />
                )}
            </Header>
            <Sidebar 
                isExpanded={isSidebarExpanded}
                onToggle={toggleSidebar}
                searchHistory={searchHistory}
                onHistoryItemClick={handleHistoryItemClick}
                onClearHistory={handleClearHistory}
            />
            <main className="main-content">
                {!hasSearched && (
                    <Logo 
                        src={logo} 
                        tagline="Query and Buy anything anywhere in natural language"
                        isCollapsed={hasSearched}
                    />
                )}
                <SearchBar 
                    onSearch={handleSearch}
                    isExpanded={!hasSearched}
                />
                {hasSearched && (
                    <>
                        {searchError && (
                            <div className="error-message">
                                <p>{searchError}</p>
                                <button onClick={() => setSearchError(null)}>Dismiss</button>
                            </div>
                        )}
                        
                        {isLoading ? (
                            <ResultsGrid 
                                results={[]}
                                isLoading={true}
                                onProductSelect={handleProductSelect}
                                isCompareMode={true}
                                selectedProducts={selectedProducts}
                                onCompareToggle={handleCompareToggle}
                            />
                        ) : (
                            <ResultsGrid 
                                results={searchResults}
                                isLoading={false}
                                onProductSelect={handleProductSelect}
                                isCompareMode={true}
                                selectedProducts={selectedProducts}
                                onCompareToggle={handleCompareToggle}
                            />
                        )}
                    </>
                )}
                {selectedProducts.length > 0 && (
                    <CompareBar 
                        selectedProducts={selectedProducts}
                        onStartComparison={startComparison}
                        onRemoveProduct={handleCompareToggle}
                        buttonText={selectedProducts.length === 1 ? 
                            "Ask Shop-pilot" : 
                            "Ask Shop-pilot"
                        }
                    />
                )}
                {selectedProduct && (
                    <ProductDetail 
                        product={selectedProduct}
                        onClose={handleCloseDetail}
                    />
                )}
                {isComparing && (
                    <ComparisonView 
                        products={selectedProducts}
                        onClose={handleCloseComparison}
                        onRemoveProduct={handleRemoveProduct}
                    />
                )}
            </main>
        </div>
    );
}

export default App; 