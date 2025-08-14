import React from 'react';
import './ConfirmationDialog.css';

const ConfirmationDialog = ({ 
    isOpen, 
    title, 
    message, 
    confirmText = "Confirm", 
    cancelText = "Cancel",
    confirmButtonClass = "confirm-btn",
    onConfirm, 
    onCancel 
}) => {
    if (!isOpen) return null;

    return (
        <div className="confirmation-overlay">
            <div className="confirmation-dialog">
                <div className="confirmation-header">
                    <h3>{title}</h3>
                </div>
                <div className="confirmation-body">
                    <p>{message}</p>
                </div>
                <div className="confirmation-actions">
                    <button 
                        className="confirmation-btn cancel-btn"
                        onClick={onCancel}
                    >
                        {cancelText}
                    </button>
                    <button 
                        className={`confirmation-btn ${confirmButtonClass}`}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationDialog; 