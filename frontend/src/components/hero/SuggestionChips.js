import React from 'react';
import './SuggestionChips.css';

// SuggestionChips
// WHAT: Placeholder clickable chips to spark first action
// WHY: Guides users to try example searches quickly
const SuggestionChips = ({ onSelect }) => {
    const suggestions = [
        'sneakers', 'headphones', 'air fryer', 'standing desk', 'wireless mouse', 'espresso machine'
    ];
    return (
        <div className="chips-row" role="list" aria-label="Search suggestions">
            <span className="chips-hint">Try:</span>
            {suggestions.map((s, i) => (
                <button key={i} className="chip" onClick={() => onSelect && onSelect(s)} role="listitem">{s}</button>
            ))}
        </div>
    );
};

export default SuggestionChips;


