import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import RequestCard from '../components/RequestCard';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import { useMyRequests } from '../hooks/useRequests';
import { useApp } from '../context/AppContext';
import './MyRequests.css';

const TABS = ['Posted', 'Accepted'];

export default function MyRequests() {
  const [tab, setTab] = useState(0);
  const { posted, accepted, loading, error, refetch } = useMyRequests();
  const { completeRequest, deleteRequest } = useApp();
  const navigate = useNavigate();

  const list = tab === 0 ? posted : accepted;

  const handleComplete = async (id) => {
    try {
      await completeRequest(id);
      refetch();
    } catch (err) { /* toast shown in context */ }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this request?')) return;
    try {
      await deleteRequest(id);
      refetch();
    } catch (err) { /* toast shown in context */ }
  };

  return (
    <Layout title="My Requests">
      <div id="my-requests-page">

        {/* Tabs */}
        <div className="my-req-tabs">
          {TABS.map((t, i) => (
            <button key={t} className={`my-req-tab ${tab === i ? 'my-req-tab-active' : ''}`}
              onClick={() => setTab(i)}>
              {t === 'Posted' ? '📋' : '✅'} {t}
              <span className="my-req-tab-count">
                {t === 'Posted' ? posted.length : accepted.length}
              </span>
            </button>
          ))}
        </div>

        {loading && <Spinner text="Loading your requests..." />}
        {!loading && error && <ErrorMessage message={error} onRetry={refetch} />}

        {!loading && !error && list.length === 0 && (
          <div className="my-req-empty">
            <span>{tab === 0 ? '📋' : '✅'}</span>
            <h3>{tab === 0 ? 'No requests posted yet' : 'No accepted jobs yet'}</h3>
            <p>{tab === 0 ? 'Post your first farm job request' : 'Browse nearby requests to find work'}</p>
            <button className="btn btn-primary" onClick={() => navigate(tab === 0 ? '/create-request' : '/nearby')}>
              {tab === 0 ? '+ Create Request' : '🔍 Browse Nearby'}
            </button>
          </div>
        )}

        <div className="my-req-list">
          {list.map(req => (
            <div key={req._id || req.id}>
              <RequestCard request={req} onClick={() => navigate(`/request/${req._id || req.id}`)} />
              {tab === 0 && req.status !== 'completed' && req.status !== 'expired' && (
                <div className="my-req-actions">
                  {req.status === 'active' && (
                    <button className="btn btn-primary btn-sm"
                      onClick={() => handleComplete(req._id || req.id)}>
                      ✅ Mark Complete
                    </button>
                  )}
                  <button className="btn btn-ghost btn-sm my-req-delete"
                    onClick={() => handleDelete(req._id || req.id)}>
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
