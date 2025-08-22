import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import logo from '../assets/logo.png';
import './VerifyEmailPage.css';

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    try {
      await requestPasswordReset(email);
      toast.info('If an account exists, you will receive an email shortly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="verify-page">
      <div className="verify-card">
        <div className="verify-logo">
          <img src={logo} alt="ShopQnB" />
        </div>
        <h2 className="verify-title">Forgot your password?</h2>
        <p className="verify-help">Enter your email and we’ll send you a reset link.</p>
        <form onSubmit={onSubmit} className="verify-form" noValidate>
          <div className="verify-field">
            <input
              type="email"
              className="verify-input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className="verify-actions">
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Sending…' : 'Send reset link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


