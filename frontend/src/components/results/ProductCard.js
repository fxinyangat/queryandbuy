import React, { useState } from 'react';
import { COLORS } from '../../styles/colors';
import './ProductCard.css';

const SparkleIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3L14.5 8.5L20 11L14.5 13.5L12 19L9.5 13.5L4 11L9.5 8.5L12 3Z" 
              fill="currentColor" 
              stroke="currentColor" 
              strokeWidth="1.5"
              strokeLinecap="round" 
              strokeLinejoin="round"/>
        <path d="M19 4L20 5L21 4L20 3L19 4Z" 
              fill="currentColor"/>
        <path d="M4 18L5 19L6 18L5 17L4 18Z" 
              fill="currentColor"/>
        <path d="M18 16L19 17L20 16L19 15L18 16Z" 
              fill="currentColor"/>
    </svg>
);

const ProductCard = ({ product, onClick, isCompareMode, onCompareToggle, isSelected }) => {
    console.log('Product data:', product);
    const [isSaved, setIsSaved] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const [showCartCelebration, setShowCartCelebration] = useState(false);
    const {
        image,
        title,
        price,
        originalPrice,
        rating,
        reviews,
        source,
        shipping,
        aiInsights
    } = product;

    const handleSave = (e) => {
        e.stopPropagation();
        setIsSaved(!isSaved);
        
        // Show celebration animation when saving
        if (!isSaved) {
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 2000);
        }
        
        // Handle save action
    };

    const handleCardClick = (e) => {
        e.preventDefault();
        // Always open product details when clicking on card
        onClick(product);
    };

    const handleSelectClick = (e) => {
        e.stopPropagation();
        onCompareToggle(product);
    };

    return (
        <div className={`product-card ${isSelected ? 'selected' : ''}`} onClick={handleCardClick}>
            <div className="product-image-container">
                <img src={image} alt={title} className="product-image" />
                <button 
                    className={`save-button ${isSaved ? 'saved' : ''}`}
                    onClick={handleSave}
                    aria-label={isSaved ? 'Remove from saved' : 'Save item'}
                >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                </button>
                
                {/* Celebration Animation */}
                {showCelebration && (
                    <div className="celebration-container">
                        {/* Heart Burst */}
                        <div className="heart-burst">
                            <div className="burst-heart">❤️</div>
                            <div className="burst-heart">💖</div>
                            <div className="burst-heart">💝</div>
                        </div>
                        
                        {/* Confetti Particles */}
                        <div className="confetti-container">
                            {[...Array(12)].map((_, i) => (
                                <div 
                                    key={i} 
                                    className={`confetti-particle particle-${i % 4}`}
                                    style={{
                                        '--delay': `${i * 0.1}s`,
                                        '--angle': `${i * 30}deg`,
                                        '--distance': `${20 + (i % 3) * 10}px`
                                    }}
                                />
                            ))}
                        </div>
                        
                        {/* Success Message */}
                        <div className="success-message">
                            <span>Saved! ✨</span>
                        </div>
                    </div>
                )}
                
                {/* Cart Celebration Animation */}
                {showCartCelebration && (
                    <div className="celebration-container cart-celebration">
                        {/* Shopping Cart Burst */}
                        <div className="cart-burst">
                            <div className="burst-cart">🛒</div>
                            <div className="burst-cart">📦</div>
                            <div className="burst-cart">🎁</div>
                        </div>
                        
                        {/* Confetti Particles */}
                        <div className="confetti-container">
                            {[...Array(12)].map((_, i) => (
                                <div 
                                    key={i} 
                                    className={`confetti-particle cart-particle-${i % 4}`}
                                    style={{
                                        '--delay': `${i * 0.1}s`,
                                        '--angle': `${i * 30}deg`,
                                        '--distance': `${20 + (i % 3) * 10}px`
                                    }}
                                />
                            ))}
                        </div>
                        
                        {/* Success Message */}
                        <div className="success-message cart-success">
                            <span>Added to Cart! 🛒</span>
                        </div>
                    </div>
                )}
                
                {/* Always visible Select button */}
                <button 
                    className={`select-button ${isSelected ? 'selected' : ''}`}
                    onClick={handleSelectClick}
                    aria-label={isSelected ? 'Remove from selection' : 'Select item'}
                >
                    {isSelected ? (
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
                        </svg>
                    )}
                    <span className="select-text">{isSelected ? 'Selected' : 'Select'}</span>
                </button>
                
                <div className="quick-actions">
                    <button 
                        className="action-button primary"
                        onClick={(e) => {
                            e.stopPropagation();
                            // Handle add to cart action
                            setShowCartCelebration(true);
                            setTimeout(() => setShowCartCelebration(false), 2000);
                        }}
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
            <div className="product-info">
                <h3 className="product-title">{title}</h3>
                <div className="price-container">
                    <span className="current-price">${price}</span>
                    {originalPrice && (
                        <span className="original-price">${originalPrice}</span>
                    )}
                </div>
                <div className="rating-container">
                    <div className="stars">
                        {[1, 2, 3, 4, 5].map((star) => {
                            const starClass = rating >= star ? 'filled' : 
                                            rating >= star - 0.5 ? 'half' : '';
                            return (
                                <span key={star} className={`star ${starClass}`}>★</span>
                            );
                        })}
                    </div>
                    <span className="reviews-count">({reviews || 0} reviews)</span>
                </div>
                {aiInsights && (
                    <div className="ai-insights">
                        <div className="ai-insights-header">
                            <span className="ai-icon">
                                <SparkleIcon />
                            </span>
                            <span>AI Insight</span>
                        </div>
                        <p className="ai-insights-text">{aiInsights}</p>
                    </div>
                )}
                <div className="source-info">
                    <span className="source">{source}</span>
                    <span className="shipping">{shipping}</span>
                </div>
            </div>
        </div>
    );
};

export default ProductCard; 