
import { useLocation } from "react-router-dom";

const PlaceholderPage = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const pageName = pathSegments[pathSegments.length - 1];
  
  const capitalizedPageName = pageName.charAt(0).toUpperCase() + pageName.slice(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{capitalizedPageName}</h1>
        <p className="text-muted-foreground">
          This is a placeholder for the {capitalizedPageName} page
        </p>
      </div>
      
      <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-100 text-center">
        <h2 className="text-xl font-medium text-slate-700 mb-2">
          Coming Soon
        </h2>
        <p className="text-slate-500">
          This feature is currently under development. Check back later!
        </p>
      </div>
    </div>
  );
};

export default PlaceholderPage;
