import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Spinner from '../components/Spinner';
import { marketService } from '../services/marketService';
import './MarketInsights.css';

export default function MarketInsights() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await marketService.getPrices();
        setPrices(data.prices || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <Layout title="Market Prices" showBack>
      <div id="market-page">

        <div className="market-header">
          <p className="market-subtitle">Live mandi prices across South India</p>
          <span className="market-updated">Updated: {new Date().toLocaleDateString('en-IN')}</span>
        </div>

        {loading && <Spinner text="Loading prices..." />}
        {error && <p className="market-error">{error}</p>}

        <div className="market-grid">
          {prices.map((item, i) => (
            <div key={i} className="market-card card">
              <div className="market-card-top">
                <span className="market-emoji">{item.emoji}</span>
                <div className="market-info">
                  <h3 className="market-crop">{item.crop}</h3>
                  <span className="market-mandi">📍 {item.mandi}</span>
                </div>
                <div className={`market-trend ${item.trend}`}>
                  {item.trend === 'up' ? '▲' : '▼'} {Math.abs(item.change).toFixed(1)}%
                </div>
              </div>
              <div className="market-price-row">
                <span className="market-current">₹{item.currentPrice.toLocaleString('en-IN')}</span>
                <span className="market-unit">{item.unit}</span>
              </div>
              <div className="market-prev">
                Prev: ₹{item.previousPrice.toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
