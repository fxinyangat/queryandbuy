import React from 'react';
import './CompareBar.css';

const CompareBar = ({ selectedProducts, onStartComparison, onRemoveProduct, buttonText }) => {
    return (
        <div className="compare-bar">
            <div className="selected-products">
                <span className="selection-counter">
                    {selectedProducts.length} {selectedProducts.length === 1 ? 'Product' : 'Products'} Selected
                </span>
                <div className="selected-items">
                    {selectedProducts.map(product => (
                        <div key={product.id} className="selected-item">
                            <img src={product.image} alt={product.title} />
                            <button onClick={() => onRemoveProduct(product)}>×</button>
                        </div>
                    ))}
                </div>
            </div>
            <button 
                className="compare-button"
                onClick={() => {
                    const token = (typeof window !== 'undefined') ? sessionStorage.getItem('token') : null;
                    if (!token) {
                        try {
                            sessionStorage.setItem('post_login_redirect', JSON.stringify({ action: 'start_comparison' }));
                        } catch (_) {}
                        window.location.href = '/login';
                        return;
                    }
                    onStartComparison?.();
                }}
            >
                {buttonText}
            </button>
        </div>
    );
};

export default CompareBar; 