import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import Pagination from './Pagination';
import { useWindowSize } from '../../hooks/useWindowSize';
import './ResultsGrid.css';

const ProductSkeleton = () => (
    <div className="product-skeleton">
        <div className="image-skeleton"></div>
        <div className="content-skeleton">
            <div className="title-skeleton"></div>
            <div className="price-skeleton"></div>
            <div className="rating-skeleton"></div>
            <div className="insight-skeleton"></div>
        </div>
    </div>
);

const ResultsGrid = ({ 
    results, 
    onProductSelect, 
    isLoading,
    isCompareMode,
    selectedProducts,
    onCompareToggle 
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage, setProductsPerPage] = useState(12);
    const windowSize = useWindowSize();

    // Reset to first page when results change
    useEffect(() => {
        setCurrentPage(1);
    }, [results]);

    // Update products per page based on screen size
    useEffect(() => {
        if (windowSize.width >= 1200) {
            setProductsPerPage(12);  // 4x3 grid
        } else if (windowSize.width >= 768) {
            setProductsPerPage(9);   // 3x3 grid
        } else if (windowSize.width >= 480) {
            setProductsPerPage(8);   // 2x4 grid
        } else {
            setProductsPerPage(6);   // 1x6 grid
        }
    }, [windowSize.width]);

    // Get current products
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = results.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(results.length / productsPerPage);

    // Change page
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (isLoading) {
        return (
            <div className="results-container">
                <div className="results-grid">
                    {[...Array(8)].map((_, index) => (
                        <ProductSkeleton key={index} />
                    ))}
                </div>
            </div>
        );
    }

    if (!results.length) {
        return (
            <div className="no-results">
                <p>No products found. Try adjusting your search.</p>
            </div>
        );
    }

    return (
        <div className="results-container">
            <div className="results-grid">
                {currentProducts.map(product => (
                    <ProductCard 
                        key={product.id}
                        product={product}
                        onClick={onProductSelect}
                        isCompareMode={isCompareMode}
                        isSelected={selectedProducts?.some(p => p.id === product.id)}
                        onCompareToggle={onCompareToggle}
                    />
                ))}
            </div>
            {totalPages > 1 && (  // Only show pagination if there's more than one page
                <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
};

export default ResultsGrid; 