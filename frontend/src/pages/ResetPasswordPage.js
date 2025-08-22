import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import logo from '../assets/logo.png';
import './VerifyEmailPage.css';

export default function ResetPasswordPage() {
  const [search] = useSearchParams();
  const token = useMemo(() => search.get('token'), [search]);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [validating, setValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      if (!token) return;
      setValidating(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/password/reset/validate?token=${encodeURIComponent(token)}`);
        const data = await res.json().catch(() => ({ ok: false }));
        setIsValid(!!data.ok);
      } catch (_) {
        setIsValid(false);
      } finally {
        setValidating(false);
      }
    };
    run();
  }, [token]);

  const canSubmit = password && password.length >= 8 && password === confirm;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const result = await resetPassword({ token, email, code, newPassword: password });
      if (result.success) {
        toast.success('Password updated. Please sign in.');
        navigate('/login', { replace: true });
      } else {
        toast.error(result.error || 'Reset failed');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="verify-page">
      <div className="verify-card">
        <div className="verify-logo">
          <img src={logo} alt="ShopQnB" />
        </div>
        <h2 className="verify-title">Reset your password</h2>
        {token && validating && <p className="verify-help">Validating link…</p>}
        {token && !validating && !isValid && (
          <p className="verify-error-text">This link is invalid or expired. Use your code instead.</p>
        )}
        <form onSubmit={onSubmit} className="verify-form" noValidate>
          {!token && (
            <>
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
              <div className="verify-field">
                <input
                  type="text"
                  className="verify-input code-input"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="6‑digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  required
                />
              </div>
            </>
          )}
          <div className="verify-field">
            <input
              type="password"
              className="verify-input"
              placeholder="New password (min 8 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          <div className="verify-field">
            <input
              type="password"
              className="verify-input"
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          <div className="verify-actions">
            <button type="submit" className="btn-primary" disabled={!canSubmit || submitting}>
              {submitting ? 'Saving…' : 'Save new password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


