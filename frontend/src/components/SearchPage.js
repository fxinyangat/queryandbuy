import React, { useState } from 'react';
import SearchBar from './SearchBar';
import ResultsGrid from './ResultsGrid';

const SearchPage = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (query) => {
        setLoading(true);
        try {
            const response = await fetch('/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
            });
            const data = await response.json();
            setResults(data.products);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="search-page">
            <SearchBar onSearch={handleSearch} />
            {loading ? (
                <div>Loading...</div>
            ) : (
                <ResultsGrid results={results} />
            )}
        </div>
    );
};

export default SearchPage; 