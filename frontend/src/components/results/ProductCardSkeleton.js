import React from 'react';
import Skeleton from '../common/Skeleton';
import './ProductCard.css';

const ProductCardSkeleton = () => {
    return (
        <div className="product-card">
            <Skeleton type="image" />
            <div className="product-info">
                <Skeleton type="title" />
                <Skeleton type="price" />
                <Skeleton type="rating" />
            </div>
        </div>
    );
};

export default ProductCardSkeleton; 