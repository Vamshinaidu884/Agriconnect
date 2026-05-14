import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users, ChevronRight } from 'lucide-react';
import { formatPrice, formatTimeAgo, getTimeSlotLabel } from '../utils/helpers';
import { getRequestStatusInfo } from '../utils/fcfs';
import './RequestCard.css';

export default function RequestCard({ request, showDistance = false, distance = null }) {
  const navigate = useNavigate();
  const statusInfo = getRequestStatusInfo(request.status);
  const isMachine = request.type === 'machine';

  return (
    <div
      className="request-card card card-interactive"
      onClick={() => navigate(`/request/${request.id}`)}
      id={`request-card-${request.id}`}
    >
      <div className="request-card-header">
        <div className="request-card-type">
          <span className="request-card-emoji">{isMachine ? '🚜' : '👷'}</span>
          <span className="request-card-type-label">{request.workType}</span>
        </div>
        <span className={`badge badge-${statusInfo.color}`}>
          {statusInfo.icon} {statusInfo.label}
        </span>
      </div>

      <h3 className="request-card-title">{request.title}</h3>

      <div className="request-card-meta">
        <div className="request-card-meta-item">
          <MapPin size={14} />
          <span>{request.district}, {request.state.toUpperCase()}</span>
        </div>
        <div className="request-card-meta-item">
          <Clock size={14} />
          <span>{formatTimeAgo(request.createdAt)}</span>
        </div>
        {showDistance && distance !== null && (
          <div className="request-card-meta-item request-card-distance">
            <MapPin size={14} />
            <span>{distance} km away</span>
          </div>
        )}
      </div>

      <div className="request-card-footer">
        <div className="request-card-price">
          <span className="request-card-price-value">{formatPrice(request.priceOffered)}</span>
          <span className="request-card-price-unit">/{request.priceUnit?.replace('per_', '')}</span>
        </div>
        <div className="request-card-info">
          <div className="request-card-workers">
            <Users size={14} />
            <span>{request.workersAccepted}/{request.workersNeeded}</span>
          </div>
          {request.foodProvided && <span className="request-card-food">🍛 Food</span>}
          <span className="request-card-slot">{request.timeSlot === 'fullday' ? '📅' : request.timeSlot === 'morning' ? '🌅' : '☀️'}</span>
          <ChevronRight size={16} className="request-card-arrow" />
        </div>
      </div>
    </div>
  );
}
