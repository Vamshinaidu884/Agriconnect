import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users, Phone, Calendar, Utensils, Ruler } from 'lucide-react';
import Header from '../components/Header';
import RatingStars from '../components/RatingStars';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { canAcceptRequest } from '../utils/fcfs';
import { formatPrice, formatDate, getTimeSlotLabel } from '../utils/helpers';
import { southIndianStates } from '../data/categories';
import { calculateDistance } from '../utils/distance';
import './RequestDetail.css';

export default function RequestDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { requests, acceptRequest, getUserById } = useApp();
  const navigate = useNavigate();

  const request = requests.find(r => r.id === id);
  if (!request) {
    return (
      <div className="app-layout">
        <Header title="Request" showBack />
        <div className="page page-with-header">
          <div className="nearby-empty">
            <span className="nearby-empty-emoji">❓</span>
            <h3>Request not found</h3>
          </div>
        </div>
      </div>
    );
  }

  const stateName = southIndianStates.find(s => s.id === request.state)?.name || '';
  const dist = user?.location ? calculateDistance(user.location.lat, user.location.lng, request.location.lat, request.location.lng) : null;
  const canAccept = canAcceptRequest(request, user?.id);
  const isMyRequest = request.farmerId === user?.id;
  const hasAccepted = request.acceptedUsers?.includes(user?.id);

  const handleAccept = () => {
    if (user?.id) {
      acceptRequest(request.id, user.id);
    }
  };

  return (
    <div className="app-layout">
      <Header title="Request Details" showBack />
      <div className="page page-with-header" id="request-detail-page">
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
              <span className="detail-item-value">{request.district}, {stateName}</span>
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
          {request.landArea && (
            <div className="detail-item">
              <MapPin size={16} />
              <div>
                <span className="detail-item-label">Land Area</span>
                <span className="detail-item-value">{request.landArea} {request.landUnit}</span>
              </div>
            </div>
          )}
        </div>

        {/* Farmer Info */}
        <div className="detail-farmer card">
          <div className="detail-farmer-info">
            <span className="detail-farmer-avatar">{request.farmerAvatar}</span>
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
              {request.acceptedUsers.map(uid => {
                const w = getUserById(uid);
                return (
                  <div key={uid} className="detail-worker card">
                    <span className="detail-worker-avatar">{w?.avatar || '👤'}</span>
                    <div className="detail-worker-info">
                      <span className="detail-worker-name">{w?.name || 'User'}</span>
                      {w && <RatingStars rating={w.rating} size={12} />}
                    </div>
                    {w?.phone && (
                      <a href={`tel:${w.phone}`} className="btn btn-outline btn-sm">
                        <Phone size={14} />
                      </a>
                    )}
                  </div>
                );
              })}
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
          {hasAccepted && (
            <div className="detail-accepted-msg">
              <span>✅ You have accepted this request</span>
            </div>
          )}
          {isMyRequest && request.status === 'active' && (
            <button className="btn btn-primary btn-full btn-lg" onClick={() => navigate(`/rate/${request.id}`)} id="complete-request">
              🏁 Mark as Completed
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
