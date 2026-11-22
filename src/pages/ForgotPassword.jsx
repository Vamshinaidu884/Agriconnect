import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import './ForgotPassword.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return setError('Please enter your email');
    setLoading(true);
    setError('');
    try {
      await forgotPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (err) {
      setError(err.message || 'Could not request a password reset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fp-page" id="forgot-password-page">
      <div className="fp-card card">
        <div className="fp-header">
          <span className="fp-emoji">🔐</span>
          <h1 className="fp-title">Forgot Password</h1>
          <p className="fp-subtitle">Enter your registered email to receive an OTP</p>
        </div>

        {sent ? (
          <div className="fp-success">
            <span className="fp-success-icon">📧</span>
            <h2>OTP Sent!</h2>
            <p>If the address is registered, a six-digit code will be emailed to you. It expires in 10 minutes.</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/reset-password', { state: { email: email.trim().toLowerCase() } })}
              id="fp-go-reset"
            >
              Enter OTP & Reset Password
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="fp-form">
            {error && <div className="fp-error" role="alert">{error}</div>}
            <div className="input-group">
              <label className="input-label" htmlFor="fp-email">Email Address</label>
              <input
                id="fp-email"
                type="email"
                className="input-field"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <button
              id="fp-submit"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? '⏳ Sending...' : 'Send OTP'}
            </button>
            <Link to="/login" className="fp-back-link">← Back to Login</Link>
          </form>
        )}
      </div>
    </div>
  );
}
