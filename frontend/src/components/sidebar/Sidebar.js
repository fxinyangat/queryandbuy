import React, { useEffect, useRef } from 'react';
import './Sidebar.css';

const Sidebar = ({ 
    isExpanded, 
    onToggle, 
    searchHistory, 
    onHistoryItemClick, 
    onClearHistory,
    onMenuItemClick 
}) => {
    const sidebarRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isExpanded && 
                sidebarRef.current && 
                !sidebarRef.current.contains(event.target) &&
                !event.target.classList.contains('sidebar-toggle')) {
                onToggle();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isExpanded, onToggle]);

    return (
        <>
            <button className="sidebar-toggle" onClick={onToggle}>
                {isExpanded ? '◀' : '☰'}
            </button>
            
            <div className={`sidebar ${isExpanded ? 'expanded' : ''}`} ref={sidebarRef}>
                <div className="sidebar-inner">
                    {/* Mobile Menu Items */}
                    <div className="sidebar-section mobile-only">
                        <div className="section-content">
                            <div className="section-header">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M3 4h18M3 8h18M3 12h18M3 16h18M3 20h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                                <h3>Menu</h3>
                            </div>
                            <div className="menu-items">
                                <div className="menu-item" onClick={() => onMenuItemClick?.('trending')}>
                                    <span>Trending</span>
                                </div>
                                <div className="menu-item" onClick={() => onMenuItemClick?.('hot-deals')}>
                                    <span>Hot Deals</span>
                                </div>
                                <div className="menu-item" onClick={() => onMenuItemClick?.('new-items')}>
                                    <span>New Items</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <div className="section-content">
                            <div className="section-header">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                                <h3>Recent Searches</h3>
                                {searchHistory.length > 0 && (
                                    <button 
                                        className="clear-history-btn"
                                        onClick={onClearHistory}
                                        title="Clear all history"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                            {searchHistory.length > 0 ? (
                                searchHistory.map((item, index) => (
                                    <div 
                                        key={index} 
                                        className="history-item"
                                        onClick={() => onHistoryItemClick(item)}
                                    >
                                        <span>{item}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">No recent searches</div>
                            )}
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <div className="section-content">
                            <div className="section-header">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M4 4h4v4H4V4zm8 0h4v4h-4V4zm8 0h4v4h-4V4z" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M4 10h4v4H4v-4zm8 0h4v4h-4v-4zm8 0h4v4h-4v-4z" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M4 16h4v4H4v-4zm8 0h4v4h-4v-4zm8 0h4v4h-4v-4z" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                                <h3>Categories</h3>
                            </div>
                            {categories.map((category, index) => (
                                <div key={index} className="category-item">
                                    <span className="category-icon">{category.icon}</span>
                                    <span>{category.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const categories = [
    { icon: '📱', name: 'Electronics' },
    { icon: '🎮', name: 'Gaming' },
    { icon: '🏠', name: 'Home' },
    { icon: '👕', name: 'Fashion' }
];

export default Sidebar; 