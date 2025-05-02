
import { useState, useEffect } from "react";
import AuthForm from "@/components/auth/AuthForm";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if user is logged in
  useEffect(() => {
    const checkAuthStatus = () => {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          navigate("/dashboard");
        }
      });
    };
    
    checkAuthStatus();
  }, [navigate]);

  // Login function using Supabase
  const handleLogin = async (email: string, password: string) => {
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Try to log in with Supabase
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // Show success message
      toast.success("Successfully logged in");
      
      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to login");
      toast.error(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-700">TelemkoTrack</h1>
          <p className="text-slate-500 mt-2">Fleet Management Dashboard</p>
        </div>
        <AuthForm 
          onSubmit={handleLogin} 
          isLoading={loading} 
          error={error} 
        />
      </div>
    </div>
  );
};

export default Login;
