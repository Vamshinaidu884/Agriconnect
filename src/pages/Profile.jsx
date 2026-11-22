import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Settings, LogOut, ChevronRight, Globe, Camera, Sun, Moon, Lock } from 'lucide-react';
import Layout from '../components/Layout';
import RatingStars from '../components/RatingStars';
import Modal from '../components/Modal';
import { useAuth } from '../context/useAuth';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../context/LanguageContext';
import { useTheme } from '../hooks/useTheme';
import { getRoleLabel, getRoleIcon } from '../utils/helpers';
import { southIndianStates, rangeOptions } from '../data/categories';
import { supportedLanguages } from '../data/languages';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import './Profile.css';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const { showToast } = useApp();
  const { language, setLanguage, t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showRangeModal, setShowRangeModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploading, setUploading] = useState(false);

  const stateName = southIndianStates.find(s => s.id === user?.state)?.name || '';
  const allRoles = ['farmer', 'labour', 'machine_owner'];

  // Client-side image compression helper (max 2MB limit WebP/JPEG format)
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          }, 'image/jpeg', 0.8);
        };
      };
    });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      return;
    }

    setUploading(true);
    showToast(t('uploading'));

    try {
      // Compress local image
      const compressed = await compressImage(file);
      
      // Upload directly to Cloudinary via backend
      const response = await userService.uploadAvatar(compressed);
      
      // Update global auth profile picture state instantly
      updateUser({ profileImage: response.profileImage });
      showToast('Profile photo updated!');
    } catch (err) {
      showToast(err.message || 'Failed to upload image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const toggleRole = (roleId) => {
    const current = user?.roles || [];
    const updated = current.includes(roleId)
      ? current.filter(r => r !== roleId)
      : [...current, roleId];
    if (updated.length === 0) {
      showToast('You must have at least one role', 'error');
      return;
    }
    updateUser({ roles: updated });
    showToast('Roles updated!');
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const closeChangePasswordModal = () => {
    setShowChangePasswordModal(false);
    setPasswordError('');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setPasswordError('');

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword === passwordForm.currentPassword) {
      setPasswordError('Choose a password different from your current one');
      return;
    }

    setChangingPassword(true);
    try {
      await authService.changePassword(passwordForm);
      closeChangePasswordModal();
      showToast('Password changed successfully');
    } catch (error) {
      setPasswordError(error.message || 'Could not change your password. Please try again.');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <Layout title={t('profile')}>
      <div id="profile-page">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-avatar-wrapper" onClick={handleAvatarClick} style={{ cursor: 'pointer' }}>
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user.name} className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-placeholder-text">
                {user?.name?.charAt(0) || '👤'}
              </div>
            )}
            <div className="profile-avatar-overlay">
              <Camera size={18} />
              <span>{uploading ? '...' : t('edit_photo')}</span>
            </div>
            <div className="profile-avatar-glow" />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>
          <h1 className="profile-name">{user?.name || 'User'}</h1>
          <div className="profile-location">
            <MapPin size={14} />
            <span>{user?.district}, {stateName}</span>
          </div>
          <div className="profile-roles">
            {user?.roles?.map(role => (
              <span key={role} className="badge badge-primary">{getRoleLabel(role)}</span>
            ))}
          </div>
          <div className="profile-rating">
            <RatingStars rating={user?.rating || 0} size={18} />
            <span className="profile-rating-count">({user?.totalRatings || 0} ratings)</span>
          </div>
        </div>

        {/* Stats */}
        <div className="profile-stats">
          <div className="profile-stat">
            <span className="profile-stat-icon">✅</span>
            <span className="profile-stat-value">{user?.completedJobs || 0}</span>
            <span className="profile-stat-label">{t('jobs_done')}</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-icon">⭐</span>
            <span className="profile-stat-value">{user?.rating?.toFixed(1) || '0.0'}</span>
            <span className="profile-stat-label">{t('rating')}</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-icon">📍</span>
            <span className="profile-stat-value">{user?.range || 20}km</span>
            <span className="profile-stat-label">{t('range')}</span>
          </div>
        </div>

        {/* Settings List */}
        <div className="profile-section">
          <h2 className="profile-section-title">{t('settings')}</h2>

          <button className="profile-menu-item card" onClick={() => setShowRoleModal(true)} id="manage-roles">
            <div className="profile-menu-left">
              <div className="profile-menu-icon" style={{ background: 'rgba(46,125,50,0.15)' }}>
                <Settings size={18} color="var(--primary-light)" />
              </div>
              <div>
                <span className="profile-menu-label">{t('manage_roles')}</span>
                <span className="profile-menu-desc">{t('switch_roles')}</span>
              </div>
            </div>
            <ChevronRight size={18} color="var(--text-tertiary)" />
          </button>

          <button className="profile-menu-item card" onClick={() => setShowRangeModal(true)} id="set-range">
            <div className="profile-menu-left">
              <div className="profile-menu-icon" style={{ background: 'rgba(30,136,229,0.15)' }}>
                <Globe size={18} color="var(--info)" />
              </div>
              <div>
                <span className="profile-menu-label">{t('search_radius')}</span>
                <span className="profile-menu-desc">Currently {user?.range || 20}km</span>
              </div>
            </div>
            <ChevronRight size={18} color="var(--text-tertiary)" />
          </button>

          <button
            className="profile-menu-item card"
            onClick={() => setShowChangePasswordModal(true)}
            id="change-password"
          >
            <div className="profile-menu-left">
              <div className="profile-menu-icon" style={{ background: 'rgba(46,125,50,0.15)' }}>
                <Lock size={18} color="var(--primary-light)" />
              </div>
              <div>
                <span className="profile-menu-label">Change Password</span>
                <span className="profile-menu-desc">Verify your current password before updating</span>
              </div>
            </div>
            <ChevronRight size={18} color="var(--text-tertiary)" />
          </button>

          <div className="profile-menu-item card profile-theme-setting" id="theme-setting">
            <div className="profile-menu-left">
              <div className="profile-menu-icon" style={{ background: 'rgba(249,168,37,0.15)' }}>
                {theme === 'light'
                  ? <Sun size={18} color="var(--warning)" />
                  : <Moon size={18} color="var(--warning)" />}
              </div>
              <div>
                <label className="profile-menu-label" htmlFor="theme-select">{t('theme')}</label>
                <span className="profile-menu-desc">
                  {theme === 'light' ? t('light_theme') : t('dark_theme')}
                </span>
              </div>
            </div>
            <select
              id="theme-select"
              className="profile-theme-select"
              aria-label={t('theme')}
              value={theme}
              onChange={(event) => setTheme(event.target.value)}
            >
              <option value="light">{t('light_theme')}</option>
              <option value="dark">{t('dark_theme')}</option>
            </select>
          </div>

          <div className="profile-menu-item card profile-theme-setting" id="language-setting">
            <div className="profile-menu-left">
              <div className="profile-menu-icon" style={{ background: 'rgba(30,136,229,0.15)' }}>
                <Globe size={18} color="var(--info)" />
              </div>
              <div>
                <label className="profile-menu-label" htmlFor="language-select">{t('language')}</label>
                <span className="profile-menu-desc">{t('language_description')}</span>
              </div>
            </div>
            <select
              id="language-select"
              className="profile-theme-select"
              aria-label={t('language')}
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              {supportedLanguages.map((item) => (
                <option key={item.code} value={item.code}>{item.name}</option>
              ))}
            </select>
          </div>

          <button className="profile-menu-item card" onClick={() => setShowLogoutConfirm(true)} id="logout-btn">
            <div className="profile-menu-left">
              <div className="profile-menu-icon" style={{ background: 'rgba(211,47,47,0.15)' }}>
                <LogOut size={18} color="var(--error)" />
              </div>
              <div>
                <span className="profile-menu-label" style={{ color: 'var(--error)' }}>{t('logout')}</span>
                <span className="profile-menu-desc">{t('sign_out')}</span>
              </div>
            </div>
            <ChevronRight size={18} color="var(--text-tertiary)" />
          </button>
        </div>

        {/* Info */}
        <div className="profile-info">
          <p>📧 {user?.email}</p>
          <p>📱 {user?.phone || 'No phone set'}</p>
        </div>

        <div className="profile-brand">
          <span>🌾 Agri Connect v2.0 Pro</span>
          <span>Smart Farming Starts Here</span>
        </div>
      </div>

      {/* Role Modal */}
      <Modal isOpen={showRoleModal} onClose={() => setShowRoleModal(false)} title="Manage Roles">
        <div className="role-modal-list">
          {allRoles.map(role => {
            const isActive = user?.roles?.includes(role);
            return (
              <button
                key={role}
                className={`role-modal-item ${isActive ? 'role-modal-item-active' : ''}`}
                onClick={() => toggleRole(role)}
              >
                <span className="role-modal-emoji">{getRoleIcon(role)}</span>
                <span className="role-modal-label">{getRoleLabel(role)}</span>
                <span className={`role-modal-status ${isActive ? 'active' : ''}`}>
                  {isActive ? '✓ Active' : 'Add'}
                </span>
              </button>
            );
          })}
        </div>
      </Modal>

      {/* Range Modal */}
      <Modal isOpen={showRangeModal} onClose={() => setShowRangeModal(false)} title="Search Range">
        <div className="range-modal-list">
          {rangeOptions.map(opt => (
            <button
              key={opt.value}
              className={`range-modal-item ${user?.range === opt.value ? 'range-modal-item-active' : ''}`}
              onClick={() => { updateUser({ range: opt.value }); showToast(`Range set to ${opt.label}`); setShowRangeModal(false); }}
            >
              <span>📍 {opt.label}</span>
              {user?.range === opt.value && <span>✓</span>}
            </button>
          ))}
        </div>
      </Modal>

      <Modal
        isOpen={showChangePasswordModal}
        onClose={closeChangePasswordModal}
        title="Change Password"
      >
        <form className="change-password-form" onSubmit={handleChangePassword}>
          <p className="change-password-help">
            Enter your current password, then choose and confirm a new password.
          </p>
          {passwordError && <p className="change-password-error" role="alert">{passwordError}</p>}

          <div className="input-group">
            <label className="input-label" htmlFor="current-password">Current password</label>
            <input
              id="current-password"
              className="input-field"
              type="password"
              autoComplete="current-password"
              value={passwordForm.currentPassword}
              onChange={(event) => setPasswordForm((form) => ({ ...form, currentPassword: event.target.value }))}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="new-password">New password</label>
            <input
              id="new-password"
              className="input-field"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={passwordForm.newPassword}
              onChange={(event) => setPasswordForm((form) => ({ ...form, newPassword: event.target.value }))}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="confirm-new-password">Confirm new password</label>
            <input
              id="confirm-new-password"
              className="input-field"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={passwordForm.confirmPassword}
              onChange={(event) => setPasswordForm((form) => ({ ...form, confirmPassword: event.target.value }))}
              required
            />
          </div>

          <button className="btn btn-primary btn-full" type="submit" disabled={changingPassword}>
            {changingPassword ? 'Updating password…' : 'Update password'}
          </button>
        </form>
      </Modal>

      {/* Logout Confirm */}
      <Modal isOpen={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} title="Confirm Logout">
        <div style={{ padding: '1rem 0' }}>
          <p className="body-text" style={{ marginBottom: '1.5rem' }}>Are you sure you want to sign out?</p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
            <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleLogout} id="confirm-logout">Logout</button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
