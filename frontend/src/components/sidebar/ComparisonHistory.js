import React from 'react';
import './ComparisonHistory.css';

const ComparisonHistory = ({ comparisonHistory, onSelectComparison, onClearHistory }) => {
    if (!comparisonHistory || comparisonHistory.length === 0) {
        return (
            <div className="comparison-history">
                <div className="comparison-history-header">
                    <h3>Comparison History</h3>
                </div>
                <div className="comparison-history-empty">
                    <p>No comparison history yet</p>
                    <p>Start comparing products to see your history here</p>
                </div>
            </div>
        );
    }

    return (
        <div className="comparison-history">
            <div className="comparison-history-header">
                <h3>Comparison History</h3>
                <button 
                    className="clear-history-btn"
                    onClick={onClearHistory}
                    title="Clear all history"
                >
                    Clear All
                </button>
            </div>
            <div className="comparison-history-list">
                {comparisonHistory.map((comparison, index) => (
                    <div 
                        key={index} 
                        className="comparison-history-item"
                        onClick={() => onSelectComparison(comparison)}
                    >
                        <div className="comparison-history-products">
                            {comparison.products.map((product, pIndex) => (
                                <div key={pIndex} className="comparison-product-thumbnail">
                                    <img 
                                        src={product.image || 'https://picsum.photos/50/50'} 
                                        alt={product.title}
                                        onError={(e) => {
                                            e.target.src = 'https://picsum.photos/50/50';
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="comparison-history-details">
                            <p className="comparison-query">{comparison.searchQuery}</p>
                            <p className="comparison-date">{comparison.date}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ComparisonHistory; 