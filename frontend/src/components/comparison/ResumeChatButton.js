import React from 'react';
import './ResumeChatButton.css';

const ResumeChatButton = ({ onClick }) => {
    return (
        <button className="resume-chat-fab" onClick={onClick} title="Resume chat">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
                <path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2zM6 9h12v2H6V9zm0-3h12v2H6V6zm0 6h8v2H6v-2z"/>
            </svg>
            <span>Resume chat</span>
        </button>
    );
};

export default ResumeChatButton;


