/* ============================================================
   Collapsible & Responsive Navigation Sidebar
   ============================================================ */
import { NavLink, useLocation } from 'react-router-dom';
import { Home, ClipboardList, Tractor, Users, MapPin, BrainCircuit, BarChart3, Settings, User, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import './Sidebar.css';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { path: '/home', icon: Home, label: t('dashboard') },
    { path: '/my-requests', icon: ClipboardList, label: t('requests') },
    { path: '/machines', icon: Tractor, label: t('machines') },
    { path: '/nearby', icon: MapPin, label: t('nearby') },
    { path: '/disease-detection', icon: BrainCircuit, label: t('disease_detection') },
    { path: '/crop-recommendation', icon: BrainCircuit, label: t('crop_guide') },
    { path: '/market-insights', icon: BarChart3, label: t('market_prices') },
    { path: '/profile', icon: User, label: t('profile') },
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`} id="desktop-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <span className="sidebar-logo-emoji">🌾</span>
        {!collapsed && <span className="sidebar-brand-name">AgriMatch</span>}
        <button
          className="sidebar-collapse-toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav Menu */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              id={`sidebar-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Icon size={20} strokeWidth={2} />
              {!collapsed && <span className="sidebar-nav-label">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="sidebar-footer">
        {!collapsed ? (
          <div className="sidebar-profile-card">
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user.name} className="sidebar-profile-img" />
            ) : (
              <div className="sidebar-profile-placeholder">
                {user?.name?.charAt(0) || '👤'}
              </div>
            )}
            <div className="sidebar-profile-info">
              <span className="sidebar-profile-name">{user?.name || 'User'}</span>
              <span className="sidebar-profile-role">{user?.roles?.[0] || 'Farmer'}</span>
            </div>
            <button className="sidebar-logout-btn" onClick={logout} title={t('logout')}>
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <button className="sidebar-logout-icon-only" onClick={logout} title={t('logout')}>
            <LogOut size={20} />
          </button>
        )}
      </div>
    </aside>
  );
}
