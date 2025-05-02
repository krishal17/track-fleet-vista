
import { useState, useEffect } from "react";
import AuthForm from "@/components/auth/AuthForm";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  
  // Check if user is logged in
  useEffect(() => {
    const checkAuthStatus = () => {
      const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
      if (isAuthenticated) {
        navigate("/dashboard");
      }
    };
    
    checkAuthStatus();
  }, [navigate]);

  // Mock login function
  const handleLogin = (email: string, password: string) => {
    // In a real app, this would validate against Supabase
    if (email && password) {
      // Set auth state in localStorage (temporary solution)
      localStorage.setItem("isAuthenticated", "true");
      
      // Show success message
      toast.success("Successfully logged in");
      
      // Redirect to dashboard
      navigate("/dashboard");
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-700">TelemkoTrack</h1>
          <p className="text-slate-500 mt-2">Fleet Management Dashboard</p>
        </div>
        <AuthForm onSubmit={handleLogin} />
      </div>
    </div>
  );
};

export default Login;
