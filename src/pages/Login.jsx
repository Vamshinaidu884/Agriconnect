import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { BriefcaseBusiness, Eye, EyeOff, Leaf, LockKeyhole, Mail, Sprout } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { useApp } from '../context/AppContext';
import './Login.css';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [accountType, setAccountType] = useState('farmer');
  const { login } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError('');
    try {
      await login(data.identifier, data.password, rememberMe);
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
      <main className="login-scene">
        <img
          className="login-hero-image"
          src="/images/aerial-farmland-login.png"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
        />
        <section className="login-panel" aria-labelledby="login-title">
          <Link className="login-brand" to="/" aria-label="AgriConnect home">
            <span className="login-brand-mark"><Leaf size={22} /></span>
            <span>Agri<span>Connect</span></span>
          </Link>
          <h1 className="login-title" id="login-title">Log in</h1>

          <div className="login-account-tabs" role="group" aria-label="Choose account type">
            <button
              type="button"
              className={`login-account-tab ${accountType === 'farmer' ? 'login-account-tab-active' : ''}`}
              aria-pressed={accountType === 'farmer'}
              onClick={() => setAccountType('farmer')}
            >
              <Sprout size={16} />
              <span>Farmer</span>
            </button>
            <button
              type="button"
              className={`login-account-tab ${accountType === 'worker' ? 'login-account-tab-active' : ''}`}
              aria-pressed={accountType === 'worker'}
              onClick={() => setAccountType('worker')}
            >
              <BriefcaseBusiness size={16} />
              <span>Worker</span>
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="login-form" noValidate>
            {apiError && <div className="login-error" id="login-api-error" role="alert">{apiError}</div>}

            <div className="input-group">
              <label className="input-label" htmlFor="login-identifier">Email or mobile number</label>
              <div className="login-input-wrap">
                <Mail className="login-field-icon" size={17} />
                <input
                  id="login-identifier"
                  type="text"
                  autoComplete="username"
                  className={`input-field ${errors.identifier ? 'input-error' : ''}`}
                  placeholder="Enter email or mobile number"
                  aria-invalid={Boolean(errors.identifier)}
                  aria-describedby={errors.identifier ? 'login-identifier-error' : undefined}
                  {...register('identifier', {
                    required: 'Email address or mobile number is required',
                    validate: (value) =>
                      /^\S+@\S+\.\S+$/.test(value.trim()) || /^[6-9]\d{9}$/.test(value.trim()) ||
                      'Enter a valid email address or 10-digit mobile number',
                  })}
                />
              </div>
              {errors.identifier && <span className="field-error" id="login-identifier-error">{errors.identifier.message}</span>}
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="login-password">Password</label>
              <div className="login-input-wrap">
                <LockKeyhole className="login-field-icon" size={17} />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`input-field ${errors.password ? 'input-error' : ''}`}
                  placeholder="Enter password"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? 'login-password-error' : undefined}
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  className="login-pw-toggle"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && <span className="field-error" id="login-password-error">{errors.password.message}</span>}
            </div>

            <Link to="/forgot-password" className="login-forgot-link" id="login-forgot-link">Forgot password?</Link>

            <label className="login-remember">
              <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
              <span>Remember me</span>
            </label>
            {!rememberMe && <span className="login-session-note">You’ll be signed out when you close this tab.</span>}

            <button id="login-submit" type="submit" className="btn btn-primary btn-lg login-submit" disabled={loading}>
              {loading ? <><span className="login-spinner" /> Signing in...</> : 'Log in'}
            </button>
          </form>

          <div className="login-register">
            <span>Don’t have an account? </span>
            <Link to="/register" id="login-register-link">Sign up</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
