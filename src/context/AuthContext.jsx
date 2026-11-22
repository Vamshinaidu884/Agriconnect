/* ============================================================
   AuthContext — Wired to real REST API via authService
   ============================================================ */
import { useReducer, useEffect, useCallback } from 'react';
import { AuthContext } from './authState';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

const TOKEN_KEY = 'agri_connect_token';
const USER_KEY = 'agri_connect_user';
const LEGACY_TOKEN_KEY = 'agrimatch_token';
const LEGACY_USER_KEY = 'agrimatch_user';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: !!action.payload.user,
        isLoading: false,
      };
    case 'LOGIN':
      return { ...state, user: action.payload.user, token: action.payload.token, isAuthenticated: true, isLoading: false };
    case 'LOGOUT':
      return { ...state, user: null, token: null, isAuthenticated: false, isLoading: false };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
    const sessionToken = sessionStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(LEGACY_TOKEN_KEY);
    const token = storedToken || sessionToken;
    const storage = storedToken ? localStorage : sessionStorage;
    const userStr = storage.getItem(USER_KEY) || storage.getItem(LEGACY_USER_KEY);
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (!storage.getItem(TOKEN_KEY)) storage.setItem(TOKEN_KEY, token);
        if (!storage.getItem(USER_KEY)) storage.setItem(USER_KEY, userStr);
        dispatch({ type: 'INIT', payload: { user, token } });
        // Refresh user data from API in background
        userService.getProfile().then((data) => {
          dispatch({ type: 'UPDATE_USER', payload: data.user });
          storage.setItem(USER_KEY, JSON.stringify({ ...user, ...data.user }));
        }).catch(() => {
          // Token may be expired — clear session
          storage.removeItem(TOKEN_KEY);
          storage.removeItem(USER_KEY);
          storage.removeItem(LEGACY_TOKEN_KEY);
          storage.removeItem(LEGACY_USER_KEY);
          dispatch({ type: 'INIT', payload: { user: null, token: null } });
        });
      } catch {
        dispatch({ type: 'INIT', payload: { user: null, token: null } });
      }
    } else {
      dispatch({ type: 'INIT', payload: { user: null, token: null } });
    }
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      [localStorage, sessionStorage].forEach((storage) => {
        storage.removeItem(TOKEN_KEY);
        storage.removeItem(USER_KEY);
        storage.removeItem(LEGACY_TOKEN_KEY);
        storage.removeItem(LEGACY_USER_KEY);
      });
      dispatch({ type: 'LOGOUT' });
    };

    window.addEventListener('agri-connect:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('agri-connect:unauthorized', handleUnauthorized);
  }, []);

  const login = useCallback(async (identifier, password, rememberMe = true) => {
    const data = await authService.login({ identifier, password });
    const storage = rememberMe ? localStorage : sessionStorage;
    const otherStorage = rememberMe ? sessionStorage : localStorage;
    storage.setItem(TOKEN_KEY, data.token);
    storage.setItem(USER_KEY, JSON.stringify(data.user));
    otherStorage.removeItem(TOKEN_KEY);
    otherStorage.removeItem(USER_KEY);
    otherStorage.removeItem(LEGACY_TOKEN_KEY);
    otherStorage.removeItem(LEGACY_USER_KEY);
    dispatch({ type: 'LOGIN', payload: { user: data.user, token: data.token } });
    return { success: true, user: data.user };
  }, []);

  const register = useCallback(async (userData) => {
    const data = await authService.register(userData);
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    dispatch({ type: 'LOGIN', payload: { user: data.user, token: data.token } });
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    [localStorage, sessionStorage].forEach((storage) => {
      storage.removeItem(TOKEN_KEY);
      storage.removeItem(USER_KEY);
      storage.removeItem(LEGACY_TOKEN_KEY);
      storage.removeItem(LEGACY_USER_KEY);
    });
    dispatch({ type: 'LOGOUT' });
  }, []);

  const updateUser = useCallback((updates) => {
    dispatch({ type: 'UPDATE_USER', payload: updates });
    const storage = localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage;
    const current = JSON.parse(storage.getItem(USER_KEY) || '{}');
    storage.setItem(USER_KEY, JSON.stringify({ ...current, ...updates }));
  }, []);

  const forgotPassword = useCallback((email) => authService.forgotPassword(email), []);
  const resetPassword = useCallback((data) => authService.resetPassword(data), []);

  return (
    <AuthContext.Provider value={{
      ...state,
      login, register, logout, updateUser, forgotPassword, resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
