import React, { useEffect } from 'react';
import './ConfirmationDialog.css';

// ConfirmationDialog
// WHAT: Reusable, accessible confirmation modal with variants and slots
// WHY: Consistent UX for destructive and non-destructive confirmations
const ConfirmationDialog = ({ 
    isOpen, 
    title, 
    message, 
    confirmText = "Confirm", 
    cancelText = "Cancel",
    confirmButtonClass = "confirm-btn",
    variant = 'primary', // 'primary' | 'warning' | 'danger'
    icon = null,
    loading = false,
    disableOverlayClose = false,
    onConfirm, 
    onCancel,
    children,
}) => {
    // ESC to cancel, Enter to confirm (hook must always run)
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') onCancel?.();
            if (e.key === 'Enter') onConfirm?.();
        };
        if (isOpen) window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, onCancel, onConfirm]);

    if (!isOpen) return null;

    const handleOverlay = () => {
        if (!disableOverlayClose) onCancel?.();
    };

    return (
        <div className="confirmation-overlay" onClick={handleOverlay}>
            <div 
                className={`confirmation-dialog variant-${variant}`} 
                role="dialog" 
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="confirmation-header">
                    <div className="dialog-icon" aria-hidden>
                        {icon || (<img src={require('../../assets/logo.png')} alt="logo" />)}
                    </div>
                    <h3>{title}</h3>
                </div>
                <div className="confirmation-body">
                    {children ? children : <p>{message}</p>}
                </div>
                <div className="confirmation-actions">
                    <button 
                        className="confirmation-btn cancel-btn"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        {cancelText}
                    </button>
                    <button 
                        className={`confirmation-btn ${confirmButtonClass}`}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Working...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationDialog; 