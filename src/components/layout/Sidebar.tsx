
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Car,
  Users,
  Route,
  Bell,
  FileText,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Car, label: "Vehicles", path: "/vehicles" },
  { icon: Users, label: "Drivers", path: "/drivers" },
  { icon: Route, label: "Trips", path: "/trips" },
  { icon: Bell, label: "Alerts", path: "/alerts" },
  { icon: FileText, label: "Reports", path: "/reports" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const isMobile = useIsMobile();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile toggle button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="rounded-full bg-white shadow-md"
        >
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </Button>
      </div>

      {/* Sidebar overlay for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full bg-white border-r border-slate-100 shadow-sm z-40 transition-all duration-300 ease-in-out",
          isOpen
            ? "translate-x-0 w-64"
            : "-translate-x-full lg:translate-x-0 lg:w-20",
          isMobile && !isOpen && "hidden"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 h-16 flex items-center justify-center border-b">
            <h1 
              className={cn(
                "text-primary-700 font-bold transition-all duration-300",
                isOpen ? "text-xl" : "text-xs lg:block hidden"
              )}
            >
              {isOpen ? "TelemkoTrack" : "TT"}
            </h1>
          </div>

          {/* Menu Items */}
          <div className="flex-1 py-6 overflow-y-auto">
            <nav className="px-2 space-y-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-2 py-3 rounded-md group transition-all",
                      isActive
                        ? "bg-primary-50 text-primary-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-primary-600"
                    )
                  }
                >
                  <item.icon
                    className={cn("flex-shrink-0 h-5 w-5 mr-3", 
                      !isOpen && "mx-auto mr-0"
                    )}
                  />
                  {isOpen && <span>{item.label}</span>}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Logout Button */}
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                !isOpen && "justify-center px-0"
              )}
            >
              <LogOut className="h-5 w-5 mr-2" />
              {isOpen && <span>Logout</span>}
            </Button>
          </div>

          {/* Collapse button (desktop only) */}
          <div className="hidden lg:block p-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSidebar}
              className={cn(
                "w-full text-xs",
                !isOpen && "p-0 h-8 w-8 mx-auto"
              )}
            >
              {isOpen ? (
                <span>Collapse</span>
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
