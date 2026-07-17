/* useRequests — Fetch and manage requests from API */
import { useState, useEffect, useCallback } from 'react';
import { requestService } from '../services/requestService';

export function useRequests(params = {}) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await requestService.getAll(params);
      setRequests(data.requests || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return { requests, loading, error, refetch: fetchRequests };
}

export function useMyRequests() {
  const [posted, setPosted] = useState([]);
  const [accepted, setAccepted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMyRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await requestService.getMy();
      setPosted(data.posted || []);
      setAccepted(data.accepted || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyRequests();
  }, [fetchMyRequests]);

  return { posted, accepted, loading, error, refetch: fetchMyRequests };
}
