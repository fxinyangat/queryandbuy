import React from 'react';
import './Header.css';

const Header = ({ children, onMenuItemClick }) => {
    const menuItems = [
        { id: 'trending', label: 'Trending' },
        { id: 'hot-deals', label: 'Hot Deals' },
        { id: 'new-items', label: 'New Items' }
    ];

    return (
        <header className="header">
            <div className="header-content">
                {children}
                <nav className="header-tabs desktop-only">
                    {menuItems.map(item => (
                        <button 
                            key={item.id}
                            className="header-tab"
                            onClick={() => onMenuItemClick?.(item.id)}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>
            </div>
        </header>
    );
};

export default Header; 