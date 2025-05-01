
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Car, Users, Fuel, AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Mock data to simulate fetching from Supabase
const mockStats = {
  totalVehicles: 32,
  activeVehicles: 24,
  activeDrivers: 18,
  fuelUsageToday: 267, // liters
};

const mockAlerts = [
  { id: 1, vehicle: "Truck 105", type: "Maintenance", severity: "high", timestamp: "2023-05-01T08:23:00" },
  { id: 2, vehicle: "Van 087", type: "Low Fuel", severity: "medium", timestamp: "2023-05-01T09:15:00" },
  { id: 3, vehicle: "Car 042", type: "Speeding", severity: "high", timestamp: "2023-05-01T10:05:00" },
  { id: 4, vehicle: "Truck 118", type: "Engine Warning", severity: "medium", timestamp: "2023-05-01T11:47:00" },
];

const Dashboard = () => {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [stats, setStats] = useState(mockStats);
  const [alerts, setAlerts] = useState(mockAlerts);

  useEffect(() => {
    // This would fetch data from Supabase in a real app
    const timer = setTimeout(() => {
      setIsMapLoaded(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your fleet management overview
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="stat-card-title">Total Vehicles</CardTitle>
            <Car className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="stat-card-value">{stats.totalVehicles}</div>
          </CardContent>
        </Card>
        
        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="stat-card-title">Active Vehicles</CardTitle>
            <Car className="h-4 w-4 text-primary-400" />
          </CardHeader>
          <CardContent>
            <div className="stat-card-value">{stats.activeVehicles}</div>
          </CardContent>
        </Card>
        
        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="stat-card-title">Active Drivers</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="stat-card-value">{stats.activeDrivers}</div>
          </CardContent>
        </Card>
        
        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="stat-card-title">Fuel Usage Today</CardTitle>
            <Fuel className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="stat-card-value">{stats.fuelUsageToday} L</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <Card className="dashboard-map lg:col-span-2 h-80">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Live Fleet Map</CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-[calc(100%-60px)]">
            <div className="w-full h-full bg-slate-100 flex items-center justify-center relative overflow-hidden">
              {!isMapLoaded ? (
                <div className="text-slate-500">Loading map...</div>
              ) : (
                <div className="w-full h-full p-4">
                  <div className="w-full h-full bg-slate-200 rounded-md flex items-center justify-center">
                    <span className="text-slate-600 text-sm">
                      Map visualization will be displayed here
                      <br />
                      (Leaflet or similar map implementation)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Alerts Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                Recent Alerts
              </div>
            </CardTitle>
            <Button variant="ghost" className="h-8 px-2 text-xs">View all</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 rounded-md border"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{alert.vehicle}</span>
                    <span className="text-xs text-slate-500">{formatTimestamp(alert.timestamp)}</span>
                  </div>
                  <div
                    className={`text-xs px-2 py-1 rounded-full border ${getSeverityColor(
                      alert.severity
                    )}`}
                  >
                    {alert.type}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Trip Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="7days">
              <TabsList className="mb-4">
                <TabsTrigger value="7days">Last 7 Days</TabsTrigger>
                <TabsTrigger value="30days">Last 30 Days</TabsTrigger>
                <TabsTrigger value="90days">Last 90 Days</TabsTrigger>
              </TabsList>
              
              <TabsContent value="7days" className="flex items-center justify-center h-64">
                <div className="text-center text-slate-500">
                  <p>Trip activity visualization will be displayed here</p>
                  <p className="text-sm">(Timeline or chart implementation)</p>
                </div>
              </TabsContent>
              
              <TabsContent value="30days" className="flex items-center justify-center h-64">
                <div className="text-center text-slate-500">
                  <p>30-day trip activity data</p>
                </div>
              </TabsContent>
              
              <TabsContent value="90days" className="flex items-center justify-center h-64">
                <div className="text-center text-slate-500">
                  <p>90-day trip activity data</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
