/* WeatherWidget — Displays current weather card */
import { useWeather } from '../hooks/useWeather';
import './WeatherWidget.css';

export default function WeatherWidget({ lat, lng }) {
  const { weather, loading } = useWeather(lat, lng);

  if (loading) {
    return (
      <div className="weather-widget weather-loading">
        <span>🌤️ Loading weather...</span>
      </div>
    );
  }

  if (!weather) return null;

  const bgClass = weather.condition === 'Rain' || weather.condition === 'Drizzle'
    ? 'weather-rainy'
    : weather.condition === 'Clear'
    ? 'weather-sunny'
    : 'weather-cloudy';

  return (
    <div className={`weather-widget ${bgClass}`}>
      <div className="weather-main">
        {weather.icon && <img src={weather.icon} alt={weather.description} className="weather-icon" />}
        <div>
          <div className="weather-temp">{weather.temperature}°C</div>
          <div className="weather-desc">{weather.description}</div>
          <div className="weather-city">📍 {weather.city}</div>
        </div>
      </div>
      <div className="weather-details">
        <span>💧 {weather.humidity}%</span>
        <span>💨 {weather.windSpeed} km/h</span>
        <span>👁 {weather.visibility} km</span>
      </div>
      {weather.isMock && (
        <p className="weather-mock-note">Configure OPENWEATHER_API_KEY for live weather</p>
      )}
    </div>
  );
}
