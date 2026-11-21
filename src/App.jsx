import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import { AppProvider } from './context/AppContext';
import Toast from './components/Toast';
import Login from './pages/Login';
import Register from './pages/Register';
import RoleSelection from './pages/RoleSelection';
import Home from './pages/Home';
import CreateRequest from './pages/CreateRequest';
import NearbyRequests from './pages/NearbyRequests';
import RequestDetail from './pages/RequestDetail';
import MyRequests from './pages/MyRequests';
import Profile from './pages/Profile';
import DiseaseDetection from './pages/DiseaseDetection';
import CropRecommendation from './pages/CropRecommendation';
import MarketInsights from './pages/MarketInsights';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Machines from './pages/Machines';
import AddMachine from './pages/AddMachine';
import Landing from './pages/Landing';
import MachineryMarketplace from './pages/MachineryMarketplace';
import Recommendations from './pages/Recommendations';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeProvider';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/home" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

      {/* Protected */}
      <Route path="/role-selection" element={<ProtectedRoute><RoleSelection /></ProtectedRoute>} />
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/create-request" element={<ProtectedRoute><CreateRequest /></ProtectedRoute>} />
      <Route path="/nearby" element={<ProtectedRoute><NearbyRequests /></ProtectedRoute>} />
      <Route path="/request/:id" element={<ProtectedRoute><RequestDetail /></ProtectedRoute>} />
      <Route path="/my-requests" element={<ProtectedRoute><MyRequests /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/disease-detection" element={<ProtectedRoute><DiseaseDetection /></ProtectedRoute>} />
      <Route path="/crop-recommendation" element={<ProtectedRoute><CropRecommendation /></ProtectedRoute>} />
      <Route path="/market-insights" element={<ProtectedRoute><MarketInsights /></ProtectedRoute>} />
      <Route path="/machines" element={<ProtectedRoute><Machines /></ProtectedRoute>} />
      <Route path="/add-machine" element={<ProtectedRoute><AddMachine /></ProtectedRoute>} />
      <Route path="/marketplace/machinery" element={<ProtectedRoute><MachineryMarketplace /></ProtectedRoute>} />
      <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <AppProvider>
              <div className="app-container">
                <AppRoutes />
                <Toast />
              </div>
            </AppProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
