import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import Layout from '../components/Layout';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import { machineService } from '../services/machineService';
import { useAuth } from '../context/useAuth';
import { useApp } from '../context/AppContext';
import './Machines.css';

export default function Machines() {
  const { user } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMachines = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await machineService.getAll({ ownerId: user._id });
      setMachines(data.machines || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMachines(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this machine listing?')) return;
    try {
      await machineService.delete(id);
      showToast('Machine deleted');
      fetchMachines();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleAvailable = async (machine) => {
    try {
      await machineService.update(machine._id, { available: !machine.available });
      showToast(machine.available ? 'Marked as unavailable' : 'Marked as available');
      fetchMachines();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <Layout title="My Machines" showBack>
      <div id="machines-page">
        <div className="machines-header">
          <p className="machines-subtitle">Manage your machine listings</p>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/add-machine')} id="add-machine-btn">
            <Plus size={16} /> Add Machine
          </button>
        </div>

        {loading && <Spinner text="Loading machines..." />}
        {error && <ErrorMessage message={error} onRetry={fetchMachines} />}

        {!loading && !error && machines.length === 0 && (
          <div className="machines-empty">
            <span>🚜</span>
            <h3>No machines listed yet</h3>
            <p>Add your first machine to start getting requests</p>
            <button className="btn btn-primary" onClick={() => navigate('/add-machine')}>
              + List a Machine
            </button>
          </div>
        )}

        <div className="machines-list">
          {machines.map((machine) => (
            <div key={machine._id} className="machine-card card">
              <div className="machine-card-top">
                {machine.images?.[0] ? (
                  <img src={machine.images[0]} alt={machine.name} className="machine-img" />
                ) : (
                  <div className="machine-img-placeholder">🚜</div>
                )}
                <div className="machine-info">
                  <h3 className="machine-name">{machine.name}</h3>
                  <span className="machine-type badge badge-primary">{machine.type}</span>
                  <p className="machine-price">₹{machine.pricePerDay?.toLocaleString()} / {machine.priceUnit?.replace('per_', '')}</p>
                  <p className="machine-location">📍 {machine.district}, {machine.state}</p>
                </div>
              </div>

              <div className="machine-card-actions">
                <button
                  className={`machine-toggle ${machine.available ? 'available' : 'unavailable'}`}
                  onClick={() => handleToggleAvailable(machine)}
                >
                  {machine.available ? <><ToggleRight size={18} /> Available</> : <><ToggleLeft size={18} /> Unavailable</>}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/add-machine?edit=${machine._id}`)}>
                  <Edit size={15} />
                </button>
                <button className="btn btn-ghost btn-sm machine-delete" onClick={() => handleDelete(machine._id)}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
