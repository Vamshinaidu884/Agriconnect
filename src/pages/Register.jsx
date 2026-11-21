import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { southIndianStates } from '../data/categories';
import './Register.css';

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    state: '', district: '', securityQuestion: '', securityAnswer: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const selectedState = southIndianStates.find(s => s.id === form.state);
  const districts = selectedState?.districts || [];

  const updateField = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'state' ? { district: '' } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password || !form.phone || !form.state || !form.district) {
      setError('Please fill in all required fields');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        state: form.state,
        district: form.district,
        securityQuestion: form.securityQuestion,
        securityAnswer: form.securityAnswer,
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
      <div className="register-content card" style={{ padding: '2rem' }}>
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
          {error && <div className="login-error">{error}</div>}

          <div className="input-group">
            <label className="input-label">Full Name *</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input className="input-field" placeholder="Enter your name" value={form.name} onChange={e => updateField('name', e.target.value)} id="register-name" />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Email *</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input type="email" className="input-field" placeholder="Enter your email" value={form.email} onChange={e => updateField('email', e.target.value)} id="register-email" />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Phone *</label>
            <div className="input-with-icon">
              <Phone size={18} className="input-icon" />
              <input type="tel" className="input-field" placeholder="Enter phone number" value={form.phone} onChange={e => updateField('phone', e.target.value)} id="register-phone" />
            </div>
          </div>

          <div className="register-row">
            <div className="input-group">
              <label className="input-label">State *</label>
              <select className="input-field select-field" value={form.state} onChange={e => updateField('state', e.target.value)} id="register-state">
                <option value="">Select State</option>
                {southIndianStates.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">District *</label>
              <select className="input-field select-field" value={form.district} onChange={e => updateField('district', e.target.value)} disabled={!form.state} id="register-district">
                <option value="">Select District</option>
                {districts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password *</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input type={showPw ? 'text' : 'password'} className="input-field" placeholder="Min 6 characters" value={form.password} onChange={e => updateField('password', e.target.value)} style={{ paddingRight: '44px' }} id="register-password" />
              <button type="button" className="login-pw-toggle" onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Confirm Password *</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input type="password" className="input-field" placeholder="Re-enter password" value={form.confirmPassword} onChange={e => updateField('confirmPassword', e.target.value)} id="register-confirm-password" />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Security Question (for password recovery)</label>
            <select className="input-field select-field" value={form.securityQuestion} onChange={e => updateField('securityQuestion', e.target.value)} id="register-security-question">
              <option value="">Select a question</option>
              <option value="pet">What is your pet's name?</option>
              <option value="school">What was your first school?</option>
              <option value="village">What is your native village?</option>
              <option value="crop">What is your favorite crop?</option>
            </select>
          </div>

          {form.securityQuestion && (
            <div className="input-group">
              <label className="input-label">Security Answer</label>
              <input className="input-field" placeholder="Your answer" value={form.securityAnswer} onChange={e => updateField('securityAnswer', e.target.value)} id="register-security-answer" />
            </div>
          )}

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
