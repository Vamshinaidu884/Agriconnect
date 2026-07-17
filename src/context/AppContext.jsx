/* ============================================================
   AppContext — Wired to real REST API via requestService
   ============================================================ */
import { createContext, useContext, useReducer, useCallback } from 'react';
import { requestService } from '../services/requestService';

const AppContext = createContext(null);

const initialState = {
  toast: null,
};

function appReducer(state, action) {
  switch (action.type) {
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

  const showToast = useCallback((message, type = 'success') => {
    dispatch({ type: 'SHOW_TOAST', payload: { message, type, id: Date.now() } });
    setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 3500);
  }, []);

  // All request operations now delegate to the API
  const createRequest = useCallback(async (requestData) => {
    const data = await requestService.create(requestData);
    showToast('Request posted successfully!');
    return data.request;
  }, [showToast]);

  const acceptRequest = useCallback(async (requestId) => {
    const data = await requestService.accept(requestId);
    showToast('Request accepted successfully!');
    return data.request;
  }, [showToast]);

  const withdrawRequest = useCallback(async (requestId) => {
    const data = await requestService.withdraw(requestId);
    showToast('Withdrawn from request');
    return data.request;
  }, [showToast]);

  const completeRequest = useCallback(async (requestId) => {
    const data = await requestService.complete(requestId);
    showToast('Request marked as completed!');
    return data.request;
  }, [showToast]);

  const deleteRequest = useCallback(async (requestId) => {
    await requestService.delete(requestId);
    showToast('Request deleted');
  }, [showToast]);

  return (
    <AppContext.Provider value={{
      ...state,
      showToast,
      createRequest,
      acceptRequest,
      withdrawRequest,
      completeRequest,
      deleteRequest,
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
