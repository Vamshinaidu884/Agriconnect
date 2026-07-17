/* useWeather — Fetch weather for user's location */
import { useState, useEffect } from 'react';
import { marketService } from '../services/marketService';

export function useWeather(lat, lng) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!lat || !lng) return;
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await marketService.getWeather(lat, lng);
        setWeather(data.weather);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [lat, lng]);

  return { weather, loading, error };
}
