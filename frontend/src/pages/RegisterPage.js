import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RegisterForm from '../components/auth/RegisterForm';
import './AuthPages.css';

const RegisterPage = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If user is already authenticated, redirect to dashboard
  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleRegisterSuccess = (user) => {
    navigate('/login', { state: { alert: { type: 'success', message: 'Account created successfully. Please sign in.' } }, replace: true });
  };

  return (
    <div className="auth-page">
      <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
    </div>
  );
};

export default RegisterPage;
