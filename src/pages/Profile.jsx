import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Briefcase, Settings, LogOut, ChevronRight, Shield, Globe } from 'lucide-react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import RatingStars from '../components/RatingStars';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { getRoleLabel, getRoleIcon } from '../utils/helpers';
import { southIndianStates, rangeOptions } from '../data/categories';
import './Profile.css';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showRangeModal, setShowRangeModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const stateName = southIndianStates.find(s => s.id === user?.state)?.name || '';
  const allRoles = ['farmer', 'labour', 'machine_owner'];

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

  return (
    <div className="app-layout">
      <Header />
      <div className="page page-with-header" id="profile-page">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-avatar-wrapper">
            <span className="profile-avatar">{user?.avatar || '👤'}</span>
            <div className="profile-avatar-glow" />
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
            <span className="profile-stat-label">Jobs Done</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-icon">⭐</span>
            <span className="profile-stat-value">{user?.rating?.toFixed(1) || '0.0'}</span>
            <span className="profile-stat-label">Rating</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-icon">📍</span>
            <span className="profile-stat-value">{user?.range || 20}km</span>
            <span className="profile-stat-label">Range</span>
          </div>
        </div>

        {/* Settings List */}
        <div className="profile-section">
          <h2 className="profile-section-title">Settings</h2>

          <button className="profile-menu-item card" onClick={() => setShowRoleModal(true)} id="manage-roles">
            <div className="profile-menu-left">
              <div className="profile-menu-icon" style={{ background: 'rgba(46,125,50,0.15)' }}>
                <Settings size={18} color="var(--primary-light)" />
              </div>
              <div>
                <span className="profile-menu-label">Manage Roles</span>
                <span className="profile-menu-desc">Switch or add roles</span>
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
                <span className="profile-menu-label">Search Range</span>
                <span className="profile-menu-desc">Currently {user?.range || 20}km</span>
              </div>
            </div>
            <ChevronRight size={18} color="var(--text-tertiary)" />
          </button>

          <button className="profile-menu-item card" onClick={() => setShowLogoutConfirm(true)} id="logout-btn">
            <div className="profile-menu-left">
              <div className="profile-menu-icon" style={{ background: 'rgba(211,47,47,0.15)' }}>
                <LogOut size={18} color="var(--error)" />
              </div>
              <div>
                <span className="profile-menu-label" style={{ color: 'var(--error)' }}>Logout</span>
                <span className="profile-menu-desc">Sign out of your account</span>
              </div>
            </div>
            <ChevronRight size={18} color="var(--text-tertiary)" />
          </button>
        </div>

        {/* Info */}
        <div className="profile-info">
          <p>📧 {user?.email}</p>
          <p>📱 {user?.phone || 'No phone set'}</p>
          <p>📅 Joined {user?.joinedDate || 'Recently'}</p>
        </div>

        <div className="profile-brand">
          <span>🌾 ArgiMatch v1.0</span>
          <span>Smart Farming Starts Here</span>
        </div>
      </div>
      <BottomNav />

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
    </div>
  );
}
