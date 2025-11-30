import { Toaster as SonnerToaster } from "sonner";
import { Toaster as HotToaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CertificateProvider } from "@/contexts/CertificateContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import UserLoginForm from "./components/auth/UserLoginForm";
import OfficerLoginForm from "./components/auth/OfficerLoginForm";
// LoginSelector removed per request; route `/login` now points to user login form directly
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Apply from "./pages/Apply";
import MyCertificates from "./pages/MyCertificates";
import Profile from "./pages/Profile";
import OfficialDashboard from "./pages/OfficialDashboard";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CertificateProvider>
        <TooltipProvider>
          <HotToaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                border: '1px solid hsl(var(--border))',
              },
            }}
          />
          <SonnerToaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<UserLoginForm />} />
              <Route path="/login/user" element={<UserLoginForm />} />
              <Route path="/login/officer" element={<OfficerLoginForm />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Citizen Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['citizen']}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/apply"
                element={
                  <ProtectedRoute allowedRoles={['citizen']}>
                    <Apply />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-certificates"
                element={
                  <ProtectedRoute allowedRoles={['citizen']}>
                    <MyCertificates />
                  </ProtectedRoute>
                }
              />
              
              {/* Official Routes */}
              <Route
                path="/official-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['officer', 'senior', 'higher']}>
                    <OfficialDashboard />
                  </ProtectedRoute>
                }
              />
              
              {/* Shared Routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CertificateProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
