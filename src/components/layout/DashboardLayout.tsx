
import { Outlet, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import Sidebar from "./Sidebar";

const DashboardLayout = () => {
  const navigate = useNavigate();

  // In a real app, check auth status and redirect if needed
  // const isAuthenticated = checkAuthStatus();
  // 
  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     navigate('/login');
  //   }
  // }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      
      <main className={cn(
        "lg:ml-64 min-h-screen transition-all duration-300 ease-in-out",
        "pt-16 lg:pt-0" // Account for mobile nav padding
      )}>
        <div className="container mx-auto p-4 lg:p-6 max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
