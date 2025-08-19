import React from 'react';
import './CompareMini.css';

// CompareMini
// WHAT: Floating mini composer to resume/clear comparison
// WHY: Allow users to keep browsing and re-open comparison quickly
const CompareMini = ({ count, onExpand, onClear }) => {
    return (
        <div className="compare-mini">
            <div className="compare-mini-content">
                <span className="compare-mini-title">Comparing {count} {count === 1 ? 'item' : 'items'}</span>
                <div className="compare-mini-actions">
                    <button className="mini-btn" onClick={onExpand}>Resume</button>
                    <button className="mini-btn ghost" onClick={onClear}>Clear</button>
                </div>
            </div>
        </div>
    );
};

export default CompareMini;


