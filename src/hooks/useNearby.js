/* useNearby — Get user GPS location and fetch nearby requests */
import { useState, useEffect, useCallback } from 'react';
import { requestService } from '../services/requestService';

export function useNearby(radius = 20) {
  const [location, setLocation] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [error, setError] = useState(null);

  // Get GPS location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {
        setLocationError('Location access denied. Using default location.');
        // Default: Hyderabad
        setLocation({ lat: 17.385, lng: 78.4867 });
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  const fetchNearby = useCallback(async () => {
    if (!location) return;
    try {
      setLoading(true);
      setError(null);
      const data = await requestService.getAll({
        lat: location.lat,
        lng: location.lng,
        radius,
        status: 'pending',
      });
      setRequests(data.requests || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [location, radius]);

  useEffect(() => {
    fetchNearby();
  }, [fetchNearby]);

  return { location, requests, loading, locationError, error, refetch: fetchNearby };
}
