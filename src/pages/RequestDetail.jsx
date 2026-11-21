import { useParams } from 'react-router-dom';
import { MapPin, Users, Phone, Calendar, Ruler } from 'lucide-react';
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import RatingStars from '../components/RatingStars';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../context/useAuth';
import { useApp } from '../context/AppContext';
import { requestService } from '../services/requestService';
import { ratingService } from '../services/ratingService';
import { formatPrice, formatDate, getTimeSlotLabel } from '../utils/helpers';
import { southIndianStates } from '../data/categories';
import { calculateDistance } from '../utils/distance';
import './RequestDetail.css';

export default function RequestDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { acceptRequest, withdrawRequest, completeRequest, showToast } = useApp();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewScores, setReviewScores] = useState({});
  const [reviewComments, setReviewComments] = useState({});
  const [submittingReview, setSubmittingReview] = useState('');

  const fetchRequest = async () => {
    try {
      const data = await requestService.getById(id);
      setRequest(data.request);
      setError('');
    } catch (requestError) {
      setError(requestError.message || 'Request not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    requestService.getById(id).then((data) => {
      if (active) {
        setRequest(data.request);
        setError('');
      }
    }).catch((requestError) => {
      if (active) setError(requestError.message || 'Request not found');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
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
    } catch (actionError) {
      showToast(actionError.message || 'Unable to accept this request. Please try again.', 'error');
    }
  };

  const handleWithdraw = async () => {
    try {
      await withdrawRequest(request._id || request.id);
      fetchRequest();
    } catch (actionError) {
      showToast(actionError.message || 'Unable to withdraw from this request. Please try again.', 'error');
    }
  };

  const handleComplete = async () => {
    try {
      await completeRequest(request._id || request.id);
      fetchRequest();
    } catch (actionError) {
      showToast(actionError.message || 'Unable to complete this request. Please try again.', 'error');
    }
  };

  const reviewTargets = request.status === 'completed'
    ? isMyRequest
      ? (request.acceptedUsers || []).map((worker) => ({ id: String(worker.userId), name: worker.userName }))
      : hasAccepted
        ? [{ id: String(request.farmerId), name: request.farmerName }]
        : []
    : [];
  const handleSubmitReview = async (target) => {
    const score = reviewScores[target.id];
    if (!score) {
      showToast('Choose a star rating before submitting.', 'error');
      return;
    }
    setSubmittingReview(target.id);
    try {
      await ratingService.submit(request._id || request.id, {
        targetUserId: target.id,
        score,
        comment: reviewComments[target.id] || '',
      });
      showToast(`Your review for ${target.name} was submitted.`);
      await fetchRequest();
    } catch (reviewError) {
      showToast(reviewError.message || 'Unable to submit your review. Please try again.', 'error');
    } finally {
      setSubmittingReview('');
    }
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

        {reviewTargets.length > 0 && (
          <section className="detail-section detail-review-section">
            <h3 className="heading-3">Rate your experience</h3>
            {reviewTargets.map((target) => {
              const hasReviewed = request.ratings?.some((rating) =>
                String(rating.ratedBy) === String(user?._id) &&
                String(rating.ratedFor) === target.id
              );
              return (
                <div className="detail-review-card card" key={target.id}>
                  <div><span className="detail-review-label">Your review for</span><h4>{target.name}</h4></div>
                  {hasReviewed ? (
                    <p className="detail-review-thanks">Thank you for sharing your feedback.</p>
                  ) : (
                    <>
                      <RatingStars
                        rating={reviewScores[target.id] || 0}
                        interactive
                        onChange={(score) => setReviewScores((current) => ({ ...current, [target.id]: score }))}
                      />
                      <label className="detail-review-label" htmlFor={`review-comment-${target.id}`}>Review (optional)</label>
                      <textarea
                        id={`review-comment-${target.id}`}
                        className="input-field"
                        rows={3}
                        maxLength={500}
                        placeholder="Share a few words about working together"
                        value={reviewComments[target.id] || ''}
                        onChange={(event) => setReviewComments((current) => ({ ...current, [target.id]: event.target.value }))}
                      />
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleSubmitReview(target)}
                        disabled={submittingReview === target.id}
                      >
                        {submittingReview === target.id ? 'Submitting...' : 'Submit review'}
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </section>
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
