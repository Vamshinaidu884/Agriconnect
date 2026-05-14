import { useState, useRef } from 'react';
import { Camera, Upload, Scan, AlertTriangle, Shield, Pill, ChevronDown, ChevronUp } from 'lucide-react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { getRandomDisease } from '../data/intelligence';
import './DiseaseDetection.css';

export default function DiseaseDetection() {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const fileRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleAnalyze = () => {
    if (!image) return;
    setAnalyzing(true);
    // Simulate AI analysis with mock data
    setTimeout(() => {
      setResult(getRandomDisease());
      setAnalyzing(false);
    }, 2500);
  };

  const handleReset = () => {
    setImage(null);
    setImagePreview(null);
    setResult(null);
    setExpandedSection(null);
  };

  const toggleSection = (section) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  const getSeverityColor = (severity) => {
    const map = { low: 'success', medium: 'warning', high: 'error' };
    return map[severity] || 'warning';
  };

  return (
    <div className="app-layout">
      <Header title="Disease Detection" showBack />
      <div className="page page-with-header" id="disease-detection-page">
        <div className="dd-header">
          <div className="dd-header-icon">🦠</div>
          <h1 className="heading-2">Plant Disease Detection</h1>
          <p className="body-text">Upload a photo of your plant to detect diseases and get treatment suggestions</p>
        </div>

        {/* Upload Area */}
        {!imagePreview ? (
          <div className="dd-upload-area" onClick={() => fileRef.current?.click()} id="dd-upload">
            <div className="dd-upload-icon">
              <Camera size={40} />
            </div>
            <h3>Upload Plant Photo</h3>
            <p>Take a photo or choose from gallery</p>
            <div className="dd-upload-buttons">
              <button className="btn btn-primary" type="button">
                <Camera size={18} /> Camera
              </button>
              <button className="btn btn-secondary" type="button">
                <Upload size={18} /> Gallery
              </button>
            </div>
          </div>
        ) : (
          <div className="dd-preview">
            <img src={imagePreview} alt="Plant" className="dd-preview-image" />
            <div className="dd-preview-actions">
              <button className="btn btn-ghost btn-sm" onClick={handleReset}>Change Photo</button>
            </div>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageSelect}
          style={{ display: 'none' }}
          id="dd-file-input"
        />

        {/* Analyze Button */}
        {imagePreview && !result && (
          <button
            className={`btn btn-primary btn-full btn-lg dd-analyze-btn ${analyzing ? 'dd-analyzing' : ''}`}
            onClick={handleAnalyze}
            disabled={analyzing}
            id="dd-analyze"
          >
            {analyzing ? (
              <>
                <div className="dd-scan-animation">
                  <Scan size={20} className="dd-scan-icon" />
                </div>
                Analyzing...
              </>
            ) : (
              <>
                <Scan size={20} /> Analyze Plant
              </>
            )}
          </button>
        )}

        {/* Analyzing Animation */}
        {analyzing && (
          <div className="dd-analyzing-card card">
            <div className="dd-analyzing-dots">
              <span /><span /><span />
            </div>
            <p>AI is analyzing your plant image...</p>
            <div className="dd-progress-bar">
              <div className="dd-progress-fill" />
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="dd-results" id="dd-results">
            {/* Disease Card */}
            <div className="dd-result-card card">
              <div className="dd-result-header">
                <div className="dd-result-icon">{result.icon}</div>
                <div className="dd-result-info">
                  <h2 className="dd-result-name">{result.name}</h2>
                  <span className="dd-result-crop">Commonly affects: {result.crop}</span>
                </div>
              </div>

              <div className="dd-confidence-bar">
                <div className="dd-confidence-label">
                  <span>Confidence</span>
                  <span className="dd-confidence-value">{result.confidence}%</span>
                </div>
                <div className="dd-confidence-track">
                  <div className="dd-confidence-fill" style={{ width: `${result.confidence}%` }} />
                </div>
              </div>

              <div className={`dd-severity badge badge-${getSeverityColor(result.severity)}`}>
                <AlertTriangle size={14} />
                Severity: {result.severity.toUpperCase()}
              </div>
            </div>

            {/* Cause Section */}
            <button className="dd-section-toggle card" onClick={() => toggleSection('cause')} id="toggle-cause">
              <div className="dd-section-toggle-left">
                <span className="dd-section-emoji">🔍</span>
                <span className="dd-section-title">Cause</span>
              </div>
              {expandedSection === 'cause' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {expandedSection === 'cause' && (
              <div className="dd-section-content card">
                <p>{result.cause}</p>
                <h4>Symptoms:</h4>
                <ul className="dd-symptom-list">
                  {result.symptoms.map((s, i) => (
                    <li key={i}><span className="dd-bullet">•</span> {s}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Prevention Section */}
            <button className="dd-section-toggle card" onClick={() => toggleSection('prevention')} id="toggle-prevention">
              <div className="dd-section-toggle-left">
                <span className="dd-section-emoji">🛡️</span>
                <span className="dd-section-title">Prevention</span>
              </div>
              {expandedSection === 'prevention' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {expandedSection === 'prevention' && (
              <div className="dd-section-content card">
                <ul className="dd-list">
                  {result.prevention.map((p, i) => (
                    <li key={i}>
                      <Shield size={14} className="dd-list-icon" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Medicine Section */}
            <button className="dd-section-toggle card" onClick={() => toggleSection('medicine')} id="toggle-medicine">
              <div className="dd-section-toggle-left">
                <span className="dd-section-emoji">💊</span>
                <span className="dd-section-title">Suggested Medicine</span>
              </div>
              {expandedSection === 'medicine' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {expandedSection === 'medicine' && (
              <div className="dd-section-content card">
                <ul className="dd-list">
                  {result.medicine.map((m, i) => (
                    <li key={i}>
                      <Pill size={14} className="dd-list-icon" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Scan Again */}
            <button className="btn btn-outline btn-full" onClick={handleReset} style={{ marginTop: '1rem' }} id="dd-scan-again">
              🔄 Scan Another Plant
            </button>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
