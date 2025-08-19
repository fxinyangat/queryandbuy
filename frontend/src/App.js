import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Header from './components/header/Header';
import SearchBar from './components/search/SearchBar';
import Logo from './components/common/Logo';
import ResultsGrid from './components/results/ResultsGrid';
import ProductDetail from './components/product/ProductDetail';
import { COLORS } from './styles/colors';
import logo from './assets/logo.png';
import Sidebar from './components/sidebar/Sidebar';
import CompareBar from './components/comparison/CompareBar';
import ComparisonView from './components/comparison/ComparisonView';
import CompareMini from './components/comparison/CompareMini';
import ResumeChatButton from './components/comparison/ResumeChatButton';
import ComparisonHistory from './components/sidebar/ComparisonHistory';
import { API_BASE_URL } from './config';
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCompareContext } from './contexts/CompareContext';

function App() {
    const [hasSearched, setHasSearched] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [searchHistory, setSearchHistory] = useState([]);
    const { selectedProducts, setSelectedProducts, activeComparisonSessionId, setActiveComparisonSessionId, isCompareMinimized, setIsCompareMinimized, enrichProducts } = useCompareContext();
    const [isComparing, setIsComparing] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [comparisonHistory, setComparisonHistory] = useState([]);
    const [isEnriching, setIsEnriching] = useState(false);
    const historyDebounceRef = React.useRef(null);
    const [currentToken, setCurrentToken] = useState(() => (typeof window !== 'undefined' ? (sessionStorage.getItem('token') || 'anon') : 'anon'));
    const authKey = typeof window !== 'undefined' ? (sessionStorage.getItem('token') || 'anon') : 'anon';

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

    const handleSearch = async (query, options = {}) => {
        const { log = true } = options;
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
            // Prefer unified POST /api/search so we can include auth and log search history
            const headers = { 'Content-Type': 'application/json' };
            const authToken = sessionStorage.getItem('token');
            if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

            const response = await fetch(`${API_BASE_URL}/api/search`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ query, platform: 'walmart_search', page: 1, log }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            
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
                // Use CompareContext detail cache to avoid re-fetching this id during the session
                const detailData = await (async () => {
                    const fetcher = async () => {
                        const res = await fetch(apiUrl);
                        if (!res.ok) throw new Error(`HTTP ${res.status}`);
                        return res.json();
                    };
                    // Lazy import to avoid circular: we use a global helper
                    // We rely on window._compareDetailCache set by provider; fallback to direct fetch
                    try {
                        const ctx = require('./contexts/CompareContext');
                        const { useCompareContext } = ctx;
                    } catch (_) {}
                    try {
                        // Use global from provider via session storage bridge
                        if (window.__getProductDetailCached) {
                            return await window.__getProductDetailCached(product.id, fetcher);
                        }
                    } catch (_) {}
                    return await fetcher();
                })();

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

    const handleHistoryItemClick = (query, options = {}) => {
        if (historyDebounceRef.current) clearTimeout(historyDebounceRef.current);
        historyDebounceRef.current = setTimeout(() => {
            handleSearch(query, options);
            setIsSidebarExpanded(false);
        }, 250);
    };

    const handleClearHistory = () => {
        setSearchHistory([]);
    };

    const toggleSidebar = () => {
        setIsSidebarExpanded(!isSidebarExpanded);
    };

    const handleCompareToggle = async (product) => {
        const isSelected = selectedProducts.some(p => p.id === product.id);
        // Optimistic UI update
        setSelectedProducts(prev => {
            if (isSelected) {
                return prev.filter(p => p.id !== product.id);
            }
            if (prev.length < 4) {
                return [...prev, product];
            }
            return prev;
        });

        // If a session is active, sync to backend
        try {
            if (activeComparisonSessionId) {
                const token = sessionStorage.getItem('token');
                if (token) {
                    const action = isSelected ? 'remove' : 'add';
                    await fetch(`${API_BASE_URL}/api/compare/sessions/${activeComparisonSessionId}/products`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({
                            action,
                            product_id: product.id,
                            platform_name: product.source,
                            product_name: product.title,
                            product_url: product.url,
                            image_url: product.image,
                            price: typeof product.price === 'number' ? product.price : undefined,
                            original_price: typeof product.originalPrice === 'number' ? product.originalPrice : undefined,
                            currency_code: product.currency || undefined,
                            currency_symbol: product.currency_symbol || undefined,
                            in_stock: typeof product.in_stock === 'boolean' ? product.in_stock : undefined,
                            average_rating: typeof product.rating === 'number' ? product.rating : undefined,
                            total_reviews: typeof product.reviews === 'number' ? product.reviews : undefined,
                        }),
                    });
                }
            }
        } catch (_) {}
    };

    const startComparison = async () => {
        try {
            const authToken = sessionStorage.getItem('token');
            if (authToken && selectedProducts.length > 0) {
                const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` };
                // If a session already exists, sync product set instead of creating a new session
                if (activeComparisonSessionId) {
                    try {
                        const curRes = await fetch(`${API_BASE_URL}/api/compare/sessions/${activeComparisonSessionId}/products`, { headers: { 'Authorization': `Bearer ${authToken}` } });
                        if (curRes.ok) {
                            const curData = await curRes.json();
                            const currentIds = new Set((curData.products || []).map(p => p.product_id));
                            const desiredIds = new Set(selectedProducts.map(p => p.id));
                            const toAdd = [...desiredIds].filter(id => !currentIds.has(id));
                            const toRemove = [...currentIds].filter(id => !desiredIds.has(id));
                            await Promise.all([
                                ...toAdd.map(id => fetch(`${API_BASE_URL}/api/compare/sessions/${activeComparisonSessionId}/products`, {
                                    method: 'PATCH',
                                    headers,
                                    body: JSON.stringify({
                                        action: 'add',
                                        product_id: id,
                                        // pass snapshot when available
                                        platform_name: (selectedProducts.find(p => p.id === id)?.source) || undefined,
                                        product_name: (selectedProducts.find(p => p.id === id)?.title) || undefined,
                                        product_url: (selectedProducts.find(p => p.id === id)?.url) || undefined,
                                        image_url: (selectedProducts.find(p => p.id === id)?.image) || undefined,
                                    })
                                })),
                                ...toRemove.map(id => fetch(`${API_BASE_URL}/api/compare/sessions/${activeComparisonSessionId}/products`, {
                                    method: 'PATCH',
                                    headers,
                                    body: JSON.stringify({ action: 'remove', product_id: id })
                                }))
                            ]);
                        }
                    } catch (_) { /* non-fatal */ }
                } else {
                    // No existing session: create a new one
                    const body = {
                        product_ids: selectedProducts.map(p => p.id),
                        original_search_query: localStorage.getItem('lastSearchQuery') || undefined,
                        products: selectedProducts.map(p => ({
                            product_id: p.id,
                            platform_name: p.source || 'unknown',
                            product_name: p.title,
                            product_url: p.url,
                            image_url: p.image,
                            price: typeof p.price === 'number' ? p.price : undefined,
                            original_price: typeof p.originalPrice === 'number' ? p.originalPrice : undefined,
                            currency_code: p.currency || undefined,
                            currency_symbol: p.currency_symbol || undefined,
                            in_stock: typeof p.in_stock === 'boolean' ? p.in_stock : undefined,
                            average_rating: typeof p.rating === 'number' ? p.rating : undefined,
                            total_reviews: typeof p.reviews === 'number' ? p.reviews : undefined,
                        })),
                    };
                    const res = await fetch(`${API_BASE_URL}/api/compare/sessions`, { method: 'POST', headers, body: JSON.stringify(body) });
                    if (res.ok) {
                        const data = await res.json();
                        setActiveComparisonSessionId(data.comparison_id);
                    } else {
                        setActiveComparisonSessionId(null);
                    }
                }
            }
        } catch (_) {
            // ignore
        } finally {
            setIsComparing(true);
            setIsCompareMinimized(false);
        }
    };

    const handleCloseComparison = () => {
        setIsComparing(false);
        setSelectedProducts([]);
        setIsCompareMinimized(false);
    };

    // Reset state when auth token changes (switching users)
    useEffect(() => {
        const resetState = () => {
            setHasSearched(false);
            setSearchResults([]);
            setSelectedProducts([]);
            setIsComparing(false);
            setActiveComparisonSessionId(null);
            setComparisonHistory([]);
            setSelectedProduct(null);
            setSearchError(null);
            setIsCompareMinimized(false);
        };
        const check = () => {
            const t = sessionStorage.getItem('token') || 'anon';
            if (t !== currentToken) {
                setCurrentToken(t);
                resetState();
            }
        };
        check();
        const onFocus = () => check();
        window.addEventListener('focus', onFocus);
        const id = setInterval(check, 1500);
        return () => { window.removeEventListener('focus', onFocus); clearInterval(id); };
    }, [currentToken]);

    // Ensure selected products reflect the active session when resuming
    useEffect(() => {
        const loadSessionProducts = async () => {
            if (!isComparing || !activeComparisonSessionId) return;
            try {
                const authToken = sessionStorage.getItem('token');
                if (!authToken) return;
                const res = await fetch(`${API_BASE_URL}/api/compare/sessions/${activeComparisonSessionId}/products`, { headers: { 'Authorization': `Bearer ${authToken}` } });
                if (!res.ok) {
                    // Session might not belong to this user anymore; reset gracefully
                    setActiveComparisonSessionId(null);
                    setSelectedProducts([]);
                    return;
                }
                const data = await res.json();
                const existingById = new Map(selectedProducts.map(prod => [prod.id, prod]));
                const resultsById = new Map(searchResults.map(prod => [prod.id, prod]));
                const mapped = (data.products || []).map(p => {
                    const fromExisting = existingById.get(p.product_id) || {};
                    const fromResults = resultsById.get(p.product_id) || {};
                    return {
                        id: p.product_id,
                        title: p.product_name || p.product_id,
                        image: p.image_url || fromExisting.image || fromResults.image,
                        url: p.product_url || fromExisting.url || fromResults.url,
                        source: p.platform_name || fromExisting.source || fromResults.source || 'Unknown',
                        price: p.price ?? fromExisting.price ?? fromResults.price ?? null,
                        rating: p.average_rating ?? fromExisting.rating ?? fromResults.rating ?? null,
                        reviews: p.total_reviews ?? fromExisting.reviews ?? fromResults.reviews ?? null,
                        shipping: (p.in_stock === true ? 'In Stock' : (p.in_stock === false ? 'Out of Stock' : (fromExisting.shipping ?? fromResults.shipping))),
                    };
                });
                if (mapped.length > 0) {
                    setSelectedProducts(mapped);
                    // Enrich missing fields using cached lightweight enrich
                    const enrich = async () => {
                        setIsEnriching(true);
                        const ids = mapped
                            .filter(p => !p.image || !p.title || p.price == null || p.rating == null)
                            .map(p => p.id);
                        if (ids.length === 0) return;
                        try {
                            const cache = await enrichProducts(ids, authToken);
                            setSelectedProducts(prev => prev.map(p => {
                                    const upd = cache[p.id] || {};
                                    return {
                                        ...p,
                                        title: upd.product_name || p.title,
                                        image: upd.image_url || p.image,
                                        url: upd.product_url || p.url,
                                        source: upd.platform_name || p.source,
                                        price: upd.price ?? p.price,
                                        rating: upd.average_rating ?? p.rating,
                                        reviews: upd.total_reviews ?? p.reviews,
                                        shipping: (upd.in_stock === true ? 'In Stock' : (upd.in_stock === false ? 'Out of Stock' : p.shipping)),
                                    };
                                }));
                        } catch (_) {}
                        finally { setIsEnriching(false); }
                    };
                    enrich();
                }
            } catch (_) {}
        };
        loadSessionProducts();
    }, [isComparing, activeComparisonSessionId]);

    const handleRemoveProduct = async (productId) => {
        setSelectedProducts(prev => prev.filter(product => product.id !== productId));
        try {
            if (activeComparisonSessionId) {
                const token = sessionStorage.getItem('token');
                if (token) {
                    await fetch(`${API_BASE_URL}/api/compare/sessions/${activeComparisonSessionId}/products`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ action: 'remove', product_id: productId }),
                    });
                }
            }
        } catch (_) {}
    };

    const saveComparisonToHistory = (products, searchQuery) => {
        const newComparison = {
            products: products,
            searchQuery: searchQuery,
            date: new Date().toLocaleDateString(),
            timestamp: Date.now()
        };
        
        setComparisonHistory(prev => {
            // Add new comparison to the beginning
            const updated = [newComparison, ...prev];
            // Keep only last 10 comparisons
            return updated.slice(0, 10);
        });
    };

    // Handle selecting a comparison from history
    // WHAT: If passed a backend session, open resume mode; else fall back to legacy local comparison object
    const handleSelectComparison = async (item) => {
        const sessionId = item?.comparison_id || item?.id || null;
        if (sessionId) {
            setActiveComparisonSessionId(sessionId);
            // Load products for the selected session and map to ProductCard shape
            try {
                const authToken = sessionStorage.getItem('token');
                if (authToken) {
                    const res = await fetch(`${API_BASE_URL}/api/compare/sessions/${sessionId}/products`, { headers: { 'Authorization': `Bearer ${authToken}` } });
                    if (res.ok) {
                        const data = await res.json();
                        const existingById = new Map(selectedProducts.map(prod => [prod.id, prod]));
                        const resultsById = new Map(searchResults.map(prod => [prod.id, prod]));
                        const mapped = (data.products || []).map(p => {
                            const fromExisting = existingById.get(p.product_id) || {};
                            const fromResults = resultsById.get(p.product_id) || {};
                            return {
                                id: p.product_id,
                                title: p.product_name || p.product_id,
                                image: p.image_url || fromExisting.image || fromResults.image,
                                url: p.product_url || fromExisting.url || fromResults.url,
                                source: p.platform_name || fromExisting.source || fromResults.source || 'Unknown',
                                price: p.price ?? fromExisting.price ?? fromResults.price ?? null,
                                rating: p.average_rating ?? fromExisting.rating ?? fromResults.rating ?? null,
                                reviews: p.total_reviews ?? fromExisting.reviews ?? fromResults.reviews ?? null,
                                shipping: (p.in_stock === true ? 'In Stock' : (p.in_stock === false ? 'Out of Stock' : (fromExisting.shipping ?? fromResults.shipping))),
                            };
                        });
                        if (mapped.length > 0) {
                            setSelectedProducts(mapped);
                            const enrich = async () => {
                                setIsEnriching(true);
                                const ids = mapped
                                    .filter(p => !p.image || !p.title || p.price == null || p.rating == null)
                                    .map(p => p.id);
                                if (ids.length === 0) return;
                                try {
                                    const cache = await enrichProducts(ids, authToken);
                                    setSelectedProducts(prev => prev.map(p => {
                                            const upd = cache[p.id] || {};
                                            return {
                                                ...p,
                                                title: upd.product_name || p.title,
                                                image: upd.image_url || p.image,
                                                url: upd.product_url || p.url,
                                                source: upd.platform_name || p.source,
                                                price: upd.price ?? p.price,
                                                rating: upd.average_rating ?? p.rating,
                                                reviews: upd.total_reviews ?? p.reviews,
                                                shipping: (upd.in_stock === true ? 'In Stock' : (upd.in_stock === false ? 'Out of Stock' : p.shipping)),
                                            };
                                        }));
                                } catch (_) {}
                                finally { setIsEnriching(false); }
                            };
                            enrich();
                        }
                    }
                }
            } catch (_) {}
            setIsComparing(true);
            return;
        }
        // Legacy local comparison object
        if (item?.products) {
            setSelectedProducts(item.products);
            setActiveComparisonSessionId(null);
            setIsComparing(true);
        }
    };

    const handleClearComparisonHistory = (updatedHistory) => {
        if (updatedHistory) {
            setComparisonHistory(updatedHistory);
        } else {
            setComparisonHistory([]);
        }
    };

    // CompareContext handles persistence and initialization

    return (
        <AuthProvider>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="light" />
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    
                    {/* Protected Routes */}
                    <Route path="/" element={
                        <ProtectedRoute>
                            <div key={authKey} className={`App ${hasSearched ? 'search-mode' : ''} ${isSidebarExpanded ? 'sidebar-expanded' : ''}`}>
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
                                    {isComparing && !isCompareMinimized && (
                                        <ComparisonView 
                                            products={selectedProducts}
                                            onClose={handleCloseComparison}
                                            onRemoveProduct={handleRemoveProduct}
                                            onSaveToHistory={saveComparisonToHistory}
                                            comparisonHistory={comparisonHistory}
                                            onSelectComparison={handleSelectComparison}
                                            onClearComparisonHistory={handleClearComparisonHistory}
                                            sessionId={activeComparisonSessionId}
                                            onMinimize={() => setIsCompareMinimized(true)}
                                        />
                                    )}
                                    {isComparing && isCompareMinimized && (
                                        <CompareMini 
                                            count={selectedProducts.length}
                                            onExpand={() => setIsCompareMinimized(false)}
                                            onClear={handleCloseComparison}
                                        />
                                    )}
                                    {!isComparing && (
                                        <ResumeChatButton onClick={() => {
                                            // Always open compare view; comparison history is available inside
                                            setIsComparing(true);
                                            setIsCompareMinimized(false);
                                        }} />
                                    )}
                                </main>
                            </div>
                        </ProtectedRoute>
                    } />
                    
                    {/* Catch all route - redirect to home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;