import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { machineService } from '../services/machineService';
import { useApp } from '../context/AppContext';
import { MACHINE_TYPES } from '../constants/categories';
import './AddMachine.css';

export default function AddMachine() {
  const { showToast } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [form, setForm] = useState({
    name: '', type: '', description: '',
    pricePerDay: '', priceUnit: 'per_day',
  });

  const update = (f, v) => setForm((prev) => ({ ...prev, [f]: v }));

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.type || !form.pricePerDay) {
      return setError('Machine name, type, and price are required');
    }
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      images.forEach((img) => formData.append('images', img));
      await machineService.create(formData);
      showToast('Machine listed successfully!');
      navigate('/machines');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Add Machine" showBack>
      <div id="add-machine-page">
        <form onSubmit={handleSubmit} className="add-machine-form">
          {error && <div className="add-machine-error">{error}</div>}

          <div className="input-group">
            <label className="input-label">Machine Name *</label>
            <input id="machine-name" className="input-field" placeholder="e.g., Mahindra 575 DI Tractor"
              value={form.name} onChange={(e) => update('name', e.target.value)} required />
          </div>

          <div className="input-group">
            <label className="input-label">Machine Type *</label>
            <select id="machine-type" className="input-field select-field"
              value={form.type} onChange={(e) => update('type', e.target.value)} required>
              <option value="">Select type...</option>
              {MACHINE_TYPES.map((m) => (
                <option key={m.id} value={m.id}>{m.icon} {m.name}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Description</label>
            <textarea id="machine-desc" className="input-field" rows={3}
              placeholder="Year, condition, horsepower, attachments included..."
              value={form.description} onChange={(e) => update('description', e.target.value)}
              style={{ minHeight: '80px', resize: 'vertical' }} />
          </div>

          <div className="add-machine-row">
            <div className="input-group">
              <label className="input-label">Price (₹) *</label>
              <input id="machine-price" type="number" className="input-field" placeholder="e.g., 2500"
                min="0" value={form.pricePerDay} onChange={(e) => update('pricePerDay', e.target.value)} required />
            </div>
            <div className="input-group">
              <label className="input-label">Per</label>
              <select id="machine-price-unit" className="input-field select-field"
                value={form.priceUnit} onChange={(e) => update('priceUnit', e.target.value)}>
                <option value="per_day">Day</option>
                <option value="per_hour">Hour</option>
                <option value="per_acre">Acre</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Photos (up to 5)</label>
            <input id="machine-images" type="file" accept="image/*" multiple
              onChange={handleImages} className="input-field" />
            {previews.length > 0 && (
              <div className="machine-previews">
                {previews.map((p, i) => (
                  <img key={i} src={p} alt={`Preview ${i + 1}`} className="machine-preview-img" />
                ))}
              </div>
            )}
          </div>

          <button id="add-machine-submit" type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? '⏳ Submitting...' : '🚜 List Machine'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
