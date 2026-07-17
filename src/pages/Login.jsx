import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import './Login.css';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError('');
    try {
      await login(data.email, data.password);
      showToast('Welcome back! 👋');
      navigate('/home');
    } catch (err) {
      setApiError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" id="login-page">
      <div className="login-content card">
        <div className="login-header">
          <div className="login-logo-box">
            <span className="login-logo-icon">🌾</span>
          </div>
          <h1 className="login-title">
            <span className="brand-green">Agri</span>
            <span className="brand-accent">Match</span>
          </h1>
          <p className="login-subtitle">Welcome back! Sign in to continue.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="login-form" noValidate>
          {apiError && <div className="login-error" id="login-api-error">{apiError}</div>}

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input
              id="login-email"
              type="email"
              className={`input-field ${errors.email ? 'input-error' : ''}`}
              placeholder="your@email.com"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
              })}
            />
            {errors.email && <span className="field-error">{errors.email.message}</span>}
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className={`input-field ${errors.password ? 'input-error' : ''}`}
                placeholder="Your password"
                style={{ paddingRight: '3rem' }}
                {...register('password', { required: 'Password is required' })}
              />
              <button type="button" onClick={() => setShowPassword(s => !s)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: '1.1rem' }}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password.message}</span>}
          </div>

          <div className="login-forgot">
            <Link to="/forgot-password" id="login-forgot-link">Forgot password?</Link>
          </div>

          <button id="login-submit" type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? '⏳ Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-register">
          <span>New to AgriMatch? </span>
          <Link to="/register" id="login-register-link">Create account</Link>
        </div>
      </div>
    </div>
  );
}
