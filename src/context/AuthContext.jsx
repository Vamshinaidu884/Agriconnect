/* ============================================================
   AuthContext — Wired to real REST API via authService
   ============================================================ */
import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

const AuthContext = createContext(null);

const TOKEN_KEY = 'agrimatch_token';
const USER_KEY = 'agrimatch_user';

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
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        dispatch({ type: 'INIT', payload: { user, token } });
        // Refresh user data from API in background
        userService.getProfile().then((data) => {
          dispatch({ type: 'UPDATE_USER', payload: data.user });
          localStorage.setItem(USER_KEY, JSON.stringify({ ...user, ...data.user }));
        }).catch(() => {
          // Token may be expired — clear session
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          dispatch({ type: 'INIT', payload: { user: null, token: null } });
        });
      } catch {
        dispatch({ type: 'INIT', payload: { user: null, token: null } });
      }
    } else {
      dispatch({ type: 'INIT', payload: { user: null, token: null } });
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authService.login({ email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    dispatch({ type: 'LOGIN', payload: { user: data.user, token: data.token } });
    return { success: true };
  }, []);

  const register = useCallback(async (userData) => {
    const data = await authService.register(userData);
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    dispatch({ type: 'LOGIN', payload: { user: data.user, token: data.token } });
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    dispatch({ type: 'LOGOUT' });
  }, []);

  const updateUser = useCallback((updates) => {
    dispatch({ type: 'UPDATE_USER', payload: updates });
    const current = JSON.parse(localStorage.getItem(USER_KEY) || '{}');
    localStorage.setItem(USER_KEY, JSON.stringify({ ...current, ...updates }));
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

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
