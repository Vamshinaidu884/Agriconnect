import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Filter } from 'lucide-react';
import Layout from '../components/Layout';
import RequestCard from '../components/RequestCard';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import { useNearby } from '../hooks/useNearby';
import './NearbyRequests.css';

const RADII = [5, 10, 20, 50];

export default function NearbyRequests() {
  const [radius, setRadius] = useState(20);
  const [typeFilter, setTypeFilter] = useState('all');
  const { location, requests, loading, locationError, error, refetch } = useNearby(radius);
  const navigate = useNavigate();

  const filtered = typeFilter === 'all' ? requests : requests.filter(r => r.type === typeFilter);

  return (
    <Layout title="Nearby Requests">
      <div id="nearby-page">

        {/* Location Status */}
        <div className="nearby-location-bar">
          <MapPin size={15} />
          <span>
            {location
              ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
              : locationError || 'Getting your location...'}
          </span>
        </div>
        {locationError && <p className="nearby-location-note" role="status">{locationError}</p>}

        {/* Filters */}
        <div className="nearby-filters">
          <div className="nearby-radius-tabs">
            {RADII.map(r => (
              <button key={r}
                className={`radius-tab ${radius === r ? 'radius-tab-active' : ''}`}
                onClick={() => setRadius(r)}>
                {r} km
              </button>
            ))}
          </div>
          <div className="nearby-type-tabs">
            {['all', 'labour', 'machine'].map(t => (
              <button key={t}
                className={`type-tab ${typeFilter === t ? 'type-tab-active' : ''}`}
                onClick={() => setTypeFilter(t)}>
                {t === 'all' ? '🌐 All' : t === 'labour' ? '👷 Labour' : '🚜 Machine'}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading && <Spinner text="Finding nearby requests..." />}
        {!loading && error && <ErrorMessage message={error} onRetry={refetch} />}

        {!loading && !error && filtered.length === 0 && (
          <div className="nearby-empty">
            <span>🗺️</span>
            <h3>No requests found nearby</h3>
            <p>Try increasing the search radius or check back later</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <>
            <p className="nearby-count">
              {filtered.length} request{filtered.length !== 1 ? 's' : ''} within {radius} km
            </p>
            <div className="nearby-list">
              {filtered.map(req => (
                <RequestCard key={req._id || req.id} request={req}
                  onClick={() => navigate(`/request/${req._id || req.id}`)} />
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
