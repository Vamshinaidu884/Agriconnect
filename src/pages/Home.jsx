import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus } from 'lucide-react';
import Layout from '../components/Layout';
import RequestCard from '../components/RequestCard';
import WeatherWidget from '../components/WeatherWidget';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { requestService } from '../services/requestService';
import { ALL_STATES } from '../constants/categories';
import './Home.css';

export default function Home() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);

  const stateName = ALL_STATES.find(s => s.id === user?.state)?.name || user?.state || '';

  useEffect(() => {
    // Get location for weather
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setLocation({ lat: 17.385, lng: 78.4867 }) // Default Hyderabad
      );
    }

    // Fetch recent pending requests
    const fetchRecent = async () => {
      try {
        const data = await requestService.getAll({ status: 'pending', limit: 3 });
        setRecentRequests(data.requests || []);
      } catch { /* silent */ } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  const actions = [
    { id: 'find-labour', label: t('find_labour'), emoji: '👷', color: '#2E7D32', desc: t('find_labour_desc'), path: '/create-request?type=labour' },
    { id: 'find-machine', label: t('find_machine'), emoji: '🚜', color: '#8D6E63', desc: t('find_machine_desc'), path: '/create-request?type=machine' },
    { id: 'my-requests', label: t('my_requests'), emoji: '📋', color: '#F9A825', desc: t('my_requests_desc'), path: '/my-requests' },
    { id: 'explore', label: t('explore_nearby'), emoji: '🗺️', color: '#1E88E5', desc: t('explore_nearby_desc'), path: '/nearby' },
  ];

  const intelligence = [
    { id: 'disease', label: t('disease_detection'), emoji: '🦠', color: '#D32F2F', desc: t('disease_detection_desc'), path: '/disease-detection' },
    { id: 'crop', label: t('crop_guide'), emoji: '🌾', color: '#43A047', desc: t('crop_guide_desc'), path: '/crop-recommendation' },
    { id: 'market', label: t('market_prices'), emoji: '📊', color: '#F9A825', desc: t('market_prices_desc'), path: '/market-insights' },
  ];

  // Machine Owners: show link to their machines
  const showMachines = user?.roles?.includes('machine_owner');

  return (
    <Layout title={t('dashboard')}>
      <div id="home-page">
        {/* Welcome */}
        <div className="home-welcome">
          <div className="home-welcome-text">
            <p className="home-greeting">{t('welcome')},</p>
            <h1 className="home-username">{user?.name || 'User'} 👋</h1>
            <div className="home-location">
              <MapPin size={14} />
              <span>{user?.district}{stateName ? `, ${stateName}` : ''}</span>
            </div>
          </div>
          <div className="home-roles">
            {user?.roles?.map(role => (
              <span key={role} className="badge badge-primary">
                {role === 'farmer' ? '👨‍🌾' : role === 'labour' ? '👷' : '🚜'} {role}
              </span>
            ))}
          </div>
        </div>

        {/* Weather */}
        {location && <WeatherWidget lat={location.lat} lng={location.lng} />}

        {/* Stats */}
        <div className="home-stats">
          <div className="home-stat card">
            <span className="home-stat-value">{user?.completedJobs || 0}</span>
            <span className="home-stat-label">{t('jobs_done')}</span>
          </div>
          <div className="home-stat card">
            <span className="home-stat-value">{user?.rating?.toFixed(1) || '0.0'}</span>
            <span className="home-stat-label">{t('rating')} ⭐</span>
          </div>
          <div className="home-stat card">
            <span className="home-stat-value">{user?.serviceRadius || 20}</span>
            <span className="home-stat-label">{t('radius')} km</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="home-section">
          <h2 className="home-section-title">{t('quick_actions')}</h2>
          <div className="home-actions">
            {actions.map((action, i) => (
              <button key={action.id} className="home-action-card card card-interactive"
                onClick={() => navigate(action.path)}
                style={{ animationDelay: `${i * 0.08}s` }} id={`action-${action.id}`}>
                <div className="home-action-icon" style={{ background: `${action.color}20` }}>
                  <span>{action.emoji}</span>
                </div>
                <div className="home-action-text">
                  <span className="home-action-label">{action.label}</span>
                  <span className="home-action-desc">{action.desc}</span>
                </div>
              </button>
            ))}
            {showMachines && (
              <button className="home-action-card card card-interactive" onClick={() => navigate('/machines')} id="action-machines">
                <div className="home-action-icon" style={{ background: '#FF6F0020' }}>
                  <span>🚜</span>
                </div>
                <div className="home-action-text">
                  <span className="home-action-label">{t('my_machines')}</span>
                  <span className="home-action-desc">{t('my_machines_desc')}</span>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Intelligence */}
        <div className="home-section">
          <h2 className="home-section-title">🧠 {t('smart_intel')}</h2>
          <div className="home-intel-grid">
            {intelligence.map((item, i) => (
              <button key={item.id} className="home-intel-card card card-interactive"
                onClick={() => navigate(item.path)}
                style={{ animationDelay: `${i * 0.08}s` }} id={`intel-${item.id}`}>
                <span className="home-intel-emoji">{item.emoji}</span>
                <span className="home-intel-label">{item.label}</span>
                <span className="home-intel-desc">{item.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Requests */}
        {!loading && recentRequests.length > 0 && (
          <div className="home-section">
            <div className="home-section-header">
              <h2 className="home-section-title">{t('recent_requests')}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/nearby')}>{t('view_all')}</button>
            </div>
            <div className="home-requests">
              {recentRequests.map(req => (
                <RequestCard key={req._id || req.id} request={req}
                  onClick={() => navigate(`/request/${req._id || req.id}`)} />
              ))}
            </div>
          </div>
        )}
      </div>
      <button className="home-fab" onClick={() => navigate('/create-request')} id="fab-create" aria-label="Create Request">
        <Plus size={24} />
      </button>
    </Layout>
  );
}
