import { Toaster as SonnerToaster } from "sonner";
import { Toaster as HotToaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CertificateProvider } from "@/contexts/CertificateContext";

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
<<<<<<< HEAD
import LowerAuthorityDashboard from "./pages/LowerAuthorityDashboard";
import MidAuthorityDashboard from "./pages/MidAuthorityDashboard";
=======
>>>>>>> 7838adc785a33e341f72dc1ae2b937a4133b55c9
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
<<<<<<< HEAD
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
                <Dashboard />
              }
            />
            <Route
              path="/apply"
              element={
                <Apply />
              }
            />
            <Route
              path="/my-certificates"
              element={
                <MyCertificates />
              }
            />

            {/* Official Routes */}
            <Route
              path="/official-dashboard"
              element={
                <OfficialDashboard />
              }
            />
            <Route
              path="/official-dashboard/lower"
              element={
                <LowerAuthorityDashboard />
              }
            />
            <Route
              path="/official-dashboard/mid"
              element={
                <MidAuthorityDashboard />
              }
            />

            {/* Shared Routes */}
            <Route
              path="/profile"
              element={
                <Profile />
              }
            />

            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CertificateProvider>
=======
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
                <Dashboard />
                }
              />
              <Route
                path="/apply"
                element={
                    <Apply />
                }
              />
              <Route
                path="/my-certificates"
                element={
                    <MyCertificates />
                }
              />
              
              {/* Official Routes */}
              <Route
                path="/official-dashboard"
                element={
                    <OfficialDashboard />
                }
              />
              
              {/* Shared Routes */}
              <Route
                path="/profile"
                element={
                    <Profile />
                }
              />
              
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CertificateProvider>
>>>>>>> 7838adc785a33e341f72dc1ae2b937a4133b55c9
  </QueryClientProvider>
);

export default App;
