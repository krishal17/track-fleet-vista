
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import VehiclesPage from "./pages/VehiclesPage";
import AlertsPage from "./pages/AlertsPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFoundPage from "./pages/NotFoundPage";
import DashboardLayout from "./components/layout/DashboardLayout";

const queryClient = new QueryClient();

// Create auth context
type AuthContextType = {
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  signOut: async () => {}
});

export const useAuth = () => useContext(AuthContext);

// Auth provider component
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    session,
    loading,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected route wrapper
const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const location = useLocation();
  const { session, loading } = useAuth();
  
  if (loading) {
    return <div className="flex h-screen w-screen items-center justify-center">
      <p>Loading...</p>
    </div>;
  }
  
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
            <Route
              path="/"
              element={
                <RequireAuth>
                  <DashboardLayout />
                </RequireAuth>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="vehicles" element={<VehiclesPage />} />
              <Route path="alerts" element={<AlertsPage />} />
              <Route path="drivers" element={<PlaceholderPage />} />
              <Route path="trips" element={<PlaceholderPage />} />
              <Route path="reports" element={<PlaceholderPage />} />
              <Route path="settings" element={<PlaceholderPage />} />
            </Route>
            
            {/* 404 route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
