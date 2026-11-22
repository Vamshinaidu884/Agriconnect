import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useApp } from '../context/AppContext';
import PasswordInput from '../components/PasswordInput';
import './ResetPassword.css';

export default function ResetPassword() {
  const location = useLocation();
  const [form, setForm] = useState({
    email: location.state?.email || '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const { resetPassword } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();

  const update = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email.trim() || !form.otp || !form.newPassword || !form.confirmPassword) return setError('All fields are required');
    if (form.newPassword !== form.confirmPassword) return setError('Passwords do not match');
    if (form.newPassword.length < 8) return setError('Password must be at least 8 characters');
    setLoading(true);
    try {
      await resetPassword({ email: form.email.trim().toLowerCase(), otp: form.otp, newPassword: form.newPassword });
      setDone(true);
      showToast('Password reset successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Could not reset the password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rp-page" id="reset-password-page">
      <div className="rp-card card">
        <div className="rp-header">
          <span className="rp-emoji">🔑</span>
          <h1 className="rp-title">Reset Password</h1>
          <p className="rp-subtitle">Enter the OTP from your email and set a new password</p>
        </div>

        {done ? (
          <div className="rp-success">
            <span>✅</span>
            <p>Password reset! Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rp-form">
            {error && <div className="rp-error" role="alert">{error}</div>}

            <div className="input-group">
              <label className="input-label" htmlFor="rp-email">Email Address</label>
              <input id="rp-email" type="email" className="input-field" placeholder="your@email.com"
                autoComplete="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="rp-otp">OTP (6-digit code)</label>
              <input id="rp-otp" type="text" className="input-field" placeholder="Enter code"
                inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}"
                maxLength={6} value={form.otp} onChange={(e) => update('otp', e.target.value.replace(/\D/g, '').slice(0, 6))} required />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="rp-password">New Password</label>
              <PasswordInput id="rp-password" placeholder="At least 8 characters"
                value={form.newPassword} onChange={(e) => update('newPassword', e.target.value)} required />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="rp-confirm">Confirm Password</label>
              <PasswordInput id="rp-confirm" placeholder="Repeat new password"
                value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} required />
            </div>

            <button id="rp-submit" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '⏳ Resetting...' : 'Reset Password'}
            </button>
            <Link to="/forgot-password" className="rp-back-link">← Resend OTP</Link>
          </form>
        )}
      </div>
    </div>
  );
}
