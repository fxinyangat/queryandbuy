import React, { useState, useRef, useEffect } from 'react';
import './ProductDetail.css';
import { useCompareContext } from '../../contexts/CompareContext';

const ProductDetail = ({ product, onClose }) => {
    const { getProductDetailCached } = useCompareContext();
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragPosition, setDragPosition] = useState(0);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [currentImages, setCurrentImages] = useState([]);
    const detailRef = useRef(null);
    const overlayRef = useRef(null);

    // Minimum swipe distance for close (in px)
    const minSwipeDistance = 100;

    const handleTouchStart = (e) => {
        setTouchStart(e.touches[0].clientY);
        setIsDragging(true);
        setDragPosition(0);
    };

    const handleTouchMove = (e) => {
        if (!touchStart || !isDragging) return;

        const currentTouch = e.touches[0].clientY;
        const distance = currentTouch - touchStart;

        // Only allow dragging downwards
        if (distance < 0) return;

        setTouchEnd(currentTouch);
        setDragPosition(distance);

        // Apply transform to detail panel and overlay opacity
        if (detailRef.current) {
            detailRef.current.style.transform = `translateY(${distance}px)`;
            overlayRef.current.style.opacity = 1 - (distance / window.innerHeight);
        }
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchEnd - touchStart;
        const isSwipe = distance > minSwipeDistance;

        if (isSwipe) {
            // Animate out and close
            if (detailRef.current) {
                detailRef.current.style.transform = `translateY(${window.innerHeight}px)`;
                overlayRef.current.style.opacity = '0';
                setTimeout(onClose, 300);
            }
        } else {
            // Reset position
            if (detailRef.current) {
                detailRef.current.style.transform = 'translateY(0)';
                overlayRef.current.style.opacity = '1';
            }
        }

        // Reset states
        setTouchStart(null);
        setTouchEnd(null);
        setIsDragging(false);
        setDragPosition(0);
    };

    // Add touch indicator
    const [showTouchHint, setShowTouchHint] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowTouchHint(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    // Get all available images
    const getProductImages = () => {
        const images = [];
        
        // Use productImages from API response if available
        if (product.productImages && product.productImages.length > 0) {
            product.productImages.forEach((img, index) => {
                images.push({ 
                    src: img, 
                    alt: `${product.title} - image ${index + 1}` 
                });
            });
            return images;
        }
        
        // Fallback to existing images if no API images
        if (product.image) {
            images.push({ src: product.image, alt: product.title });
        }
        
        // Add thumbnail if different from main image
        if (product.thumbnail && product.thumbnail !== product.image) {
            images.push({ src: product.thumbnail, alt: `${product.title} - thumbnail` });
        }
        
        // Add images from details if available
        if (product.details && product.details.images) {
            product.details.images.forEach((img, index) => {
                if (img && !images.some(existing => existing.src === img)) {
                    images.push({ src: img, alt: `${product.title} - image ${index + 1}` });
                }
            });
        }
        
        return images.length > 0 ? images : [{ src: product.image || '', alt: product.title }];
    };

    const images = getProductImages();
    const currentImage = currentImages.length > 0 ? currentImages[currentImageIndex] : images[currentImageIndex];

    const handlePreviousImage = () => {
        const totalImages = currentImages.length > 0 ? currentImages.length : images.length;
        setCurrentImageIndex(prev => prev === 0 ? totalImages - 1 : prev - 1);
    };

    const handleNextImage = () => {
        const totalImages = currentImages.length > 0 ? currentImages.length : images.length;
        setCurrentImageIndex(prev => prev === totalImages - 1 ? 0 : prev + 1);
    };

    const handleThumbnailClick = (index) => {
        setCurrentImageIndex(index);
    };

    const handleVariantSelect = (variant) => {
        setSelectedVariant(variant);
        // Reset to first image when variant changes
        setCurrentImageIndex(0);
        
        // If the selected variant has images, update the product images
        if (variant.image_urls && Array.isArray(variant.image_urls) && variant.image_urls.length > 0) {
            const variantImages = variant.image_urls.map((img, index) => ({
                src: img,
                alt: `${product.title} - ${variant.value} - image ${index + 1}`
            }));
            // Update the images array with variant images
            setCurrentImages(variantImages);
        }
    };

    // Get color variants (filter out size variants)
    const colorVariants = product.productVariants ? 
        product.productVariants.filter(variant => variant.type === 'Color') : [];

    if (!product) return null;

    const {
        image,
        title,
        price,
        originalPrice,
        rating,
        reviews,
        source,
        shipping
    } = product;

    // Mock detailed data (in real app, this would come from API)
    const details = {
        description: "Experience premium quality and exceptional performance with this top-rated product. Featuring cutting-edge technology and superior craftsmanship, it's designed to exceed your expectations.",
        bulletPoints: [
            "Premium build quality with durable materials",
            "Advanced technology for superior performance",
            "Energy efficient design saves you money",
            "Includes 1-year manufacturer warranty",
            "24/7 customer support included"
        ],
        specifications: {
            "Brand": "Premium Tech",
            "Model": "PT2023-X",
            "Dimensions": "12 x 8 x 3 inches",
            "Weight": "2.5 lbs",
            "Color": "Space Gray",
            "Material": "Aircraft-grade aluminum"
        },
        availability: "In Stock",
        deliveryDate: "FREE delivery: Oct 15 - Oct 18",
        seller: {
            name: source,
            rating: 4.8,
            fulfillment: "Fulfilled by ShopQnB"
        }
    };

    return (
        <div 
            className="product-detail-overlay"
            ref={overlayRef}
            onClick={(e) => {
                if (e.target === overlayRef.current) onClose();
            }}
        >
            <div 
                className="product-detail"
                ref={detailRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {showTouchHint && (
                    <div className="touch-hint">
                        <div className="touch-hint-icon">↓</div>
                        <span>Swipe down to close</span>
                    </div>
                )}
                
                <div className="drag-handle">
                    <div className="drag-handle-indicator" />
                </div>

                <button className="close-button" onClick={onClose}>
                    <span className="close-icon">✕</span>
                    <span className="close-text">Close</span>
                </button>
                
                <div className="product-detail-content">
                    {/* Top Section: Image and Essential Info */}
                    <div className="product-essential-info">
                        <div className="product-detail-image">
                            {(currentImages.length > 0 ? currentImages : images).length > 1 && (
                                <>
                                    <button 
                                        className="image-nav-button prev" 
                                        onClick={handlePreviousImage}
                                        aria-label="Previous image"
                                    >
                                        ‹
                                    </button>
                                    <button 
                                        className="image-nav-button next" 
                                        onClick={handleNextImage}
                                        aria-label="Next image"
                                    >
                                        ›
                                    </button>
                                </>
                            )}
                            <img src={currentImage.src} alt={currentImage.alt} />
                            
                            {(currentImages.length > 0 ? currentImages : images).length > 1 && (
                                <div className="image-thumbnails">
                                    {(currentImages.length > 0 ? currentImages : images).map((img, index) => (
                                        <button
                                            key={index}
                                            className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                                            onClick={() => handleThumbnailClick(index)}
                                            aria-label={`View image ${index + 1}`}
                                        >
                                            <img src={img.src} alt={img.alt} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="product-primary-info">
                            <h1 className="product-title">{title}</h1>
                            <div className="brand-link">by <a href="#">{details.specifications.Brand}</a></div>
                            
                            <div className="rating-section">
                                <div className="stars">
                                    {[1, 2, 3, 4, 5].map((star) => {
                                        const starClass = rating >= star ? 'filled' : 
                                                        rating >= star - 0.5 ? 'half' : '';
                                        return (
                                            <span key={star} className={`star ${starClass}`}>★</span>
                                        );
                                    })}
                                </div>
                                <a href="#reviews" className="reviews-count">{reviews || 0} ratings</a>
                            </div>

                            {/* Color Variants */}
                            {colorVariants.length > 0 && (
                                <div className="variant-section">
                                    <h3>Color Options</h3>
                                    <div className="variant-options">
                                        {colorVariants.map((variant, index) => (
                                            <button
                                                key={variant.id || index}
                                                className={`variant-option ${selectedVariant?.id === variant.id ? 'selected' : ''}`}
                                                onClick={() => handleVariantSelect(variant)}
                                            >
                                                {variant.value}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="price-block">
                                <div className="price-section">
                                    <span className="current-price">${price}</span>
                                    {originalPrice && (
                                        <>
                                            <span className="original-price">List Price: ${originalPrice}</span>
                                            <span className="savings">
                                                You Save: ${(originalPrice - price).toFixed(2)} ({Math.round((1 - price/originalPrice) * 100)}%)
                                            </span>
                                        </>
                                    )}
                                </div>
                                
                                <div className="delivery-info">
                                    <span className="status available">{details.availability}</span>
                                    <span className="delivery-date">{details.deliveryDate}</span>
                                </div>
                            </div>

                            {/* Buy Box */}
                            <div className="buy-box">
                                <div className="action-buttons">
                                    <button className="action-button primary">Add to Cart</button>
                                    <button className="action-button secondary">Buy Now</button>
                                </div>
                                <div className="secure-transaction">
                                    <span>🔒 Secure transaction</span>
                                </div>
                                <div className="seller-info">
                                    <div>Ships from and sold by {details.seller.name}</div>
                                    <div>{details.seller.fulfillment}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* At a Glance Section */}
                    {product.details?.detail?.at_a_glance && (
                        <div className="at-a-glance-section">
                            <h2>At a Glance</h2>
                            <div className="at-a-glance-grid">
                                {product.details.detail.at_a_glance.map((item, index) => (
                                    <div key={index} className="glance-item">
                                        <span className="glance-label">{item.name}:</span>
                                        <span className="glance-value">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Key Features Section */}
                    {product.details?.detail?.key_features && (
                        <div className="key-features-section">
                            <h2>Key Features</h2>
                            <ul className="key-features-list">
                                {product.details.detail.key_features.map((feature, index) => (
                                    <li key={index} className="key-feature-item">{feature}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Product Description */}
                    <div className="product-description-section">
                        <h2>Product Description</h2>
                        <div className="description-content" 
                             dangerouslySetInnerHTML={{ __html: product.details?.detail?.description || details.description || '' }} />
                    </div>

                    {/* AI Description */}
                    {product.details?.detail?.gen_ai_description && (
                        <div className="ai-description-section">
                            <h2>AI Product Analysis</h2>
                            <div className="ai-description-content" 
                                 dangerouslySetInnerHTML={{ __html: product.details.detail.gen_ai_description }} />
                        </div>
                    )}

                    {/* Review Summary */}
                    {product.details?.detail?.review_summary_title && (
                        <div className="review-summary-section">
                            <h2>Customer Reviews Summary</h2>
                            <div className="review-summary-content">
                                <h3>{product.details.detail.review_summary_title}</h3>
                                <p>{product.details.detail.review_summary_text}</p>
                            </div>
                        </div>
                    )}

                    {/* Top Reviews */}
                    {product.details?.detail?.top_reviews && product.details.detail.top_reviews.length > 0 && (
                        <div className="top-reviews-section">
                            <h2>Top Customer Reviews</h2>
                            <div className="reviews-list">
                                {product.details.detail.top_reviews.slice(0, 5).map((review, index) => (
                                    <div key={index} className="review-item">
                                        <div className="review-header">
                                            <div className="review-rating">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <span key={star} className={`star ${review.rating >= star ? 'filled' : ''}`}>★</span>
                                                ))}
                                            </div>
                                            <div className="review-meta">
                                                <span className="reviewer-name">{review.reviewer_name}</span>
                                                <span className="review-date">{review.date}</span>
                                            </div>
                                        </div>
                                        {review.review_title && (
                                            <h4 className="review-title">{review.review_title}</h4>
                                        )}
                                        <p className="review-text">{review.review_text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Product Specifications */}
                    {product.details?.detail?.specifications && (
                        <div className="product-specifications-section">
                            <h2>Product Specifications</h2>
                            <div className="specs-table">
                                {product.details.detail.specifications.map((spec, index) => (
                                    <div key={index} className="spec-row">
                                        <div className="spec-label">{spec.name}</div>
                                        <div className="spec-value">{spec.value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Seller Information */}
                    {product.details?.detail?.seller_name && (
                        <div className="seller-info-section">
                            <h2>Seller Information</h2>
                            <div className="seller-details">
                                <p><strong>Seller:</strong> {product.details.detail.seller_name}</p>
                                {product.details.detail.returns_info && (
                                    <p><strong>Returns:</strong> {product.details.detail.returns_info}</p>
                                )}
                                {product.details.detail.est_delivery_date && (
                                    <p><strong>Estimated Delivery:</strong> {new Date(product.details.detail.est_delivery_date).toLocaleDateString()}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail; 