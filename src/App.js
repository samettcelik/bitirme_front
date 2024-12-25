import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate
} from "react-router-dom";

// Component imports
import Sidebar from "./components/Sidebar";
import CompanySidebar from "./components/CompanySideBar";
import Dashboard from "./components/Dashboard";
import CompanyDashboard from "./components/CompanyDashboard";
import CompanyProfile from "./components/CompanyProfile";
import CompanyEmployees from "./components/CompanyEmployees";
import Pratiklerim from "./components/PratikPage";
import Mulakatlarim from "./components/Mulakatlarim";
import PratikOlustur from "./components/PratikOlustur";
import ProfilAyarları from "./components/ProfilAyarlari";
import QuestionView from './components/QuestionView';
import EmotionAnalysisSystem from './components/EmotionAnalysisSystem';
import PratikDetay from './components/PratikDetay';
import InterviewCreator from './components/InterviewCreator';
import InterviewAnalysisSystem from './components/InterviewAnalysisSystem';
import CompanyInterviews from './components/CompanyInterviews';
import InterviewDetail from './components/InterviewDetail';
import CompanyInterviewsDetails from './components/CompanyDetails';

// Auth imports
import { Login, Register } from './components/Auth';
import { LoginSelection, CompanyLogin, CompanyRegister } from './components/LoginSelection';

// AuthCheck component for handling auth state and redirects
const AuthCheck = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isUserAuthenticated = localStorage.getItem('token');
  const isCompanyAuthenticated = localStorage.getItem('companyToken');

  useEffect(() => {
    const publicPaths = [
      '/login-selection',
      '/user-login',
      '/company-login',
      '/register',
      '/company-register',
      '/interview'
    ];
    const isPublicPath = publicPaths.some(path => location.pathname.startsWith(path));

    // For authenticated users trying to access public paths
    if (isPublicPath && (isUserAuthenticated || isCompanyAuthenticated)) {
      if (!location.pathname.startsWith('/interview')) {
        navigate(isUserAuthenticated ? '/dashboard' : '/company-dashboard', { replace: true });
        return;
      }
    }

    // For unauthenticated users trying to access protected paths
    if (!isPublicPath && !location.pathname.startsWith('/interview/') &&
      !isUserAuthenticated && !isCompanyAuthenticated) {
      navigate('/login-selection', { replace: true });
      return;
    }
  }, [isUserAuthenticated, isCompanyAuthenticated, location, navigate]);

  return children;
};

// Protected Route component
const ProtectedRoute = ({ children, requiresCompanyAuth = false }) => {
  const isUserAuthenticated = localStorage.getItem('token');
  const isCompanyAuthenticated = localStorage.getItem('companyToken');

  if (requiresCompanyAuth && !isCompanyAuthenticated) {
    return <Navigate to="/company-login" replace />;
  }

  if (!requiresCompanyAuth && !isUserAuthenticated) {
    return <Navigate to="/user-login" replace />;
  }

  return children;
};

// Interview Layout
const InterviewLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
};

// Public Route component
const PublicRoute = ({ children }) => {
  const isUserAuthenticated = localStorage.getItem('token');
  const isCompanyAuthenticated = localStorage.getItem('companyToken');
  const location = useLocation();

  if (isUserAuthenticated || isCompanyAuthenticated) {
    if (location.pathname.startsWith('/interview/')) {
      return children;
    }
    return <Navigate to={isUserAuthenticated ? '/dashboard' : '/company-dashboard'} replace />;
  }

  return children;
};

// Layout components
const AuthenticatedLayout = ({ children }) => (
  <div className="flex">
    <Sidebar />
    <div className="flex-1">{children}</div>
  </div>
);

const CompanyLayout = ({ children }) => (
  <div className="flex">
    <CompanySidebar />
    <div className="flex-1">{children}</div>
  </div>
);

// Main App component
const App = () => {
  return (
    <Router>
      <AuthCheck>
        <Routes>
          {/* Initial and Auth Routes */}
          <Route path="/" element={<Navigate to="/login-selection" replace />} />
          <Route path="/login-selection" element={<PublicRoute><LoginSelection /></PublicRoute>} />
          <Route path="/user-login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/company-login" element={<PublicRoute><CompanyLogin /></PublicRoute>} />
          <Route path="/company-register" element={<PublicRoute><CompanyRegister /></PublicRoute>} />

          {/* Public Interview Route */}
          <Route
            path="/interview/:uniqueUrl"
            element={
              <InterviewLayout>
                <InterviewAnalysisSystem />
              </InterviewLayout>
            }
          />

          {/* User Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Dashboard />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />

          <Route path="/pratiklerim" element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Pratiklerim />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />

          <Route path="/pratikler/:id" element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <PratikDetay />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />

          <Route path="/mulakatlarim" element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Mulakatlarim />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />

          <Route path="/pratik-olustur" element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <PratikOlustur />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />

          <Route path="/profil-ayarlari" element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <ProfilAyarları />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />

          <Route path="/question-view/:questionNumber" element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <QuestionView />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />

          <Route path="/question/:questionNumber" element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <EmotionAnalysisSystem />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />

          {/* Company Protected Routes */}
          <Route path="/company-dashboard" element={
            <ProtectedRoute requiresCompanyAuth>
              <CompanyLayout>
                <CompanyDashboard />
              </CompanyLayout>
            </ProtectedRoute>
          } />

          <Route path="/company-profile" element={
            <ProtectedRoute requiresCompanyAuth>
              <CompanyLayout>
                <CompanyProfile />
              </CompanyLayout>
            </ProtectedRoute>
          } />

          <Route path="/company-employees" element={
            <ProtectedRoute requiresCompanyAuth>
              <CompanyLayout>
                <CompanyEmployees />
              </CompanyLayout>
            </ProtectedRoute>
          } />

          <Route path="/company-employees/interview-detail/:interviewId/:participantEmail" element={
            <ProtectedRoute requiresCompanyAuth>
              <CompanyLayout>
                <InterviewDetail />
              </CompanyLayout>
            </ProtectedRoute>
          } />



          <Route path="/company-interviews" element={
            <ProtectedRoute requiresCompanyAuth>
              <CompanyLayout>
                <CompanyInterviews />
              </CompanyLayout>
            </ProtectedRoute>
          } />

          <Route path="/company-interviews/:id" element={
            <ProtectedRoute requiresCompanyAuth>
              <CompanyLayout>
                <CompanyInterviewsDetails />
              </CompanyLayout>
            </ProtectedRoute>
          } />

          <Route path="/mulakat-olustur" element={
            <ProtectedRoute requiresCompanyAuth>
              <CompanyLayout>
                <InterviewCreator />
              </CompanyLayout>
            </ProtectedRoute>
          } />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/login-selection" replace />} />
        </Routes>
      </AuthCheck>
    </Router>
  );
};

export default App;