import React from 'react';
import './ModeToggle.css';
import { useNavigate, useLocation } from 'react-router-dom';

const ModeToggle = ({ mode = 'personal' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isBusiness = /\/business($|\?)/.test(location.pathname);

  return (
    <div className="mode-toggle" role="tablist" aria-label="Mode">
      <button
        className={`pill ${!isBusiness ? 'active' : ''}`}
        onClick={() => navigate('/')}
        role="tab"
        aria-selected={!isBusiness}
      >
        Personal
      </button>
      <button
        className={`pill ${isBusiness ? 'active' : ''}`}
        onClick={() => navigate('/business')}
        role="tab"
        aria-selected={isBusiness}
      >
        Business
      </button>
    </div>
  );
};

export default ModeToggle;


