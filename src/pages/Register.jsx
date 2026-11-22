import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { southIndianStates } from '../data/categories';
import './Register.css';

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    state: '', district: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const selectedState = southIndianStates.find(s => s.id === form.state);
  const districts = selectedState?.districts || [];

  const updateField = (field, value) => {
    setError('');
    setForm(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'state' ? { district: '' } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.email.trim() || !form.password || !form.phone.trim() || !form.state || !form.district) {
      setError('Please fill in all required fields');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setError('Enter a valid email address');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
      setError('Enter a valid 10-digit Indian mobile number');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
        state: form.state,
        district: form.district,
        roles: [],
        location: selectedState?.center || { lat: 15.0, lng: 78.0 },
      });
      navigate('/role-selection', { replace: true });
    } catch (err) {
      setError(err.message || 'Could not create your account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page" id="register-page">
      <div className="register-content card">
        <div className="register-header">
          <div className="login-logo-box" style={{ margin: '0 auto var(--space-sm)' }}>
            <span className="login-logo-icon">🌾</span>
          </div>
          <h1 className="login-title">
            <span className="brand-green">Agri</span>
            <span className="brand-accent">Connect</span>
          </h1>
          <p className="login-subtitle">Join Agri Connect today</p>
        </div>

        <form className="register-form" onSubmit={handleSubmit} id="register-form">
          {error && <div className="login-error" role="alert">{error}</div>}

          <div className="input-group">
            <label className="input-label" htmlFor="register-name">Full Name *</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input className="input-field" placeholder="Enter your name" value={form.name} onChange={e => updateField('name', e.target.value)} id="register-name" autoComplete="name" required />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="register-email">Email *</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input type="email" className="input-field" placeholder="Enter your email" value={form.email} onChange={e => updateField('email', e.target.value)} id="register-email" autoComplete="email" required />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="register-phone">Phone *</label>
            <div className="input-with-icon">
              <Phone size={18} className="input-icon" />
              <input type="tel" className="input-field" placeholder="Enter phone number" value={form.phone} onChange={e => updateField('phone', e.target.value)} id="register-phone" autoComplete="tel-national" inputMode="numeric" maxLength={10} required />
            </div>
          </div>

          <div className="register-row">
            <div className="input-group">
              <label className="input-label" htmlFor="register-state">State *</label>
              <select className="input-field select-field" value={form.state} onChange={e => updateField('state', e.target.value)} id="register-state" required>
                <option value="">Select State</option>
                {southIndianStates.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="register-district">District *</label>
              <select className="input-field select-field" value={form.district} onChange={e => updateField('district', e.target.value)} disabled={!form.state} id="register-district" required>
                <option value="">Select District</option>
                {districts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="register-password">Password *</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input type={showPw ? 'text' : 'password'} className="input-field" placeholder="At least 8 characters" value={form.password} onChange={e => updateField('password', e.target.value)} style={{ paddingRight: '44px' }} id="register-password" autoComplete="new-password" minLength={8} required />
              <button type="button" className="login-pw-toggle" onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="register-confirm-password">Confirm Password *</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input type="password" className="input-field" placeholder="Re-enter password" value={form.confirmPassword} onChange={e => updateField('confirmPassword', e.target.value)} id="register-confirm-password" autoComplete="new-password" required />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} id="register-submit">
            {loading ? <span className="login-spinner" /> : 'Create Account'}
          </button>
        </form>

        <p className="login-footer">
          Already have an account? <Link to="/login" className="login-link">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
