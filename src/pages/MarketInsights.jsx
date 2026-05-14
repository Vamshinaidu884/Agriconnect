import { useState } from 'react';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { marketPrices } from '../data/intelligence';
import { formatPrice } from '../utils/helpers';
import './MarketInsights.css';

export default function MarketInsights() {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? marketPrices
    : filter === 'up' ? marketPrices.filter(p => p.trend === 'up')
    : marketPrices.filter(p => p.trend === 'down');

  const avgChange = (marketPrices.reduce((sum, p) => sum + p.change, 0) / marketPrices.length).toFixed(1);
  const upCount = marketPrices.filter(p => p.trend === 'up').length;
  const downCount = marketPrices.filter(p => p.trend === 'down').length;

  return (
    <div className="app-layout">
      <Header title="Market Insights" showBack />
      <div className="page page-with-header" id="market-insights-page">
        <div className="mi-header">
          <div className="mi-header-icon">📊</div>
          <h1 className="heading-2">Market Insights</h1>
          <p className="body-text">Live crop prices and sell/wait recommendations</p>
        </div>

        {/* Summary Cards */}
        <div className="mi-summary">
          <div className="mi-summary-card card mi-card-up">
            <TrendingUp size={20} />
            <span className="mi-summary-value">{upCount}</span>
            <span className="mi-summary-label">Crops Up</span>
          </div>
          <div className="mi-summary-card card mi-card-down">
            <TrendingDown size={20} />
            <span className="mi-summary-value">{downCount}</span>
            <span className="mi-summary-label">Crops Down</span>
          </div>
          <div className="mi-summary-card card mi-card-avg">
            <span className="mi-summary-value">{avgChange > 0 ? '+' : ''}{avgChange}%</span>
            <span className="mi-summary-label">Avg Change</span>
          </div>
        </div>

        {/* Filters */}
        <div className="nearby-filters" style={{ marginBottom: '1rem' }}>
          {[
            { id: 'all', label: 'All Crops' },
            { id: 'up', label: '📈 Rising' },
            { id: 'down', label: '📉 Falling' },
          ].map(f => (
            <button key={f.id} className={`nearby-filter ${filter === f.id ? 'nearby-filter-active' : ''}`} onClick={() => setFilter(f.id)} id={`mi-filter-${f.id}`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Price Cards */}
        <div className="mi-prices">
          {filtered.map((item, i) => (
            <div key={item.crop} className="mi-price-card card" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="mi-price-left">
                <span className="mi-price-emoji">{item.emoji}</span>
                <div className="mi-price-info">
                  <h3 className="mi-price-crop">{item.crop}</h3>
                  <span className="mi-price-mandi">📍 {item.mandi}</span>
                </div>
              </div>

              <div className="mi-price-right">
                <div className="mi-price-current">
                  <span className="mi-price-amount">{formatPrice(item.currentPrice)}</span>
                  <span className="mi-price-unit">{item.unit}</span>
                </div>
                <div className={`mi-price-change ${item.trend === 'up' ? 'mi-change-up' : 'mi-change-down'}`}>
                  {item.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span>{item.change > 0 ? '+' : ''}{item.change}%</span>
                </div>
              </div>

              {/* Price Bar */}
              <div className="mi-price-bar-container">
                <div className="mi-price-bar">
                  <div className="mi-price-prev" style={{ width: `${(item.previousPrice / Math.max(item.currentPrice, item.previousPrice)) * 100}%` }} />
                  <div className={`mi-price-curr ${item.trend === 'up' ? 'mi-bar-up' : 'mi-bar-down'}`} style={{ width: `${(item.currentPrice / Math.max(item.currentPrice, item.previousPrice)) * 100}%` }} />
                </div>
                <div className="mi-price-bar-labels">
                  <span>Prev: {formatPrice(item.previousPrice)}</span>
                  <span>Now: {formatPrice(item.currentPrice)}</span>
                </div>
              </div>

              {/* Recommendation */}
              <div className={`mi-recommendation ${item.trend === 'up' ? 'mi-rec-sell' : 'mi-rec-wait'}`}>
                <span>{item.trend === 'up' && item.change > 5 ? '🔥 Sell Now — Prices Rising!' : item.trend === 'up' ? '📈 Good time to sell' : '⏳ Wait — Prices May Recover'}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mi-disclaimer card">
          <p>⚠️ Prices are indicative and based on recent mandi data. Actual prices may vary. Always verify with local market before selling.</p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
