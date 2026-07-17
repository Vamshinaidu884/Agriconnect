import { useState, useRef } from 'react';
import Layout from '../components/Layout';
import Spinner from '../components/Spinner';
import { diseaseService } from '../services/diseaseService';
import './DiseaseDetection.css';

export default function DiseaseDetection() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return setError('Please select an image file');
    if (file.size > 5 * 1024 * 1024) return setError('Image must be under 5 MB');
    
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError('');
    setLoading(true);

    try {
      const data = await diseaseService.detect(file);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const severityColor = (s) => s === 'high' ? '#C62828' : s === 'medium' ? '#F9A825' : '#2E7D32';

  return (
    <Layout title="Disease Detection" showBack>
      <div id="disease-detection-page">

        {/* Upload Area */}
        <div className="disease-upload-area"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}>
          {preview ? (
            <img src={preview} alt="Plant" className="disease-preview-img" />
          ) : (
            <>
              <span className="disease-upload-icon">📷</span>
              <p className="disease-upload-text">Tap to upload or drag & drop a plant photo</p>
              <p className="disease-upload-hint">Supported: JPG, PNG, WebP (max 5 MB)</p>
            </>
          )}
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => handleFile(e.target.files[0])} />
        </div>

        {error && <div className="disease-error">{error}</div>}

        {loading && <Spinner text="Analyzing plant... Please wait" />}

        {/* Result */}
        {result && (
          <div className="disease-result">
            {result.isHealthy ? (
              <div className="disease-healthy card">
                <span className="disease-icon">✅</span>
                <h2>Plant is Healthy!</h2>
                <p>No diseases detected. Keep up the good farm care!</p>
              </div>
            ) : (
              <div className="disease-card card">
                <div className="disease-header">
                  <span className="disease-icon">{result.disease?.icon || '🦠'}</span>
                  <div>
                    <h2 className="disease-name">{result.disease?.name}</h2>
                    <div className="disease-meta">
                      <span className="disease-confidence">
                        {result.disease?.confidence}% confidence
                      </span>
                      <span className="disease-severity" style={{ color: severityColor(result.disease?.severity) }}>
                        ● {result.disease?.severity} severity
                      </span>
                    </div>
                    {result.disease?.crop && <span className="disease-crop-badge badge badge-primary">{result.disease.crop}</span>}
                  </div>
                </div>

                {result.disease?.cause && (
                  <div className="disease-section">
                    <h3>🔬 Cause</h3>
                    <p>{result.disease.cause}</p>
                  </div>
                )}

                {result.disease?.symptoms?.length > 0 && (
                  <div className="disease-section">
                    <h3>⚠️ Symptoms</h3>
                    <ul>{result.disease.symptoms.map((s, i) => <li key={i}>{s}</li>)}</ul>
                  </div>
                )}

                {result.disease?.prevention?.length > 0 && (
                  <div className="disease-section">
                    <h3>🛡️ Prevention</h3>
                    <ul>{result.disease.prevention.map((p, i) => <li key={i}>{p}</li>)}</ul>
                  </div>
                )}

                {result.disease?.medicine?.length > 0 && (
                  <div className="disease-section disease-medicine">
                    <h3>💊 Recommended Treatment</h3>
                    <ul>{result.disease.medicine.map((m, i) => <li key={i}>{m}</li>)}</ul>
                  </div>
                )}

                {result.note && <p className="disease-note">{result.note}</p>}
              </div>
            )}

            <button className="btn btn-ghost btn-lg" onClick={() => { setResult(null); setPreview(null); setImage(null); }}>
              🔄 Scan Another Plant
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
