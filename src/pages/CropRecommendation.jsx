import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Spinner from '../components/Spinner';
import { cropService } from '../services/cropService';
import { ALL_STATES } from '../constants/categories';
import './CropRecommendation.css';

const SEASONS = [
  { id: 'kharif', label: 'Kharif', desc: 'Jun – Nov (Monsoon)', icon: '🌧️' },
  { id: 'rabi', label: 'Rabi', desc: 'Nov – Apr (Winter)', icon: '❄️' },
];

export default function CropRecommendation() {
  const [state, setState] = useState('ap');
  const [season, setSeason] = useState('');
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCrops = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await cropService.getRecommendations(state, season);
      setCrops(data.crops || []);
      if (!season) setSeason(data.season);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCrops(); }, [state, season]);

  const riskColor = (r) => r === 'low' ? '#2E7D32' : r === 'medium' ? '#F9A825' : '#C62828';

  return (
    <Layout title="Crop Recommendation" showBack>
      <div id="crop-recommendation-page">

        {/* State Selector */}
        <div className="input-group">
          <label className="input-label">Select State</label>
          <select id="crop-state" className="input-field select-field"
            value={state} onChange={(e) => setState(e.target.value)}>
            {ALL_STATES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {/* Season Selector */}
        <div className="crop-seasons">
          {SEASONS.map(s => (
            <button key={s.id} id={`season-${s.id}`}
              className={`season-card card ${season === s.id ? 'season-selected' : ''}`}
              onClick={() => setSeason(s.id)}>
              <span className="season-icon">{s.icon}</span>
              <span className="season-label">{s.label}</span>
              <span className="season-desc">{s.desc}</span>
            </button>
          ))}
        </div>

        {loading && <Spinner text="Getting recommendations..." />}
        {error && <p style={{ color: '#C62828', textAlign: 'center' }}>{error}</p>}

        {!loading && crops.length > 0 && (
          <div className="crop-grid">
            {crops.map((crop, i) => (
              <div key={i} className="crop-card card">
                <div className="crop-top">
                  <span className="crop-emoji">{crop.emoji}</span>
                  <div>
                    <h3 className="crop-name">{crop.name}</h3>
                    <span className="crop-risk" style={{ color: riskColor(crop.risk) }}>
                      ● {crop.risk} risk
                    </span>
                  </div>
                </div>
                <div className="crop-details">
                  <div className="crop-detail"><span>📅</span> {crop.season || season}</div>
                  <div className="crop-detail"><span>📦</span> {crop.yield}</div>
                  <div className="crop-detail"><span>💧</span> Water: {crop.water}</div>
                  <div className="crop-detail"><span>🌍</span> {crop.soil}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && crops.length === 0 && !error && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            <p>No crops found for selected state/season</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
