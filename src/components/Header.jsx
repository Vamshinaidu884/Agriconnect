/* ============================================================
   Upgraded Header Component — Multi-language, weather, search
   ============================================================ */
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, Bell, Globe, Sun, Cloud, CloudRain } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { marketService } from '../services/marketService';
import './Header.css';

export default function Header({ title, showBack = false, rightAction = null }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language, setLanguage, t } = useTranslation();
  const [weatherTemp, setWeatherTemp] = useState(null);
  const [weatherIcon, setWeatherIcon] = useState(null);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

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

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'ta', name: 'தமிழ்' },
  ];

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
            <span className="header-brand-name">AgriMatch</span>
          </div>
        )}
      </div>

      <div className="header-center">
        {showBack ? (
          <h1 className="header-title">{title}</h1>
        ) : (
          <div className="header-search-container">
            <Search className="header-search-icon" size={18} />
            <input
              type="text"
              placeholder={t('search')}
              className="header-search-input"
              id="header-global-search"
            />
          </div>
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
                <span className="header-lang-label">{languages.find(l => l.code === language)?.name}</span>
              </button>
              {showLangDropdown && (
                <div className="header-dropdown lang-dropdown">
                  {languages.map((lang) => (
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
                <span className="header-notif-badge" />
              </button>
              {showNotifications && (
                <div className="header-dropdown notif-dropdown">
                  <div className="dropdown-header">{t('notifications')}</div>
                  <div className="dropdown-body">
                    <div className="notif-item">
                      <span className="notif-bullet">●</span>
                      <div>
                        <p className="notif-text">Welcome to AgriMatch V2!</p>
                        <span className="notif-time">Just now</span>
                      </div>
                    </div>
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
