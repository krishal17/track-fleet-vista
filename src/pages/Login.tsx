
import { useEffect } from "react";
import AuthForm from "@/components/auth/AuthForm";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  
  // This would check Supabase auth status in a real application
  useEffect(() => {
    const checkAuthStatus = () => {
      const isAuthenticated = false; // This would be derived from Supabase
      if (isAuthenticated) {
        navigate("/dashboard");
      }
    };
    
    checkAuthStatus();
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-700">TelemkoTrack</h1>
          <p className="text-slate-500 mt-2">Fleet Management Dashboard</p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
};

export default Login;
