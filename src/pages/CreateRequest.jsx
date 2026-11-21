import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/useAuth';
import { useApp } from '../context/AppContext';
import { labourCategories, machineCategories, workTimeSlots, southIndianStates } from '../data/categories';
import { getCurrentLocation, getStateCenter, isValidLocation } from '../utils/location';
import './CreateRequest.css';

const STEPS = ['Type', 'Details', 'Schedule', 'Confirm'];

export default function CreateRequest() {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') || '';
  const [step, setStep] = useState(initialType ? 1 : 0);
  const [form, setForm] = useState({
    type: initialType, subType: '', title: '', description: '',
    landArea: '', landUnit: 'acres', priceOffered: '', priceUnit: 'per_day',
    foodProvided: false, workersNeeded: 1, timeSlot: 'morning',
    date: '', driverRequired: false,
  });
  const { user } = useAuth();
  const { createRequest } = useApp();
  const navigate = useNavigate();

  const allLabour = [...labourCategories.withoutTools, ...labourCategories.withTools];
  const categories = form.type === 'labour' ? allLabour : machineCategories;
  const selectedCat = categories.find(c => c.id === form.subType);
  const stateName = southIndianStates.find(s => s.id === user?.state)?.name || '';

  const update = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const canNext = () => {
    if (step === 0) return !!form.type;
    if (step === 1) return !!form.subType && !!form.title;
    if (step === 2) return !!form.date && !!form.timeSlot && !!form.priceOffered && form.workersNeeded >= 1;
    return true;
  };

  const handleSubmit = async () => {
    let requestLocation = isValidLocation(user?.location) ? user.location : null;
    if (!requestLocation) {
      try {
        requestLocation = await getCurrentLocation();
      } catch {
        requestLocation = getStateCenter(user?.state);
      }
    }

    if (!requestLocation) {
      alert('Set your location in your profile or allow location access to post a nearby request.');
      return;
    }

    const request = {
      title: form.title,
      description: form.description,
      type: form.type,
      category: form.subType || selectedCat?.id || 'general',
      workersNeeded: Number(form.workersNeeded) || 1,
      date: new Date(form.date),
      timeSlot: form.timeSlot,
      priceOffered: Number(form.priceOffered) || 0,
      priceUnit: form.priceUnit,
      foodProvided: !!form.foodProvided,
      driverRequired: !!form.driverRequired,
      landArea: Number(form.landArea) || 0,
      landUnit: form.landUnit,
      location: {
        lat: Number(requestLocation.lat),
        lng: Number(requestLocation.lng),
        address: user?.location?.address || user?.village || user?.district || '',
      },
      district: user?.district || '',
      state: user?.state || '',
    };

    try {
      await createRequest(request);
      navigate('/my-requests', { replace: true });
    } catch (error) {
      alert(error.message || 'Unable to save farm request. Please try again.');
    }
  };

  return (
    <Layout title="Create Request" showBack>
      <div id="create-request-page">
        {/* Step Indicator */}
        <div className="steps">
          {STEPS.map((s, i) => (
            <div key={s} className={`step ${i <= step ? 'step-active' : ''} ${i < step ? 'step-done' : ''}`}>
              <div className="step-dot">{i < step ? '✓' : i + 1}</div>
              <span className="step-label">{s}</span>
            </div>
          ))}
        </div>

        {/* Step 0: Type */}
        {step === 0 && (
          <div className="create-step" id="step-type">
            <h2 className="heading-3">What do you need?</h2>
            <div className="type-cards">
              <button className={`type-card card ${form.type === 'labour' ? 'type-card-selected' : ''}`} onClick={() => update('type', 'labour')} id="type-labour">
                <span className="type-card-emoji">👷</span>
                <span className="type-card-title">Labour</span>
                <span className="type-card-desc">Workers for your farm</span>
              </button>
              <button className={`type-card card ${form.type === 'machine' ? 'type-card-selected' : ''}`} onClick={() => update('type', 'machine')} id="type-machine">
                <span className="type-card-emoji">🚜</span>
                <span className="type-card-title">Machine</span>
                <span className="type-card-desc">Equipment & vehicles</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Details */}
        {step === 1 && (
          <div className="create-step" id="step-details">
            <h2 className="heading-3">Select {form.type === 'labour' ? 'Work' : 'Machine'} Type</h2>
            <div className="category-grid">
              {categories.map(cat => (
                <button key={cat.id} className={`category-card card ${form.subType === cat.id ? 'category-card-selected' : ''}`} onClick={() => update('subType', cat.id)} id={`cat-${cat.id}`}>
                  <span className="category-emoji">{cat.icon}</span>
                  <span className="category-name">{cat.name}</span>
                </button>
              ))}
            </div>
            <div className="input-group" style={{ marginTop: '1rem' }}>
              <label className="input-label">Request Title *</label>
              <input className="input-field" placeholder="e.g., Need 3 workers for paddy cutting" value={form.title} onChange={e => update('title', e.target.value)} id="request-title" />
            </div>
            <div className="input-group">
              <label className="input-label">Description</label>
              <textarea className="input-field" rows={3} placeholder="Add more details about the work..." value={form.description} onChange={e => update('description', e.target.value)} id="request-description" style={{ minHeight: '80px', resize: 'vertical' }} />
            </div>
          </div>
        )}

        {/* Step 2: Schedule & Price */}
        {step === 2 && (
          <div className="create-step" id="step-schedule">
            <h2 className="heading-3">Schedule & Pricing</h2>
            <div className="create-row">
              <div className="input-group">
                <label className="input-label">Date *</label>
                <input type="date" className="input-field" value={form.date} onChange={e => update('date', e.target.value)} id="request-date" />
              </div>
              <div className="input-group">
                <label className="input-label">{form.type === 'labour' ? 'Workers Needed' : 'Machines Needed'} *</label>
                <input type="number" min="1" max="50" className="input-field" value={form.workersNeeded} onChange={e => update('workersNeeded', e.target.value)} id="request-workers" />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Time Slot</label>
              <div className="timeslot-grid">
                {workTimeSlots.map(slot => (
                  <button key={slot.id} className={`timeslot-card card ${form.timeSlot === slot.id ? 'timeslot-selected' : ''}`} onClick={() => update('timeSlot', slot.id)} id={`slot-${slot.id}`}>
                    <span>{slot.icon}</span>
                    <span className="timeslot-name">{slot.name}</span>
                    <span className="timeslot-time">{slot.time}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="create-row">
              <div className="input-group">
                <label className="input-label">Price Offered (₹) *</label>
                <input type="number" className="input-field" placeholder="e.g., 500" value={form.priceOffered} onChange={e => update('priceOffered', e.target.value)} id="request-price" />
              </div>
              <div className="input-group">
                <label className="input-label">Per</label>
                <select className="input-field select-field" value={form.priceUnit} onChange={e => update('priceUnit', e.target.value)} id="request-price-unit">
                  <option value="per_day">Day</option>
                  <option value="per_hour">Hour</option>
                  <option value="per_acre">Acre</option>
                </select>
              </div>
            </div>

            <div className="create-row">
              <div className="input-group">
                <label className="input-label">Land Area</label>
                <input type="number" className="input-field" placeholder="e.g., 5" value={form.landArea} onChange={e => update('landArea', e.target.value)} id="request-area" />
              </div>
              <div className="input-group">
                <label className="input-label">Unit</label>
                <select className="input-field select-field" value={form.landUnit} onChange={e => update('landUnit', e.target.value)}>
                  <option value="acres">Acres</option>
                  <option value="hectares">Hectares</option>
                </select>
              </div>
            </div>

            <div className="create-toggles">
              <label className="toggle-item" id="toggle-food">
                <span>🍛 Food Provided</span>
                <input type="checkbox" checked={form.foodProvided} onChange={e => update('foodProvided', e.target.checked)} />
                <span className="toggle-switch" />
              </label>
              {form.type === 'machine' && (
                <label className="toggle-item" id="toggle-driver">
                  <span>🧑‍✈️ Driver Required</span>
                  <input type="checkbox" checked={form.driverRequired} onChange={e => update('driverRequired', e.target.checked)} />
                  <span className="toggle-switch" />
                </label>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="create-step" id="step-confirm">
            <h2 className="heading-3">Confirm Request</h2>
            <div className="confirm-card card">
              <div className="confirm-row">
                <span className="confirm-label">Type</span>
                <span className="confirm-value">{form.type === 'labour' ? '👷 Labour' : '🚜 Machine'}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label">Category</span>
                <span className="confirm-value">{selectedCat?.icon} {selectedCat?.name}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label">Title</span>
                <span className="confirm-value">{form.title}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label">Date</span>
                <span className="confirm-value">{form.date}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label">Time</span>
                <span className="confirm-value">{workTimeSlots.find(s => s.id === form.timeSlot)?.name}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label">Workers</span>
                <span className="confirm-value">{form.workersNeeded}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label">Price</span>
                <span className="confirm-value confirm-price">₹{form.priceOffered}/{form.priceUnit?.replace('per_', '')}</span>
              </div>
              {form.landArea && (
                <div className="confirm-row">
                  <span className="confirm-label">Land Area</span>
                  <span className="confirm-value">{form.landArea} {form.landUnit}</span>
                </div>
              )}
              <div className="confirm-row">
                <span className="confirm-label">Location</span>
                <span className="confirm-value">{user?.district}, {stateName}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label">Food</span>
                <span className="confirm-value">{form.foodProvided ? '✅ Yes' : '❌ No'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="create-nav">
          {step > 0 && (
            <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)} id="create-back">
              <ChevronLeft size={18} /> Back
            </button>
          )}
          <div style={{ flex: 1 }} />
          {step < 3 ? (
            <button className="btn btn-primary" onClick={() => setStep(s => s + 1)} disabled={!canNext()} id="create-next">
              Next <ChevronRight size={18} />
            </button>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={handleSubmit} id="create-submit">
              🚀 Post Request
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
}
