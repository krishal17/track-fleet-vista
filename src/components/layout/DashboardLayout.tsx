
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/App";
import { toast } from "sonner";

const DashboardLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Successfully logged out");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar for desktop */}
      {!isMobile && <Sidebar />}

      {/* Content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top nav */}
        <header className="h-16 flex items-center justify-between border-b bg-white px-4 md:px-6">
          <div className="flex items-center">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="mr-2"
                onClick={() => setMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-lg font-medium">TelemkoTrack</h1>
          </div>
          
          <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile sidebar */}
      {isMobile && (
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetContent side="left" className="p-0 w-[250px]">
            <Sidebar />
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};

export default DashboardLayout;
