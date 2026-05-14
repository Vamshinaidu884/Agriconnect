import { useState } from 'react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import RequestCard from '../components/RequestCard';
import Modal from '../components/Modal';
import RatingStars from '../components/RatingStars';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import './MyRequests.css';

const TABS = [
  { id: 'posted', label: 'Posted' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'completed', label: 'Completed' },
];

export default function MyRequests() {
  const [tab, setTab] = useState('posted');
  const [ratingModal, setRatingModal] = useState(null);
  const [ratingScore, setRatingScore] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const { user } = useAuth();
  const { requests, completeRequest, rateUser, showToast } = useApp();

  const postedRequests = requests.filter(r => r.farmerId === user?.id);
  const acceptedRequests = requests.filter(r => r.acceptedUsers?.includes(user?.id) && r.farmerId !== user?.id);
  const completedRequests = requests.filter(r => r.status === 'completed' && (r.farmerId === user?.id || r.acceptedUsers?.includes(user?.id)));

  const currentRequests = tab === 'posted' ? postedRequests : tab === 'accepted' ? acceptedRequests : completedRequests;

  const handleComplete = (reqId) => {
    completeRequest(reqId);
  };

  const handleSubmitRating = () => {
    if (ratingScore === 0) {
      showToast('Please select a rating', 'error');
      return;
    }
    rateUser(ratingModal.requestId, ratingModal.userId, ratingScore, ratingComment);
    setRatingModal(null);
    setRatingScore(0);
    setRatingComment('');
  };

  return (
    <div className="app-layout">
      <Header />
      <div className="page page-with-header" id="my-requests-page">
        <h1 className="heading-2" style={{ marginBottom: '0.5rem' }}>My Requests</h1>
        <p className="body-text" style={{ marginBottom: '1rem' }}>Track and manage your requests</p>

        {/* Tabs */}
        <div className="my-tabs">
          {TABS.map(t => {
            const count = t.id === 'posted' ? postedRequests.length : t.id === 'accepted' ? acceptedRequests.length : completedRequests.length;
            return (
              <button
                key={t.id}
                className={`my-tab ${tab === t.id ? 'my-tab-active' : ''}`}
                onClick={() => setTab(t.id)}
                id={`tab-${t.id}`}
              >
                {t.label}
                <span className="my-tab-count">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Request List */}
        <div className="my-list">
          {currentRequests.length === 0 ? (
            <div className="nearby-empty">
              <span className="nearby-empty-emoji">{tab === 'posted' ? '📋' : tab === 'accepted' ? '✋' : '🏁'}</span>
              <h3>No {tab} requests</h3>
              <p>{tab === 'posted' ? 'Create your first request to get started' : 'Accept requests to see them here'}</p>
            </div>
          ) : (
            currentRequests.map(req => (
              <div key={req.id} className="my-request-item">
                <RequestCard request={req} />
                {/* Action buttons for posted active requests */}
                {tab === 'posted' && req.status === 'active' && (
                  <button className="btn btn-primary btn-full" onClick={() => handleComplete(req.id)} style={{ marginTop: '0.5rem' }} id={`complete-${req.id}`}>
                    🏁 Mark Completed
                  </button>
                )}
                {/* Rating button for completed */}
                {tab === 'completed' && req.farmerId === user?.id && req.acceptedUsers?.length > 0 && (
                  <div className="my-rate-section">
                    <span className="my-rate-label">Rate Workers:</span>
                    <div className="my-rate-buttons">
                      {req.acceptedUsers.map(uid => {
                        const rated = req.ratings?.[uid];
                        return (
                          <button
                            key={uid}
                            className={`btn ${rated ? 'btn-ghost' : 'btn-outline'} btn-sm`}
                            onClick={() => !rated && setRatingModal({ requestId: req.id, userId: uid })}
                            disabled={!!rated}
                          >
                            {rated ? `⭐ ${rated.score}` : '⭐ Rate'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      <BottomNav />

      {/* Rating Modal */}
      <Modal isOpen={!!ratingModal} onClose={() => setRatingModal(null)} title="Rate Worker">
        <div className="rating-modal-content">
          <p className="body-text" style={{ marginBottom: '1rem' }}>How was your experience?</p>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <RatingStars rating={ratingScore} size={32} interactive onChange={setRatingScore} />
          </div>
          <div className="input-group" style={{ marginBottom: '1rem' }}>
            <label className="input-label">Comment (optional)</label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="Share your experience..."
              value={ratingComment}
              onChange={e => setRatingComment(e.target.value)}
              style={{ minHeight: '80px', resize: 'vertical' }}
            />
          </div>
          <button className="btn btn-primary btn-full" onClick={handleSubmitRating} id="submit-rating">
            Submit Rating
          </button>
        </div>
      </Modal>
    </div>
  );
}
