import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    setTimeout(() => {
      const result = login(email, password);
      if (result.success) {
        navigate('/home', { replace: true });
      } else {
        setError(result.message);
      }
      setLoading(false);
    }, 500);
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      const result = loginWithGoogle();
      if (result.success) {
        navigate(result.isNewUser ? '/role-selection' : '/home', { replace: true });
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="login-page" id="login-page">
      <div className="login-bg">
        <div className="login-bg-shape login-bg-shape-1" />
        <div className="login-bg-shape login-bg-shape-2" />
      </div>

      <div className="login-content">
        <div className="login-header">
          <img src="/logo.png" alt="ArgiMatch" className="login-logo" />
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to continue to ArgiMatch</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} id="login-form">
          {error && <div className="login-error" id="login-error">{error}</div>}

          <div className="input-group">
            <label className="input-label">Email</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                className="input-field"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                id="login-email"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type={showPw ? 'text' : 'password'}
                className="input-field"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ paddingRight: '44px' }}
                id="login-password"
              />
              <button
                type="button"
                className="login-pw-toggle"
                onClick={() => setShowPw(!showPw)}
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
            id="login-submit"
          >
            {loading ? <span className="login-spinner" /> : 'Sign In'}
          </button>
        </form>

        <div className="login-divider">
          <span className="login-divider-line" />
          <span className="login-divider-text">or</span>
          <span className="login-divider-line" />
        </div>

        <button
          className="btn btn-secondary btn-full btn-lg login-google-btn"
          onClick={handleGoogleLogin}
          disabled={loading}
          id="login-google"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <p className="login-footer">
          Don't have an account? <Link to="/register" className="login-link" id="login-register-link">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
