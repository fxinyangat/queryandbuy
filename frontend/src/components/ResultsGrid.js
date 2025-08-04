import React from 'react';
import ProductCard from './ProductCard';

const ResultsGrid = ({ results }) => {
    return (
        <div className="results-grid">
            {results.map(product => (
                <ProductCard 
                    key={product.id}
                    title={product.title}
                    price={product.price}
                    image={product.image}
                    onView={() => window.open(product.url)}
                />
            ))}
        </div>
    );
};

export default ResultsGrid; 