import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import './ForgotPassword.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { forgotPassword } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return setError('Please enter your email');
    setLoading(true);
    setError('');
    try {
      await forgotPassword(email);
      setSent(true);
      showToast('OTP sent! Check your email.');
    } catch (err) {
      setError(err.message);
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
            <p>Check your email inbox. The OTP expires in 10 minutes.</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/reset-password')}
              id="fp-go-reset"
            >
              Enter OTP & Reset Password
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="fp-form">
            {error && <div className="fp-error">{error}</div>}
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input
                id="fp-email"
                type="email"
                className="input-field"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
