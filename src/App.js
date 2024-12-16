import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Pratiklerim from "./components/PratikPage";
import Mulakatlarim from "./components/Mulakatlarim";
import PratikOlustur from "./components/PratikOlustur";
import ProfilAyarları from "./components/ProfilAyarlari";
import QuestionView from './components/QuestionView';
import EmotionAnalysisSystem from './components/EmotionAnalysisSystem';
import { Login, Register } from './components/Auth';
import PratikDetay from './components/PratikDetay';

// AuthCheck component to handle initial auth state
const AuthCheck = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('token');

  useEffect(() => {
    if (!isAuthenticated && !location.pathname.includes('/login') && !location.pathname.includes('/register')) {
      navigate('/login', { replace: true });
    }
    else if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/')) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, location, navigate]);

  return children;
};

// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Public Route wrapper component
const PublicRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Layout component for authenticated pages
const AuthenticatedLayout = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AuthCheck>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={<Navigate to="/login" replace />}
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Dashboard />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/pratiklerim"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Pratiklerim />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          {/* Yeni eklenen Pratik Detay route'u */}
          <Route
            path="/pratikler/:id"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <PratikDetay />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />


          <Route
            path="/mulakatlarim"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Mulakatlarim />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/pratik-olustur"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <PratikOlustur />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profil-ayarlari"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <ProfilAyarları />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          {/* Question Routes */}
          <Route
            path="/question-view/:questionNumber"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <QuestionView />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/question/:questionNumber"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <EmotionAnalysisSystem />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback route */}
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Navigate to="/dashboard" replace />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthCheck>
    </Router>
  );
};

export default App;