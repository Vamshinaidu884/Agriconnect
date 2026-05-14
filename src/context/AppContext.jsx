import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import storage, { STORAGE_KEYS } from '../utils/storage';
import mockRequestsData from '../data/mockRequests';
import mockUsersData from '../data/mockUsers';
import { processAcceptance } from '../utils/fcfs';
import { generateId } from '../utils/helpers';

const AppContext = createContext(null);

const initialState = {
  requests: [],
  allUsers: [],
  toast: null,
  isLoaded: false,
};

function appReducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return { ...state, requests: action.payload.requests, allUsers: action.payload.users, isLoaded: true };
    case 'ADD_REQUEST':
      return { ...state, requests: [action.payload, ...state.requests] };
    case 'UPDATE_REQUEST':
      return { ...state, requests: state.requests.map(r => r.id === action.payload.id ? action.payload : r) };
    case 'SHOW_TOAST':
      return { ...state, toast: action.payload };
    case 'HIDE_TOAST':
      return { ...state, toast: null };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    let requests = storage.get(STORAGE_KEYS.REQUESTS);
    let users = storage.get(STORAGE_KEYS.USERS);
    if (!requests || requests.length === 0) {
      requests = mockRequestsData;
      storage.set(STORAGE_KEYS.REQUESTS, requests);
    }
    if (!users || users.length === 0) {
      users = mockUsersData;
      storage.set(STORAGE_KEYS.USERS, users);
    }
    dispatch({ type: 'INIT', payload: { requests, users } });
  }, []);

  useEffect(() => {
    if (state.isLoaded) {
      storage.set(STORAGE_KEYS.REQUESTS, state.requests);
    }
  }, [state.requests, state.isLoaded]);

  const showToast = useCallback((message, type = 'success') => {
    dispatch({ type: 'SHOW_TOAST', payload: { message, type, id: Date.now() } });
    setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 3000);
  }, []);

  const createRequest = useCallback((requestData) => {
    const newRequest = {
      ...requestData,
      id: generateId('req'),
      status: 'pending',
      createdAt: new Date().toISOString(),
      acceptedUsers: [],
      rejectedUsers: [],
      workersAccepted: 0,
    };
    dispatch({ type: 'ADD_REQUEST', payload: newRequest });
    showToast('Request posted successfully!');
    return newRequest;
  }, [showToast]);

  const acceptRequest = useCallback((requestId, userId) => {
    const request = state.requests.find(r => r.id === requestId);
    if (!request) return { success: false, message: 'Request not found' };
    const result = processAcceptance(request, userId);
    if (result.success) {
      dispatch({ type: 'UPDATE_REQUEST', payload: result.request });
      showToast(result.message);
    } else {
      showToast(result.message, 'error');
    }
    return result;
  }, [state.requests, showToast]);

  const completeRequest = useCallback((requestId) => {
    const request = state.requests.find(r => r.id === requestId);
    if (request) {
      dispatch({ type: 'UPDATE_REQUEST', payload: { ...request, status: 'completed' } });
      showToast('Request marked as completed!');
    }
  }, [state.requests, showToast]);

  const rateUser = useCallback((requestId, targetUserId, score, comment) => {
    const request = state.requests.find(r => r.id === requestId);
    if (request) {
      const ratings = { ...(request.ratings || {}), [targetUserId]: { score, comment } };
      dispatch({ type: 'UPDATE_REQUEST', payload: { ...request, ratings } });
      showToast('Rating submitted!');
    }
  }, [state.requests, showToast]);

  const getUserById = useCallback((userId) => {
    return state.allUsers.find(u => u.id === userId);
  }, [state.allUsers]);

  return (
    <AppContext.Provider value={{
      ...state, createRequest, acceptRequest, completeRequest, rateUser, getUserById, showToast
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export default AppContext;
