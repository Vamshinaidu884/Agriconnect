import { useEffect, useState } from 'react';
import { ArrowRight, MapPin, Sparkles, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import { recommendationService } from '../services/recommendationService';
import './MachineryMarketplace.css';
import './Recommendations.css';

const equipmentEmoji = (type) => ({
  tractor: '🚜', harvester: '🌾', rotavator: '⚙️', seeder: '🌱',
  cultivator: '🛠️', plough: '🔩', sprayer: '💧',
}[String(type || '').toLowerCase()] || '🚜');

export default function Recommendations() {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fetchRecommendations = async () => recommendationService.getForMe();
  useEffect(() => {
    let active = true;
    fetchRecommendations().then((data) => {
      if (!active) return;
      setRecommendations(data.recommendations || []);
      setExplanation(data.explanation || '');
    }).catch(() => {
      if (active) setError('Unable to load recommendations. Please try again.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);
  const retry = () => {
    setLoading(true);
    setError('');
    fetchRecommendations().then((data) => {
      setRecommendations(data.recommendations || []);
      setExplanation(data.explanation || '');
    }).catch(() => {
      setError('Unable to load recommendations. Please try again.');
    }).finally(() => {
      setLoading(false);
    });
  };

  return (
    <Layout title="Smart Recommendations">
      <div className="recommendations-page">
        <header className="recommendations-hero">
          <div className="recommendations-icon"><Sparkles size={22} /></div>
          <div><span className="marketplace-eyebrow">PERSONALISED FOR YOUR FARM</span><h2>Recommended for you</h2><p>Discover available equipment matched to your needs and local area.</p></div>
        </header>
        <p className="recommendations-explanation">{explanation || 'We compare proximity, provider ratings, price, availability and your previous machine requests.'}</p>
        {loading && <Spinner text="Finding your best matches..." />}
        {!loading && error && <ErrorMessage message={error} onRetry={retry} />}
        {!loading && !error && recommendations.length === 0 && <div className="marketplace-empty"><span>🌱</span><h3>Your recommendations are growing</h3><p>No equipment is listed yet. Check the machinery marketplace again soon.</p><button className="btn btn-primary" onClick={() => navigate('/marketplace/machinery')}>Browse marketplace</button></div>}
        {!loading && !error && recommendations.length > 0 && (
          <div className="marketplace-grid">
            {recommendations.map((machine, index) => (
              <article className="marketplace-card" key={machine._id}>
                <div className="marketplace-card-image">
                  {machine.images?.[0] ? <img src={machine.images[0]} alt={machine.name} loading="lazy" /> : <span className="marketplace-machine-emoji">{equipmentEmoji(machine.type)}</span>}
                  <span className="recommendation-match"><Sparkles size={13} /> Match {Math.round(machine.recommendationScore * 100)}%</span>
                  <span className="marketplace-type">#{index + 1} match</span>
                </div>
                <div className="marketplace-card-content">
                  <div className="marketplace-title-row"><h3>{machine.name}</h3><span className="marketplace-rating"><Star size={14} fill="currentColor" /> {(machine.rating || 0).toFixed(1)}</span></div>
                  <p className="marketplace-provider">Provided by <b>{machine.ownerName || 'Local provider'}</b></p>
                  <div className="marketplace-location"><MapPin size={14} /> {machine.distanceKm === null ? [machine.district, machine.state].filter(Boolean).join(', ') || 'Location not listed' : `${machine.distanceKm} km away`}</div>
                  <div className="marketplace-card-footer"><span><b>₹{Number(machine.pricePerDay || 0).toLocaleString('en-IN')}</b> / {(machine.priceUnit || 'per_day').replace('per_', '')}</span><button onClick={() => navigate(`/create-request?type=machine&category=${encodeURIComponent(machine.type)}`)}>Request service <ArrowRight size={13} /></button></div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
