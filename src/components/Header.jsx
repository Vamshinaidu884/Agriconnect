/* ============================================================
   Upgraded Header Component — Multi-language, weather, search
   ============================================================ */
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, Bell, Globe, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { useTranslation } from '../context/LanguageContext';
import { supportedLanguages } from '../data/languages';
import { marketService } from '../services/marketService';
import { requestService } from '../services/requestService';
import './Header.css';

export default function Header({ title, showBack = false, rightAction = null }) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useTranslation();
  const [weatherTemp, setWeatherTemp] = useState(null);
  const [weatherIcon, setWeatherIcon] = useState(null);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationError, setNotificationError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const readKey = `agri_connect_read_notifications_${user?._id || 'guest'}`;
  const readIds = () => {
    try {
      return JSON.parse(localStorage.getItem(readKey) || '[]');
    } catch {
      return [];
    }
  };
  const unreadCount = notifications.filter((notification) => !readIds().includes(notification.id)).length;

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let isActive = true;
    requestService.getMy().then(({ posted = [], accepted = [] }) => {
      if (!isActive) return;
      const updates = [];
      posted.forEach((request) => {
        const id = request._id || request.id;
        if (request.ratings?.length || request.status === 'completed') {
          updates.push({ id: `${id}-completed`, requestId: id, message: `${request.title} has been marked completed.`, time: request.updatedAt });
        } else if (request.acceptedUsers?.length) {
          updates.push({ id: `${id}-accepted`, requestId: id, message: `${request.acceptedUsers[0].userName} accepted your request: ${request.title}.`, time: request.updatedAt });
        }
      });
      accepted.forEach((request) => {
        const id = request._id || request.id;
        const isCompleted = request.status === 'completed';
        updates.push({
          id: `${id}-${isCompleted ? 'completed-worker' : 'accepted-worker'}`,
          requestId: id,
          message: isCompleted ? `Your work on ${request.title} is complete.` : `You’re booked for ${request.title}.`,
          time: request.updatedAt,
        });
      });
      setNotifications(updates.sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0)).slice(0, 12));
      setNotificationError('');
    }).catch(() => {
      if (isActive) setNotificationError('Notifications could not be loaded.');
    });
    return () => { isActive = false; };
  }, [isAuthenticated, user?._id]);

  const markNotificationRead = (id) => {
    const nextRead = [...new Set([...readIds(), id])];
    localStorage.setItem(readKey, JSON.stringify(nextRead));
    setNotifications((current) => [...current]);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchTerm.trim();
    if (query) {
      navigate(`/marketplace/machinery?search=${encodeURIComponent(query)}`);
    }
  };

  // Load weather for header on desktop/tablet
  useEffect(() => {
    const fetchHeaderWeather = async () => {
      const lat = user?.location?.lat || 17.385;
      const lng = user?.location?.lng || 78.4867;
      try {
        const data = await marketService.getWeather(lat, lng);
        if (data?.weather) {
          setWeatherTemp(Math.round(data.weather.temperature));
          setWeatherIcon(data.weather.icon);
        }
      } catch { /* silent */ }
    };
    if (user) fetchHeaderWeather();
  }, [user]);

  const handleLanguageChange = (code) => {
    setLanguage(code);
    setShowLangDropdown(false);
  };

  return (
    <header className="header" id="app-header">
      <div className="header-left">
        {showBack ? (
          <button className="header-back-btn" onClick={() => navigate(-1)} id="header-back" aria-label="Go back">
            <ChevronLeft size={24} />
          </button>
        ) : (
          <div className="header-brand">
            <span className="header-logo-emoji">🌾</span>
            <span className="header-brand-name">Agri Connect</span>
          </div>
        )}
      </div>

      <div className="header-center">
        {showBack ? (
          <h1 className="header-title">{title}</h1>
        ) : (
          <form className="header-search-container" onSubmit={handleSearch} role="search">
            <Search className="header-search-icon" size={18} />
            <input
              type="search"
              placeholder={t('search')}
              className="header-search-input"
              id="header-global-search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              aria-label="Search farm machinery"
            />
            <button className="header-search-submit" type="submit" aria-label="Search machinery">
              <Search size={16} />
            </button>
          </form>
        )}
      </div>

      <div className="header-right">
        {rightAction || (
          <div className="header-actions">
            {/* Weather Widget */}
            {weatherTemp !== null && (
              <div className="header-weather" title={t('weather')}>
                {weatherIcon ? (
                  <img src={weatherIcon} alt="Weather" className="header-weather-icon" />
                ) : (
                  <Sun size={18} className="weather-sun-icon" />
                )}
                <span className="header-weather-temp">{weatherTemp}°C</span>
              </div>
            )}

            {/* Language Switcher */}
            <div className="header-lang-wrapper">
              <button
                className="header-action-btn"
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                aria-label="Change language"
                id="lang-selector-btn"
              >
                <Globe size={18} />
                <span className="header-lang-label">{supportedLanguages.find((item) => item.code === language)?.name}</span>
              </button>
              {showLangDropdown && (
                <div className="header-dropdown lang-dropdown">
                  {supportedLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`header-dropdown-item ${language === lang.code ? 'active' : ''}`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="header-notif-wrapper">
              <button
                className="header-action-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Notifications"
                id="notif-bell-btn"
              >
                <Bell size={18} />
                {unreadCount > 0 && <span className="header-notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </button>
              {showNotifications && (
                <div className="header-dropdown notif-dropdown">
                  <div className="dropdown-header">{t('notifications')}</div>
                  <div className="dropdown-body">
                    {notificationError ? <p className="notif-empty">{notificationError}</p> :
                      notifications.length === 0 ? <p className="notif-empty">No booking updates yet.</p> :
                        notifications.map((notification) => {
                          const isRead = readIds().includes(notification.id);
                          return (
                            <button
                              type="button"
                              key={notification.id}
                              className={`notif-item ${isRead ? 'read' : 'unread'}`}
                              onClick={() => {
                                markNotificationRead(notification.id);
                                setShowNotifications(false);
                                navigate(`/request/${notification.requestId}`);
                              }}
                            >
                              <span className="notif-bullet">●</span>
                              <span><span className="notif-text">{notification.message}</span><span className="notif-time">{notification.time ? new Date(notification.time).toLocaleDateString() : 'Recent update'}</span></span>
                            </button>
                          );
                        })}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile avatar */}
            {user && (
              <button className="header-profile-trigger" onClick={() => navigate('/profile')} id="header-user-avatar">
                {user.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="header-avatar-img" />
                ) : (
                  <div className="header-avatar-placeholder">
                    {user.name?.charAt(0) || '👤'}
                  </div>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
