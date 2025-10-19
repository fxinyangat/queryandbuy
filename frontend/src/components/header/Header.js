import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';
import ConfirmationDialog from '../common/ConfirmationDialog';

const Header = ({ children, onMenuItemClick, onSidebarToggle, isSidebarExpanded }) => {
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuth();
    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleLogout = async () => {
        setConfirmOpen(true);
    };
    const confirmLogout = async () => {
        setConfirmOpen(false);
        await logout();
        navigate('/', { replace: true });
    };
    const cancelLogout = () => setConfirmOpen(false);
    const menuItems = [
        { id: 'trending', label: 'Trending' },
        { id: 'hot-deals', label: 'Hot Deals' },
        { id: 'new-items', label: 'New Items' }
    ];

    return (
        <>
        <header className="header">
            <div className="header-content">
                <button className="hamburger-btn" onClick={onSidebarToggle} title={isSidebarExpanded ? 'Close menu' : 'Open menu'}>
                    {isSidebarExpanded ? (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    )}
                </button>
                <span className="brand-slot">{children}</span>
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
                <div className="header-actions">
                    {isAuthenticated ? (
                        <div className="avatar-menu">
                            <button className="avatar" aria-haspopup="menu" aria-expanded="false" title={user?.email}>
                                {(user?.first_name || user?.username || 'U').charAt(0).toUpperCase()}
                            </button>
                            <div className="menu">
                                <button onClick={() => navigate('/profile')} className="menu-item">Profile</button>
                                <button onClick={() => navigate('/favorites')} className="menu-item">Favorites</button>
                                <button onClick={handleLogout} className="menu-item danger">Logout</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <button className="link-button" onClick={() => navigate('/login')}>Sign In</button>
                            <button className="primary-button" onClick={() => navigate('/register')}>Sign Up</button>
                        </>
                    )}
                </div>
            </div>
        </header>
        <ConfirmationDialog
            isOpen={confirmOpen}
            title="Confirm Logout"
            message="You will be signed out on this device. Continue?"
            confirmText="Logout"
            confirmButtonClass="delete-btn"
            onConfirm={confirmLogout}
            onCancel={cancelLogout}
        />
        </>
    );
};

export default Header; 