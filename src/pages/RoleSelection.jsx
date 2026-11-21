import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { Check } from 'lucide-react';
import './RoleSelection.css';

const roles = [
  { id: 'farmer', emoji: '👨‍🌾', title: 'Farmer', desc: 'Post jobs, hire labour, rent machines' },
  { id: 'labour', emoji: '👷', title: 'Labour Worker', desc: 'Find farming work nearby' },
  { id: 'machine_owner', emoji: '🚜', title: 'Machine Owner', desc: 'Rent your machines to farmers' },
];

export default function RoleSelection() {
  const [selected, setSelected] = useState([]);
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  const toggleRole = (roleId) => {
    setSelected(prev =>
      prev.includes(roleId) ? prev.filter(r => r !== roleId) : [...prev, roleId]
    );
  };

  const handleContinue = () => {
    if (selected.length === 0) return;
    updateUser({ roles: selected, isNewUser: false });
    navigate('/home', { replace: true });
  };

  return (
    <div className="role-page" id="role-selection-page">
      <div className="role-content">
        <div className="role-header">
          <h1 className="heading-2">Choose Your Role</h1>
          <p className="body-text">Select one or more roles. You can change anytime.</p>
        </div>

        <div className="role-grid">
          {roles.map((role, i) => (
            <button
              key={role.id}
              className={`role-card card ${selected.includes(role.id) ? 'role-card-selected' : ''}`}
              onClick={() => toggleRole(role.id)}
              style={{ animationDelay: `${i * 0.1}s` }}
              id={`role-${role.id}`}
            >
              {selected.includes(role.id) && (
                <div className="role-check">
                  <Check size={16} />
                </div>
              )}
              <span className="role-emoji">{role.emoji}</span>
              <h3 className="role-title">{role.title}</h3>
              <p className="role-desc">{role.desc}</p>
            </button>
          ))}
        </div>

        <button
          className="btn btn-primary btn-full btn-lg"
          onClick={handleContinue}
          disabled={selected.length === 0}
          id="role-continue"
        >
          Continue ({selected.length} selected)
        </button>
      </div>
    </div>
  );
}
