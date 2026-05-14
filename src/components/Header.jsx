import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

export default function Header({ title, showBack = false, rightAction = null }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header className="header" id="app-header">
      <div className="header-left">
        {showBack ? (
          <button className="header-back-btn" onClick={() => navigate(-1)} id="header-back">
            <ChevronLeft size={24} />
          </button>
        ) : (
          <div className="header-brand">
            <img src="/logo.png" alt="ArgiMatch" className="header-logo" />
            <span className="header-brand-name">ArgiMatch</span>
          </div>
        )}
      </div>
      <div className="header-center">
        {showBack && <h1 className="header-title">{title}</h1>}
      </div>
      <div className="header-right">
        {rightAction || (
          user && (
            <div className="header-avatar" id="header-user-avatar">
              <span>{user.avatar || '👤'}</span>
            </div>
          )
        )}
      </div>
    </header>
  );
}
