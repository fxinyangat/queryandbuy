import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { toast } from 'react-toastify';
import logo from '../assets/logo.png';
import './VerifyEmailPage.css';

// VerifyEmailPage
// WHAT: Handles magic-link verification (?token=) and provides a fallback form to submit a 6-digit code.
// WHY: New users must verify their email to secure the account; supports link and code paths.
export default function VerifyEmailPage() {
  const [search] = useSearchParams();
  const token = useMemo(() => search.get('token'), [search]);
  const navigate = useNavigate();
  const [status, setStatus] = useState('idle'); // idle | verifying | success | error
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const verifyOnceRef = useRef(false);

  useEffect(() => {
    const run = async () => {
      if (!token) return;
      if (verifyOnceRef.current) return; // guard against StrictMode double-call
      verifyOnceRef.current = true;
      setStatus('verifying');
      setError('');
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/verify?token=${encodeURIComponent(token)}`);
        if (!res.ok) throw new Error('Invalid or expired token');
        setStatus('success');
        toast.success('Email verified! You can now sign in.');
        setTimeout(() => navigate('/login', { replace: true }), 1200);
      } catch (e) {
        // Only show error if we didn't already succeed
        if (status !== 'success') {
          setStatus('error');
          setError(e.message || 'Verification failed');
          toast.error('Verification link is invalid or expired');
        }
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const onSubmitCode = async (e) => {
    e.preventDefault();
    if (!email || !code) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      if (!res.ok) throw new Error('Invalid or expired code');
      toast.success('Email verified! You can now sign in.');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Verification failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResend = async () => {
    if (!email) {
      toast.info('Enter your email to resend');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!res.ok) throw new Error('Unable to resend at this time');
      toast.success('Verification email sent');
    } catch (err) {
      toast.error(err.message || 'Resend failed');
    }
  };

  return (
    <div className="verify-page">
      <div className="verify-card">
        <div className="verify-logo">
          <img src={logo} alt="ShopQnB" />
        </div>
        <h2 className="verify-title">Verify your email</h2>
        {token ? (
          <>
            {status === 'verifying' && <p className="verify-help">Verifying your email…</p>}
            {status === 'success' && <p className="verify-help">Email verified. Redirecting to login…</p>}
            {status === 'error' && (
              <div className="verify-error-block">
                <p className="verify-error-text">{error}</p>
                <p className="verify-help">You can still verify using your code below.</p>
              </div>
            )}
          </>
        ) : (
          <p className="verify-help">Enter the 6‑digit code from your email, or request a new message.</p>
        )}

        {(!token || status === 'error') && (
          <form onSubmit={onSubmitCode} noValidate className="verify-form">
            <div className="verify-field">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="verify-input"
                autoComplete="email"
              />
            </div>
            <div className="verify-field">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="6‑digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                required
                className="verify-input code-input"
                aria-label="6 digit code"
              />
            </div>
            <div className="verify-actions">
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                Verify
              </button>
              <button type="button" onClick={onResend} className="btn-secondary">
                Resend email
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}


