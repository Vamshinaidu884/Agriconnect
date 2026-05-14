import { useState, useMemo } from 'react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import RequestCard from '../components/RequestCard';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { calculateDistance } from '../utils/distance';
import { Search, Filter } from 'lucide-react';
import './NearbyRequests.css';

export default function NearbyRequests() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const { requests } = useApp();

  const filteredRequests = useMemo(() => {
    let filtered = requests.filter(r => r.status === 'pending' && r.farmerId !== user?.id);
    if (filter === 'labour') filtered = filtered.filter(r => r.type === 'labour');
    if (filter === 'machine') filtered = filtered.filter(r => r.type === 'machine');
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(r => r.title.toLowerCase().includes(s) || r.workType.toLowerCase().includes(s) || r.district.toLowerCase().includes(s));
    }
    return filtered.map(r => {
      const dist = user?.location ? calculateDistance(user.location.lat, user.location.lng, r.location.lat, r.location.lng) : null;
      return { ...r, distance: dist };
    }).sort((a, b) => (a.distance || 999) - (b.distance || 999));
  }, [requests, filter, search, user]);

  return (
    <div className="app-layout">
      <Header />
      <div className="page page-with-header" id="nearby-page">
        <h1 className="heading-2" style={{ marginBottom: '0.5rem' }}>Explore Requests</h1>
        <p className="body-text" style={{ marginBottom: '1rem' }}>Find work near you</p>

        <div className="nearby-search">
          <Search size={18} className="nearby-search-icon" />
          <input className="nearby-search-input" placeholder="Search by title, type, or location..." value={search} onChange={e => setSearch(e.target.value)} id="nearby-search" />
        </div>

        <div className="nearby-filters">
          {[
            { id: 'all', label: 'All' },
            { id: 'labour', label: '👷 Labour' },
            { id: 'machine', label: '🚜 Machine' },
          ].map(f => (
            <button key={f.id} className={`nearby-filter ${filter === f.id ? 'nearby-filter-active' : ''}`} onClick={() => setFilter(f.id)} id={`filter-${f.id}`}>
              {f.label}
            </button>
          ))}
        </div>

        <div className="nearby-count">
          <span>{filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''} found</span>
        </div>

        <div className="nearby-list">
          {filteredRequests.length === 0 ? (
            <div className="nearby-empty">
              <span className="nearby-empty-emoji">🔍</span>
              <h3>No requests found</h3>
              <p>Try changing your filters or check back later</p>
            </div>
          ) : (
            filteredRequests.map((req, i) => (
              <div key={req.id} style={{ animationDelay: `${i * 0.06}s` }}>
                <RequestCard request={req} showDistance distance={req.distance} />
              </div>
            ))
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
