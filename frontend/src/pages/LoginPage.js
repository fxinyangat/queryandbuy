import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import './AuthPages.css';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const alertState = location.state?.alert;

  // Show toast once when navigating here with an alert in location state
  useEffect(() => {
    if (alertState?.message) {
      toast[alertState.type || 'info'](alertState.message, { toastId: 'auth-inline-alert' });
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alertState]);

  // If user is already authenticated, redirect to intended page or dashboard
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/dashboard';
    navigate(from, { replace: true });
    return null;
  }

  const handleLoginSuccess = (user) => {
    // Post-login intent handling
    try {
      const intentRaw = sessionStorage.getItem('post_login_redirect');
      if (intentRaw) {
        const intent = JSON.parse(intentRaw);
        sessionStorage.removeItem('post_login_redirect');
        if (intent?.action === 'open_compare') {
          navigate('/', { replace: true, state: { openCompare: true } });
          return;
        }
        if (intent?.action === 'start_comparison') {
          navigate('/', { replace: true, state: { openCompare: true } });
          return;
        }
      }
    } catch (_) {}
    const from = location.state?.from?.pathname || '/';
    navigate(from, { replace: true });
  };

  return (
    <div className="auth-page">
      <LoginForm onLoginSuccess={handleLoginSuccess} />
    </div>
  );
};

export default LoginPage;
