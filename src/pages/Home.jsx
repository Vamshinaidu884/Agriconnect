import { useNavigate } from 'react-router-dom';
import { Users, Truck, ClipboardList, User, MapPin, TrendingUp, Plus } from 'lucide-react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import RequestCard from '../components/RequestCard';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { getRoleLabel } from '../utils/helpers';
import { southIndianStates } from '../data/categories';
import './Home.css';

export default function Home() {
  const { user } = useAuth();
  const { requests } = useApp();
  const navigate = useNavigate();

  const stateName = southIndianStates.find(s => s.id === user?.state)?.name || '';
  const recentRequests = requests.filter(r => r.status === 'pending').slice(0, 3);
  const myActiveCount = requests.filter(r => (r.farmerId === user?.id || r.acceptedUsers?.includes(user?.id)) && (r.status === 'pending' || r.status === 'active')).length;

  const actions = [
    { id: 'find-labour', label: 'Find Labour', emoji: '👷', color: '#2E7D32', desc: 'Hire workers nearby', path: '/create-request?type=labour' },
    { id: 'find-machine', label: 'Find Machine', emoji: '🚜', color: '#8D6E63', desc: 'Rent farming equipment', path: '/create-request?type=machine' },
    { id: 'my-requests', label: 'My Requests', emoji: '📋', color: '#F9A825', desc: 'Track your requests', path: '/my-requests' },
    { id: 'explore', label: 'Explore Nearby', emoji: '🗺️', color: '#1E88E5', desc: 'Browse all requests', path: '/nearby' },
  ];

  const intelligence = [
    { id: 'disease', label: 'Disease Detection', emoji: '🦠', color: '#D32F2F', desc: 'Scan plant diseases', path: '/disease-detection' },
    { id: 'crop', label: 'Crop Guide', emoji: '🌾', color: '#43A047', desc: 'Smart crop advice', path: '/crop-recommendation' },
    { id: 'market', label: 'Market Prices', emoji: '📊', color: '#F9A825', desc: 'Live crop prices', path: '/market-insights' },
  ];

  return (
    <div className="app-layout">
      <Header />
      <div className="page page-with-header" id="home-page">
        {/* Welcome Section */}
        <div className="home-welcome">
          <div className="home-welcome-text">
            <p className="home-greeting">Welcome back,</p>
            <h1 className="home-username">{user?.name || 'User'} 👋</h1>
            <div className="home-location">
              <MapPin size={14} />
              <span>{user?.district}, {stateName}</span>
            </div>
          </div>
          <div className="home-roles">
            {user?.roles?.map(role => (
              <span key={role} className="badge badge-primary">{getRoleLabel(role)}</span>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="home-stats">
          <div className="home-stat card">
            <span className="home-stat-value">{user?.completedJobs || 0}</span>
            <span className="home-stat-label">Jobs Done</span>
          </div>
          <div className="home-stat card">
            <span className="home-stat-value">{user?.rating?.toFixed(1) || '0.0'}</span>
            <span className="home-stat-label">Rating ⭐</span>
          </div>
          <div className="home-stat card">
            <span className="home-stat-value">{myActiveCount}</span>
            <span className="home-stat-label">Active</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="home-section">
          <h2 className="home-section-title">Quick Actions</h2>
          <div className="home-actions">
            {actions.map((action, i) => (
              <button
                key={action.id}
                className="home-action-card card card-interactive"
                onClick={() => navigate(action.path)}
                style={{ animationDelay: `${i * 0.08}s` }}
                id={`action-${action.id}`}
              >
                <div className="home-action-icon" style={{ background: `${action.color}20` }}>
                  <span>{action.emoji}</span>
                </div>
                <div className="home-action-text">
                  <span className="home-action-label">{action.label}</span>
                  <span className="home-action-desc">{action.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Intelligence Section */}
        <div className="home-section">
          <h2 className="home-section-title">🧠 Smart Intelligence</h2>
          <div className="home-intel-grid">
            {intelligence.map((item, i) => (
              <button
                key={item.id}
                className="home-intel-card card card-interactive"
                onClick={() => navigate(item.path)}
                style={{ animationDelay: `${i * 0.08}s` }}
                id={`intel-${item.id}`}
              >
                <span className="home-intel-emoji">{item.emoji}</span>
                <span className="home-intel-label">{item.label}</span>
                <span className="home-intel-desc">{item.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Requests */}
        {recentRequests.length > 0 && (
          <div className="home-section">
            <div className="home-section-header">
              <h2 className="home-section-title">Recent Requests</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/nearby')}>View All</button>
            </div>
            <div className="home-requests">
              {recentRequests.map(req => (
                <RequestCard key={req.id} request={req} />
              ))}
            </div>
          </div>
        )}
      </div>
      <BottomNav />

      {/* Floating Action Button */}
      <button className="home-fab" onClick={() => navigate('/create-request')} id="fab-create">
        <Plus size={24} />
      </button>
    </div>
  );
}
