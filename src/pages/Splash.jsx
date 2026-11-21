import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import './Splash.css';

export default function Splash() {
  const [phase, setPhase] = useState(0);
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 1000);
    const t3 = setTimeout(() => setPhase(3), 1800);
    const t4 = setTimeout(() => {
      if (!isLoading) {
        navigate(isAuthenticated ? '/home' : '/login', { replace: true });
      }
    }, 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="splash" id="splash-screen">
      <div className="splash-bg">
        <div className="splash-circle splash-circle-1" />
        <div className="splash-circle splash-circle-2" />
        <div className="splash-circle splash-circle-3" />
      </div>

      <div className={`splash-content ${phase >= 1 ? 'visible' : ''}`}>
        <div className={`splash-logo-container ${phase >= 1 ? 'animate' : ''}`}>
          <img src="/logo.png" alt="Agri Connect" className="splash-logo" />
          <div className="splash-logo-glow" />
        </div>

        <h1 className={`splash-title ${phase >= 2 ? 'visible' : ''}`}>
          <span className="splash-title-agri">Argi</span>
          <span className="splash-title-match">Match</span>
        </h1>

        <p className={`splash-tagline ${phase >= 3 ? 'visible' : ''}`}>
          Smart Farming Starts Here
        </p>

        <div className={`splash-dots ${phase >= 3 ? 'visible' : ''}`}>
          <span className="splash-dot" />
          <span className="splash-dot" />
          <span className="splash-dot" />
        </div>
      </div>
    </div>
  );
}
