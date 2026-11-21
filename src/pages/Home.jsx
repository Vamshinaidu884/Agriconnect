import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, Sparkles } from 'lucide-react';
import Layout from '../components/Layout';
import RequestCard from '../components/RequestCard';
import WeatherWidget from '../components/WeatherWidget';
import { useAuth } from '../context/useAuth';
import { useTranslation } from '../context/LanguageContext';
import { requestService } from '../services/requestService';
import { recommendationService } from '../services/recommendationService';
import { useApp } from '../context/AppContext';
import { ALL_STATES } from '../constants/categories';
import './Home.css';

export default function Home() {
  const { user } = useAuth();
  const { showToast } = useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [recentRequests, setRecentRequests] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({ total: 0, active: 0, completed: 0, pending: 0 });
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
      const isFarmer = user?.roles?.includes('farmer');
      const [data, mine, recommended] = await Promise.allSettled([
        requestService.getAll({ status: 'pending', limit: 3 }),
        requestService.getMy(),
        isFarmer ? recommendationService.getForMe() : Promise.resolve(null),
      ]);
      if (data.status === 'fulfilled') setRecentRequests(data.value.requests || []);
      else showToast('Unable to load nearby requests. Please try again.', 'error');
      if (mine.status === 'fulfilled') {
        const allRequests = [...(mine.value.posted || []), ...(mine.value.accepted || [])];
        const uniqueRequests = [...new Map(allRequests.map((request) => [request._id || request.id, request])).values()];
        setDashboardStats({
          total: uniqueRequests.length,
          active: uniqueRequests.filter((request) => request.status === 'active').length,
          completed: uniqueRequests.filter((request) => request.status === 'completed').length,
          pending: uniqueRequests.filter((request) => request.status === 'pending').length,
        });
      } else {
        showToast('Unable to load your booking summary. Please try again.', 'error');
      }
      if (recommended.status === 'fulfilled') setRecommendations(recommended.value?.recommendations?.slice(0, 3) || []);
      else showToast('Smart recommendations could not be loaded.', 'error');
      setLoading(false);
    };
    fetchRecent();
  }, [user?._id, user?.roles, showToast]);

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
            <span className="home-stat-value">{dashboardStats.total}</span>
            <span className="home-stat-label">Total Bookings</span>
          </div>
          <div className="home-stat card">
            <span className="home-stat-value">{dashboardStats.active}</span>
            <span className="home-stat-label">Active Bookings</span>
          </div>
          <div className="home-stat card">
            <span className="home-stat-value">{dashboardStats.completed}</span>
            <span className="home-stat-label">Completed Services</span>
          </div>
          <div className="home-stat card">
            <span className="home-stat-value">{dashboardStats.pending}</span>
            <span className="home-stat-label">Pending Requests</span>
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

        {user?.roles?.includes('farmer') && (
          <div className="home-section home-recommendations">
            <div className="home-section-header">
              <div><h2 className="home-section-title"><Sparkles size={19} /> Recommended for you</h2><p>Good matches for your farm and nearby area.</p></div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/recommendations')}>See all</button>
            </div>
                {recommendations.length > 0 ? (
              <div className="home-recommendation-grid">
                {recommendations.map((machine) => (
                  <button key={machine._id} className="home-recommendation-card card card-interactive" onClick={() => navigate('/recommendations')}>
                    {machine.images?.[0] ? <img src={machine.images[0]} alt="" loading="lazy" /> : <span className="home-recommendation-emoji">🚜</span>}
                    <span className="home-recommendation-info"><b>{machine.name}</b><small>{machine.type} · {machine.district || 'Nearby'}</small><strong>₹{Number(machine.pricePerDay || 0).toLocaleString('en-IN')} / {(machine.priceUnit || 'per_day').replace('per_', '')}</strong></span>
                  </button>
                ))}
              </div>
            ) : (
              <button className="home-recommendation-empty card card-interactive" onClick={() => navigate('/recommendations')}>
                <Sparkles size={19} /><span>Explore smart matches for machinery in your area</span>
              </button>
            )}
          </div>
        )}

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
