
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Car, Users, Fuel, AlertTriangle, Map, Navigation, Speedometer } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
// This is needed because Leaflet's default markers reference image files that aren't properly loaded in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
});

// Create custom vehicle icons
const createVehicleIcon = (type: 'car' | 'truck' | 'van') => {
  let color = '#3b82f6'; // blue for cars
  if (type === 'truck') color = '#ef4444'; // red for trucks
  if (type === 'van') color = '#10b981'; // green for vans

  return L.divIcon({
    className: 'vehicle-marker',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

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

// Mock vehicle location data
const mockVehicles = [
  { 
    id: 1, 
    type: 'car', 
    name: 'Car 042', 
    position: [51.505, -0.09], 
    speed: 65,
    heading: 'North',
    destination: 'London Central',
    estimatedArrival: '14:30',
    driver: 'John Doe'
  },
  { 
    id: 2, 
    type: 'truck', 
    name: 'Truck 105', 
    position: [51.51, -0.1], 
    speed: 45,
    heading: 'East',
    destination: 'Manchester Distribution Center',
    estimatedArrival: '16:15',
    driver: 'Sarah Connor'
  },
  { 
    id: 3, 
    type: 'van', 
    name: 'Van 087', 
    position: [51.515, -0.09], 
    speed: 55,
    heading: 'South',
    destination: 'Birmingham Office',
    estimatedArrival: '15:45',
    driver: 'Robert Chen'
  },
  { 
    id: 4, 
    type: 'truck', 
    name: 'Truck 118', 
    position: [51.52, -0.08], 
    speed: 30,
    heading: 'West',
    destination: 'Cardiff Warehouse',
    estimatedArrival: '17:20',
    driver: 'Maria Garcia'
  }
];

const Dashboard = () => {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [stats, setStats] = useState(mockStats);
  const [alerts, setAlerts] = useState(mockAlerts);
  const [selectedVehicle, setSelectedVehicle] = useState<null | typeof mockVehicles[0]>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.505, -0.09]); // London coordinates

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

  const handleVehicleClick = (vehicle: typeof mockVehicles[0]) => {
    setSelectedVehicle(vehicle);
    setMapCenter(vehicle.position);
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
            <Tabs defaultValue="map">
              <TabsList className="mb-4">
                <TabsTrigger value="map">Map View</TabsTrigger>
                <TabsTrigger value="7days">Last 7 Days</TabsTrigger>
                <TabsTrigger value="30days">Last 30 Days</TabsTrigger>
                <TabsTrigger value="90days">Last 90 Days</TabsTrigger>
              </TabsList>
              
              <TabsContent value="map" className="h-96">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
                  <div className="lg:col-span-2 h-full relative">
                    <div className="absolute top-2 right-2 z-10 bg-white bg-opacity-80 rounded px-2 py-1 text-xs font-medium">
                      {selectedVehicle ? `Tracking: ${selectedVehicle.name}` : 'Click on a vehicle to track'}
                    </div>
                    <MapContainer 
                      center={mapCenter} 
                      zoom={13} 
                      style={{ height: '100%', width: '100%', borderRadius: '0.375rem' }}
                      zoomControl={false}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {mockVehicles.map(vehicle => (
                        <Marker 
                          key={vehicle.id} 
                          position={vehicle.position} 
                          icon={createVehicleIcon(vehicle.type as 'car' | 'truck' | 'van')}
                          eventHandlers={{
                            click: () => handleVehicleClick(vehicle)
                          }}
                        >
                          <Popup>
                            <div className="text-sm">
                              <p className="font-bold">{vehicle.name}</p>
                              <p>Driver: {vehicle.driver}</p>
                              <p>Speed: {vehicle.speed} km/h</p>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  </div>
                  <div className="h-full">
                    {selectedVehicle ? (
                      <div className="h-full flex flex-col border rounded-md p-4 overflow-auto">
                        <div className="mb-4 flex items-center">
                          <Car className="h-5 w-5 mr-2 text-slate-600" />
                          <h3 className="font-medium">{selectedVehicle.name}</h3>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center">
                            <Speedometer className="h-4 w-4 mr-2 text-slate-500" />
                            <div>
                              <p className="text-xs text-slate-500">Current Speed</p>
                              <p className="text-lg font-semibold">{selectedVehicle.speed} km/h</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <Navigation className="h-4 w-4 mr-2 text-slate-500" />
                            <div>
                              <p className="text-xs text-slate-500">Heading</p>
                              <p className="font-medium">{selectedVehicle.heading}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-xs text-slate-500">Destination</p>
                            <div className="flex items-center">
                              <Map className="h-4 w-4 mr-2 text-slate-500" />
                              <p className="font-medium">{selectedVehicle.destination}</p>
                            </div>
                            <p className="text-sm text-slate-600">ETA: {selectedVehicle.estimatedArrival}</p>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-xs text-slate-500">Driver</p>
                            <p className="font-medium">{selectedVehicle.driver}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full border rounded-md flex items-center justify-center">
                        <div className="text-center text-slate-500 px-4">
                          <Car className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>Select a vehicle on the map to view details</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
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
