import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, ClipboardList, User } from 'lucide-react';
import './BottomNav.css';

const navItems = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/nearby', icon: Search, label: 'Explore' },
  { path: '/my-requests', icon: ClipboardList, label: 'Requests' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="bottom-nav" id="bottom-navigation">
      {navItems.map(item => {
        const isActive = location.pathname.startsWith(item.path);
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            id={`nav-${item.label.toLowerCase()}`}
          >
            <div className="bottom-nav-icon-wrapper">
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              {isActive && <div className="bottom-nav-indicator" />}
            </div>
            <span className="bottom-nav-label">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
