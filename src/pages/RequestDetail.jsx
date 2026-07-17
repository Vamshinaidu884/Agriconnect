import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users, Phone, Calendar, Ruler } from 'lucide-react';
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import RatingStars from '../components/RatingStars';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { requestService } from '../services/requestService';
import { formatPrice, formatDate, getTimeSlotLabel } from '../utils/helpers';
import { southIndianStates } from '../data/categories';
import { calculateDistance } from '../utils/distance';
import './RequestDetail.css';

export default function RequestDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { acceptRequest, withdrawRequest, completeRequest } = useApp();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRequest = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await requestService.getById(id);
      setRequest(data.request);
    } catch (err) {
      setError(err.message || 'Request not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

  if (loading) {
    return (
      <Layout title="Request Details" showBack>
        <Spinner text="Loading details..." />
      </Layout>
    );
  }

  if (error || !request) {
    return (
      <Layout title="Request Details" showBack>
        <ErrorMessage message={error || 'Request not found'} onRetry={fetchRequest} />
      </Layout>
    );
  }

  const stateName = southIndianStates.find(s => s.id === request.state)?.name || request.state || '';
  const dist = user?.location && request.location
    ? calculateDistance(user.location.lat, user.location.lng, request.location.lat, request.location.lng)
    : null;

  const isMyRequest = request.farmerId === user?._id;
  const hasAccepted = request.acceptedUsers?.some(u => u.userId === user?._id);
  const canAccept = !isMyRequest && !hasAccepted && request.workersAccepted < request.workersNeeded && ['pending', 'active'].includes(request.status);

  const handleAccept = async () => {
    try {
      await acceptRequest(request._id || request.id);
      fetchRequest();
    } catch (err) { /* silent */ }
  };

  const handleWithdraw = async () => {
    try {
      await withdrawRequest(request._id || request.id);
      fetchRequest();
    } catch (err) { /* silent */ }
  };

  const handleComplete = async () => {
    try {
      await completeRequest(request._id || request.id);
      fetchRequest();
    } catch (err) { /* silent */ }
  };

  return (
    <Layout title="Request Details" showBack>
      <div id="request-detail-page">
        {/* Status & Type */}
        <div className="detail-top">
          <span className="detail-type-badge">{request.type === 'labour' ? '👷 Labour' : '🚜 Machine'}</span>
          <StatusBadge status={request.status} />
        </div>

        <h1 className="detail-title">{request.title}</h1>
        {request.description && <p className="detail-desc">{request.description}</p>}

        {/* Price Card */}
        <div className="detail-price-card card">
          <div className="detail-price-main">
            <span className="detail-price-amount">{formatPrice(request.priceOffered)}</span>
            <span className="detail-price-unit">/{request.priceUnit?.replace('per_', '')}</span>
          </div>
          <div className="detail-price-extras">
            {request.foodProvided && <span className="badge badge-success">🍛 Food Provided</span>}
            <span className="badge badge-info">{getTimeSlotLabel(request.timeSlot)}</span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="detail-grid">
          <div className="detail-item">
            <Calendar size={16} />
            <div>
              <span className="detail-item-label">Date</span>
              <span className="detail-item-value">{formatDate(request.date)}</span>
            </div>
          </div>
          <div className="detail-item">
            <Users size={16} />
            <div>
              <span className="detail-item-label">Workers</span>
              <span className="detail-item-value">{request.workersAccepted}/{request.workersNeeded} filled</span>
            </div>
          </div>
          <div className="detail-item">
            <MapPin size={16} />
            <div>
              <span className="detail-item-label">Location</span>
              <span className="detail-item-value">{request.location?.address || `${request.district}, ${stateName}`}</span>
            </div>
          </div>
          {dist !== null && (
            <div className="detail-item">
              <Ruler size={16} />
              <div>
                <span className="detail-item-label">Distance</span>
                <span className="detail-item-value detail-distance">{dist} km away</span>
              </div>
            </div>
          )}
        </div>

        {/* Farmer Info */}
        <div className="detail-farmer card">
          <div className="detail-farmer-info">
            {request.farmerAvatar ? (
              <span className="detail-farmer-avatar">{request.farmerAvatar}</span>
            ) : (
              <div className="detail-farmer-avatar-placeholder">👨‍🌾</div>
            )}
            <div>
              <h3 className="detail-farmer-name">{request.farmerName}</h3>
              <RatingStars rating={request.farmerRating} size={14} />
            </div>
          </div>
          {request.farmerPhone && !isMyRequest && (
            <a href={`tel:${request.farmerPhone}`} className="btn btn-outline btn-sm" id="call-farmer">
              <Phone size={16} /> Call
            </a>
          )}
        </div>

        {/* Accepted Users */}
        {isMyRequest && request.acceptedUsers?.length > 0 && (
          <div className="detail-section">
            <h3 className="heading-3">Accepted Workers ({request.acceptedUsers.length})</h3>
            <div className="detail-workers-list">
              {request.acceptedUsers.map((w, idx) => (
                <div key={idx} className="detail-worker card">
                  <div className="detail-worker-placeholder">👤</div>
                  <div className="detail-worker-info">
                    <span className="detail-worker-name">{w.userName}</span>
                    <RatingStars rating={w.userRating || 0} size={12} />
                  </div>
                  {w.userPhone && (
                    <a href={`tel:${w.userPhone}`} className="btn btn-outline btn-sm">
                      <Phone size={14} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="detail-actions">
          {canAccept && (
            <button className="btn btn-primary btn-full btn-lg" onClick={handleAccept} id="accept-request">
              ✅ Accept Request
            </button>
          )}
          {hasAccepted && request.status !== 'completed' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
              <div className="detail-accepted-msg">
                <span>✅ You have accepted this request</span>
              </div>
              <button className="btn btn-secondary btn-full" onClick={handleWithdraw} id="withdraw-request">
                Withdraw Acceptance
              </button>
            </div>
          )}
          {isMyRequest && request.status === 'active' && (
            <button className="btn btn-primary btn-full btn-lg" onClick={handleComplete} id="complete-request">
              🏁 Mark as Completed
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
}
