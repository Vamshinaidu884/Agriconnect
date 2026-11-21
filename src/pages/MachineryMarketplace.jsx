import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowDownUp, MapPin, Search, SlidersHorizontal, Star, Tractor } from 'lucide-react';
import Layout from '../components/Layout';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../context/useAuth';
import { machineService } from '../services/machineService';
import { calculateDistance } from '../utils/distance';
import './MachineryMarketplace.css';

const CATEGORIES = ['All equipment', 'Tractor', 'Harvester', 'Rotavator', 'Seeder', 'Cultivator', 'Plough', 'Sprayer'];
const iconForType = (type) => ({
  tractor: '🚜',
  harvester: '🌾',
  rotavator: '⚙️',
  seeder: '🌱',
  cultivator: '🛠️',
  plough: '🔩',
  sprayer: '💧',
}[String(type || '').toLowerCase()] || '🚜');

export default function MachineryMarketplace() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [machines, setMachines] = useState([]);
  const routeSearch = searchParams.get('search') || '';
  const [category, setCategory] = useState('All equipment');
  const [sort, setSort] = useState('newest');
  const [radius, setRadius] = useState('any');
  const [maxPrice, setMaxPrice] = useState('');
  const [minimumRating, setMinimumRating] = useState('0');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fetchMachines = async () => {
    const data = await machineService.getAll({ available: true, limit: 100 });
    return data.machines || [];
  };
  const loadMachines = async () => {
    setLoading(true);
    setError('');
    try {
      setMachines(await fetchMachines());
    } catch {
      setError('Unable to load machinery listings. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    let active = true;
    fetchMachines().then((items) => {
      if (active) setMachines(items);
    }).catch(() => {
      if (active) setError('Unable to load machinery listings. Please try again.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const filtered = (() => {
    const search = routeSearch.trim().toLowerCase();
    const items = machines.map((machine) => {
      const hasFarmerLocation = Number.isFinite(user?.location?.lat) && Number.isFinite(user?.location?.lng) &&
        (user.location.lat !== 0 || user.location.lng !== 0);
      const hasMachineLocation = Number.isFinite(machine.location?.lat) && Number.isFinite(machine.location?.lng) &&
        (machine.location.lat !== 0 || machine.location.lng !== 0);
      const distanceKm = hasFarmerLocation && hasMachineLocation
        ? calculateDistance(user.location.lat, user.location.lng, machine.location.lat, machine.location.lng)
        : null;
      return { ...machine, distanceKm };
    }).filter((machine) => {
      const matchesCategory = category === 'All equipment' || String(machine.type || '').toLowerCase() === category.toLowerCase();
      const matchesQuery = !search || [machine.name, machine.type, machine.description, machine.ownerName, machine.district, machine.state]
        .some((value) => String(value || '').toLowerCase().includes(search));
      const price = Number(machine.pricePerDay || 0);
      const rating = Number(machine.rating || 0);
      const max = Number(maxPrice);
      const withinPrice = !maxPrice || (Number.isFinite(max) && price <= max);
      const matchesRating = rating >= Number(minimumRating);
      const matchesRadius = radius === 'any' || machine.distanceKm === null || machine.distanceKm <= Number(radius);
      return matchesCategory && matchesQuery && withinPrice && matchesRating && matchesRadius;
    });
    if (sort === 'price-asc') items.sort((a, b) => (a.pricePerDay || 0) - (b.pricePerDay || 0));
    else if (sort === 'rating') items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sort === 'nearest') items.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    else items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return items;
  })();

  const handleSearchChange = (event) => {
    const nextParams = new URLSearchParams(searchParams);
    const value = event.target.value;
    if (value) nextParams.set('search', value);
    else nextParams.delete('search');
    setSearchParams(nextParams, { replace: true });
  };

  return (
    <Layout title="Machinery Marketplace">
      <div className="marketplace-page">
        <section className="marketplace-hero">
          <div><span className="marketplace-eyebrow"><Tractor size={15} /> LOCAL FARM EQUIPMENT</span>
            <h2>Right equipment.<br /><span>Ready when you are.</span></h2>
            <p>Browse available machinery from equipment owners in your community.</p>
          </div>
          <div className="marketplace-hero-art" aria-hidden="true"><span>🌱</span><span>🚜</span></div>
        </section>
        <div className="marketplace-tools">
          <label className="marketplace-search"><Search size={19} /><input type="search" value={routeSearch} onChange={handleSearchChange} placeholder="Search equipment, provider or location" aria-label="Search machinery listings" /></label>
          <label className="marketplace-sort"><ArrowDownUp size={16} /><span>Sort</span><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort equipment"><option value="newest">Recently added</option><option value="nearest">Nearest</option><option value="price-asc">Lowest price</option><option value="rating">Top rated</option></select></label>
        </div>
        <div className="marketplace-categories" aria-label="Filter by category">
          <SlidersHorizontal size={17} />
          {CATEGORIES.map((item) => <button type="button" key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}
        </div>
        <div className="marketplace-filter-row">
          <label>Within <select value={radius} onChange={(event) => setRadius(event.target.value)}><option value="any">Any distance</option><option value="10">10 km</option><option value="25">25 km</option><option value="50">50 km</option><option value="100">100 km</option></select></label>
          <label>Max price <span>₹</span><input type="number" min="0" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="Any" /></label>
          <label>Min rating <select value={minimumRating} onChange={(event) => setMinimumRating(event.target.value)}><option value="0">Any rating</option><option value="3">3+ stars</option><option value="4">4+ stars</option></select></label>
        </div>
        {!loading && !error && <p className="marketplace-results">{filtered.length} available listing{filtered.length === 1 ? '' : 's'}</p>}
        {loading && <Spinner text="Loading available machinery..." />}
        {!loading && error && <ErrorMessage message={error} onRetry={loadMachines} />}
        {!loading && !error && filtered.length === 0 && <div className="marketplace-empty"><span>🚜</span><h3>No equipment found</h3><p>Try another category or search term, or check back for new listings.</p></div>}
        {!loading && !error && filtered.length > 0 && (
          <div className="marketplace-grid">
            {filtered.map((machine) => (
              <article className="marketplace-card" key={machine._id}>
                <div className="marketplace-card-image">
                  {machine.images?.[0] ? <img src={machine.images[0]} alt={machine.name} loading="lazy" /> : <span className="marketplace-machine-emoji">{iconForType(machine.type)}</span>}
                  <span className="marketplace-available"><i /> Available</span>
                  <span className="marketplace-type">{machine.type}</span>
                </div>
                <div className="marketplace-card-content">
                  <div className="marketplace-title-row"><h3>{machine.name}</h3><span className="marketplace-rating"><Star size={14} fill="currentColor" /> {(machine.rating || 0).toFixed(1)}</span></div>
                  <p className="marketplace-provider">Provided by <b>{machine.ownerName || 'Local provider'}</b></p>
                  <div className="marketplace-location"><MapPin size={14} />{machine.distanceKm === null ? [machine.district, machine.state].filter(Boolean).join(', ') || 'Location not listed' : `${machine.distanceKm} km · ${[machine.district, machine.state].filter(Boolean).join(', ')}`}</div>
                  <div className="marketplace-card-footer">
                    <span><b>₹{Number(machine.pricePerDay || 0).toLocaleString('en-IN')}</b> / {(machine.priceUnit || 'per_day').replace('per_', '')}</span>
                    <button type="button" onClick={() => navigate(`/create-request?type=machine&category=${encodeURIComponent(machine.type)}`)}>Request service</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
