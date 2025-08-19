import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';
import ConfirmationDialog from '../common/ConfirmationDialog';

const Header = ({ children, onMenuItemClick }) => {
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuth();
    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleLogout = async () => {
        setConfirmOpen(true);
    };
    const confirmLogout = async () => {
        setConfirmOpen(false);
        await logout();
        navigate('/login', { replace: true });
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
                <div className="header-actions">
                    {isAuthenticated ? (
                        <>
                            <span className="header-user" title={user?.email}>{user?.first_name || user?.firstName || user?.username}</span>
                            <button className="logout-button" onClick={handleLogout}>Logout</button>
                        </>
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