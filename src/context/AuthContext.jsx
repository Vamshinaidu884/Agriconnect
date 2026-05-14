import { createContext, useContext, useReducer, useEffect } from 'react';
import storage, { STORAGE_KEYS } from '../utils/storage';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return { ...state, user: action.payload, isAuthenticated: !!action.payload, isLoading: false };
    case 'LOGIN':
      return { ...state, user: action.payload, isAuthenticated: true, isLoading: false };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false, isLoading: false };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const saved = storage.get(STORAGE_KEYS.USER);
    dispatch({ type: 'INIT', payload: saved });
  }, []);

  useEffect(() => {
    if (state.user) {
      storage.set(STORAGE_KEYS.USER, state.user);
    }
  }, [state.user]);

  const login = (email, password) => {
    const users = storage.get(STORAGE_KEYS.USERS) || [];
    const found = users.find(u => u.email === email && u.password === password);
    if (found) {
      const { password: _, ...userWithoutPw } = found;
      dispatch({ type: 'LOGIN', payload: userWithoutPw });
      return { success: true };
    }
    return { success: false, message: 'Invalid email or password' };
  };

  const loginWithGoogle = () => {
    const mockGoogleUser = {
      id: 'google_' + Date.now(),
      name: 'Google User',
      email: 'user@gmail.com',
      phone: '',
      roles: [],
      state: '',
      district: '',
      rating: 0,
      totalRatings: 0,
      completedJobs: 0,
      range: 20,
      location: { lat: 16.3067, lng: 80.4365 },
      avatar: '👤',
      joinedDate: new Date().toISOString().split('T')[0],
      isNewUser: true,
    };
    dispatch({ type: 'LOGIN', payload: mockGoogleUser });
    return { success: true, isNewUser: true };
  };

  const register = (userData) => {
    const users = storage.get(STORAGE_KEYS.USERS) || [];
    if (users.find(u => u.email === userData.email)) {
      return { success: false, message: 'Email already registered' };
    }
    const newUser = {
      id: 'user_' + Date.now(),
      ...userData,
      rating: 0,
      totalRatings: 0,
      completedJobs: 0,
      range: 20,
      avatar: '👤',
      joinedDate: new Date().toISOString().split('T')[0],
    };
    const { password: _, ...userWithoutPw } = newUser;
    users.push(newUser);
    storage.set(STORAGE_KEYS.USERS, users);
    dispatch({ type: 'LOGIN', payload: userWithoutPw });
    return { success: true };
  };

  const logout = () => {
    storage.remove(STORAGE_KEYS.USER);
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (updates) => {
    dispatch({ type: 'UPDATE_USER', payload: updates });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, loginWithGoogle, register, logout, updateUser }}>
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
