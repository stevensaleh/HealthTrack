// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import StyleGuide from "./pages/StyleGuide";
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
//import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
// import DataEntry from "./pages/DataEntry";
// import Goals from "./pages/Goals";
// import Analytics from "./pages/Analytics";
// import Integrations from "./pages/Integrations";
// import Profile from "./pages/Profile";

// Get Google Client ID from environment
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/style-guide" element={<StyleGuide />} />
              

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                 
                    <Dashboard />
                  
                }
              />
              {/* TO BE IMPLEMENTED LATER
              <Route
                path="/data-entry"
                element={
                  <ProtectedRoute>
                    <DataEntry />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/goals"
                element={
                  <ProtectedRoute>
                    <Goals />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/integrations"
                element={
                  <ProtectedRoute>
                    <Integrations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              /> */}

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}