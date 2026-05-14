import { useState, useMemo } from 'react';
import { Leaf, Droplets, Sun, AlertTriangle, Calendar } from 'lucide-react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../context/AuthContext';
import { cropRecommendations, getSeasonForMonth } from '../data/intelligence';
import { southIndianStates } from '../data/categories';
import './CropRecommendation.css';

export default function CropRecommendation() {
  const { user } = useAuth();
  const currentMonth = new Date().getMonth();
  const defaultSeason = getSeasonForMonth(currentMonth);
  const [season, setSeason] = useState(defaultSeason);
  const [selectedState, setSelectedState] = useState(user?.state || 'ap');

  const stateName = southIndianStates.find(s => s.id === selectedState)?.name || '';
  const crops = useMemo(() => {
    const stateData = cropRecommendations[selectedState];
    return stateData?.[season] || [];
  }, [selectedState, season]);

  const getRiskColor = (risk) => {
    const map = { low: 'success', medium: 'warning', high: 'error' };
    return map[risk] || 'warning';
  };

  return (
    <div className="app-layout">
      <Header title="Crop Recommendation" showBack />
      <div className="page page-with-header" id="crop-recommendation-page">
        <div className="cr-header">
          <div className="cr-header-icon">🌾</div>
          <h1 className="heading-2">Crop Recommendations</h1>
          <p className="body-text">Smart suggestions based on your location and season</p>
        </div>

        {/* Filters */}
        <div className="cr-filters">
          <div className="input-group">
            <label className="input-label">State</label>
            <select className="input-field select-field" value={selectedState} onChange={e => setSelectedState(e.target.value)} id="cr-state">
              {southIndianStates.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="cr-season-toggle">
            <button className={`cr-season-btn ${season === 'kharif' ? 'cr-season-active' : ''}`} onClick={() => setSeason('kharif')} id="season-kharif">
              🌧️ Kharif
            </button>
            <button className={`cr-season-btn ${season === 'rabi' ? 'cr-season-active' : ''}`} onClick={() => setSeason('rabi')} id="season-rabi">
              ❄️ Rabi
            </button>
          </div>
        </div>

        <div className="cr-info-bar">
          <span>📍 {stateName}</span>
          <span>🗓️ {season === 'kharif' ? 'Jun - Nov' : 'Oct - Mar'}</span>
          <span>🌱 {crops.length} crops</span>
        </div>

        {/* Crop Cards */}
        <div className="cr-crops">
          {crops.map((crop, i) => (
            <div key={crop.name} className="cr-crop-card card" style={{ animationDelay: `${i * 0.08}s` }} id={`crop-${i}`}>
              <div className="cr-crop-header">
                <span className="cr-crop-emoji">{crop.emoji}</span>
                <div className="cr-crop-title-area">
                  <h3 className="cr-crop-name">{crop.name}</h3>
                  <span className={`badge badge-${getRiskColor(crop.risk)}`}>
                    {crop.risk === 'low' ? '✅' : '⚠️'} {crop.risk} risk
                  </span>
                </div>
              </div>

              <div className="cr-crop-details">
                <div className="cr-crop-detail">
                  <Leaf size={14} />
                  <span>Yield: <strong>{crop.yield}</strong></span>
                </div>
                <div className="cr-crop-detail">
                  <Calendar size={14} />
                  <span>Season: <strong>{crop.season}</strong></span>
                </div>
                <div className="cr-crop-detail">
                  <Droplets size={14} />
                  <span>Water: <strong>{crop.water}</strong></span>
                </div>
                <div className="cr-crop-detail">
                  <Sun size={14} />
                  <span>Soil: <strong>{crop.soil}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {crops.length === 0 && (
          <div className="nearby-empty">
            <span className="nearby-empty-emoji">🌾</span>
            <h3>No data available</h3>
            <p>Crop recommendations for this state/season will be added soon</p>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
