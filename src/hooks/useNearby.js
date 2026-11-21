/* useNearby — Get user GPS location and fetch nearby requests */
import { useState, useEffect, useCallback } from 'react';
import { requestService } from '../services/requestService';
import { useAuth } from '../context/useAuth';
import { getCurrentLocation, getStateCenter, isValidLocation } from '../utils/location';

export function useNearby(radius = 20) {
  const { user } = useAuth();
  const [location, setLocation] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [error, setError] = useState(null);

  // Get GPS location
  useEffect(() => {
    const savedLocation = isValidLocation(user?.location) ? user.location : null;
    const fallbackLocation = savedLocation || getStateCenter(user?.state);
    const setFallbackLocation = (message) => {
      setLocationError(message);
      if (fallbackLocation) {
        setLocation(fallbackLocation);
      } else {
        setError('We could not determine your location. Update your profile location or allow location access.');
        setLoading(false);
      }
    };

    if (savedLocation) {
      let isActive = true;
      Promise.resolve().then(() => {
        if (isActive) {
          setLocation(savedLocation);
          setLocationError(null);
        }
      });
      return () => {
        isActive = false;
      };
    }

    if (!navigator.geolocation) {
      setFallbackLocation('Geolocation is not supported. Using your profile or state location.');
      return;
    }

    let isActive = true;
    getCurrentLocation().then((currentLocation) => {
      if (isActive) {
        setLocation(currentLocation);
        setLocationError(null);
      }
    }).catch(() => {
      if (isActive) {
        setFallbackLocation('Location access denied. Using your profile or state location.');
      }
    });

    return () => {
      isActive = false;
    };
  }, [user?.location, user?.state]);

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
    if (!location) return undefined;

    let isActive = true;
    const loadNearby = async () => {
      try {
        const data = await requestService.getAll({
          lat: location.lat,
          lng: location.lng,
          radius,
          status: 'pending',
        });
        if (isActive) {
          setRequests(data.requests || []);
          setError(null);
        }
      } catch (err) {
        if (isActive) setError(err.message);
      } finally {
        if (isActive) setLoading(false);
      }
    };

    loadNearby();
    return () => {
      isActive = false;
    };
  }, [location, radius]);

  return { location, requests, loading, locationError, error, refetch: fetchNearby };
}
