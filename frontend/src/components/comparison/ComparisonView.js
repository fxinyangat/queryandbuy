import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../../config';
import './ComparisonView.css';
import { parseMarkdown } from '../../utils/markdownParser';

const TypingAnimation = () => (
    <div className="typing-animation">
        <div className="typing-dots">
            <span></span>
            <span></span>
            <span></span>
        </div>
        <div className="typing-text">Shop-pilot is thinking...</div>
    </div>
);

const ComparisonView = ({ products, onClose, onRemoveProduct }) => {
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [favorites, setFavorites] = useState([]);

    // Add state for mobile view
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    const suggestedQuestions = products.length === 1 ? [
        "Tell me more about this product",
        "What are its key features?",
        "Is this good value for money?",
        "What are its pros and cons?",
        "Is this the right choice for me?"
    ] : [
        "Which one has better value for money?",
        "Compare their key features",
        "What are the main differences?",
        "Which one has better reviews?",
        "Compare their prices including shipping"
    ];

    const chatHistoryRef = useRef(null);

    const MAX_MESSAGE_LENGTH = 500;

    useEffect(() => {
        const searchQuery = localStorage.getItem('lastSearchQuery') || 'products';
        const initialMessage = {
            type: 'ai',
            content: products.length === 1 
                ? `Hi! I'm your QnB AI Adviser. I can help you learn more about this ${products[0].title} from your search for "${searchQuery}". What would you like to know?`
                : `Hi! I'm your QnB AI Adviser. I can help you compare these ${products.length} products from your search for "${searchQuery}". What would you like to know?`
        };
        
        // Update the chat history with the new initial message
        setChatHistory(prev => {
            // If it's the first message (initial load), replace it
            if (prev.length === 1) {
                return [initialMessage];
            }
            // If there are other messages, add a system update
            return [...prev, {
                type: 'ai',
                content: `A product was removed. Now comparing ${products.length} products from your search for "${searchQuery}".`
            }];
        });
    }, [products.length]); // Add products.length as dependency

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'Enter' && e.ctrlKey) handleSendMessage(e);
        };
        
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const handleSuggestedQuestion = (question) => {
        setMessage(question);
        handleSendMessage(null, question);
    };

    const handleSendMessage = async (e, suggestedMessage = null) => {
        if (e) e.preventDefault();
        
        const messageToSend = suggestedMessage || message;
        if (!messageToSend.trim()) return;

        // Add user message to chat
        const newMessage = {
            type: 'user',
            content: messageToSend
        };

        setChatHistory(prev => [...prev, newMessage]);
        setMessage('');

        setIsLoading(true);
        setIsTyping(true);

        try {
            // Prepare products data for API
            const productsData = products.map(product => ({
                id: product.id,
                platform: product.platform || 'walmart',
                url: product.url,
                name: product.title,
                price: product.price,
                rating: product.rating,
                total_reviews: product.reviews
            }));

            // Call the comparison API
            const response = await fetch(`${API_BASE_URL}/api/compare`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    products: productsData,
                    user_question: messageToSend,
                    original_search_query: localStorage.getItem('lastSearchQuery') || 'products'
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Add AI response to chat
            const aiResponse = {
                type: 'ai',
                content: data.ai_analysis
            };
            
            setChatHistory(prev => [...prev, aiResponse]);
            
        } catch (error) {
            console.error('Error calling comparison API:', error);
            
            // Add error response to chat
            const errorResponse = {
                type: 'ai',
                content: "I'm sorry, I'm having trouble analyzing the products right now. Please try again in a moment."
            };
            
            setChatHistory(prev => [...prev, errorResponse]);
        } finally {
            setIsLoading(false);
            setIsTyping(false);
        }
    };

    const handleBuyNow = (product) => {
       alert("This feature is not available yet. Please check back later.");
    };

    const toggleFavorite = (productId) => {
        setFavorites(prev => {
            if (prev.includes(productId)) {
                return prev.filter(id => id !== productId);
            }
            return [...prev, productId];
        });
    };

    const handleRemoveProduct = (productId) => {
        onRemoveProduct(productId);
    };

    return (
        <>
            <div className="comparison-overlay" onClick={onClose} />
            <div className="comparison-view">
                <div className="comparison-header">
                    <h2>Shop-pilot Intelligent Shopping</h2>
                    <button onClick={onClose}>×</button>
                </div>
                
                <div className="comparison-content">
                    <div className="products-overview">
                        <div className="selected-products">
                            {products.map(product => (
                                <div key={product.id} className="comparison-product">
                                    <button 
                                        className="remove-btn"
                                        onClick={() => handleRemoveProduct(product.id)}
                                        title="Remove from comparison"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M18 6L6 18M6 6l12 12"/>
                                        </svg>
                                    </button>
                                    <button 
                                        className={`favorite-btn ${favorites.includes(product.id) ? 'active' : ''}`}
                                        onClick={() => toggleFavorite(product.id)}
                                    >
                                        <svg viewBox="0 0 24 24">
                                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                        </svg>
                                    </button>
                                    <img src={product.image} alt={product.title} />
                                    <div className="comparison-product-content">
                                        <div className="product-meta">
                                            <span className="seller-info">
                                                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                                                    <path d="M21.5 15a3 3 0 0 1-3 3h-13a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3h13a3 3 0 0 1 3 3v6zm-3-7h-13a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1z"/>
                                                </svg>
                                                {product.source}
                                            </span>
                                            <span className="delivery-info">{product.shipping}</span>
                                        </div>
                                        
                                        <h3>{product.title}</h3>
                                        
                                        <div className="price-rating-row">
                                            <p className="price">${product.price}</p>
                                                                        <div className="product-rating">
                                <div className="stars">
                                    {[1, 2, 3, 4, 5].map((star) => {
                                        const starClass = product.rating >= star ? 'filled' : 
                                                        product.rating >= star - 0.5 ? 'half' : '';
                                        return (
                                            <span key={star} className={`star ${starClass}`}>★</span>
                                        );
                                    })}
                                </div>
                            </div>
                                        </div>

                                        <div className="comparison-product-actions">
                                            <button 
                                                className="cart-btn"
                                                onClick={() => handleBuyNow(product)}
                                                title="Add to Cart"
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M9 20a1 1 0 100 2 1 1 0 000-2zm7 0a1 1 0 100 2 1 1 0 000-2zm-7-4h7a2 2 0 002-2V6H6.97l-.5-2H3"/>
                                                    <path d="M6 6l2 8h9"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {isMobile && (
                            <div className="mobile-swipe-indicator">
                                <span>Scroll for more products</span>
                            </div>
                        )}

                        <div className="suggested-questions">
                            <h4>Suggested Questions</h4>
                            <div className={isMobile ? 'questions-scroll' : ''}>
                                {suggestedQuestions.map((question, index) => (
                                    <button
                                        key={index}
                                        className="suggested-question"
                                        onClick={() => handleSuggestedQuestion(question)}
                                    >
                                        {question}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="chat-section">
                        <div className="chat-history" ref={chatHistoryRef}>
                            {chatHistory.map((msg, index) => (
                                <div key={index} className={`chat-message ${msg.type}`}>
                                    <div 
                                        className="message-content"
                                        dangerouslySetInnerHTML={{
                                            __html: msg.type === 'ai' ? parseMarkdown(msg.content) : msg.content
                                        }}
                                    />
                                </div>
                            ))}
                            {isTyping && (
                                <div className="chat-message ai typing">
                                    <TypingAnimation />
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSendMessage} className="chat-input">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
                                placeholder="Ask anything about these products..."
                                maxLength={MAX_MESSAGE_LENGTH}
                            />
                            {message.length > MAX_MESSAGE_LENGTH * 0.8 && (
                                <span className="char-limit">
                                    {MAX_MESSAGE_LENGTH - message.length} characters left
                                </span>
                            )}
                            <button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <div className="send-button-loading">
                                        <div className="loading-spinner"></div>
                                        <span>Analyzing...</span>
                                    </div>
                                ) : (
                                    'Send'
                                )}
                            </button>
                        </form>
                        
                        <div className="ai-disclaimer">
                           
                            <div className="disclaimer-text">
                            Shop-pilot may make mistakes. Double check the details before purchasing.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ComparisonView; 