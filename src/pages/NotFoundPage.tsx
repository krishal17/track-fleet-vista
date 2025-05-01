
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-primary-600">404</h1>
        <h2 className="text-2xl font-medium text-slate-800">Page Not Found</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Button onClick={() => navigate("/dashboard")}>
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
