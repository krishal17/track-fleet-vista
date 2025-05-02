
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Car, Users, Fuel, AlertTriangle, Map as MapIcon, Navigation, Gauge } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { toast } from "@/components/ui/sonner";

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

// Define geofence areas
const geofences = [
  {
    id: 1,
    name: "Pokhara",
    location: [28.2096, 83.9856] as [number, number], // Pokhara, Nepal coordinates
    radius: 5000, // 5km radius in meters
    color: "#ff9800",
    fillColor: "#ff980033",
  },
  {
    id: 2,
    name: "Kathmandu",
    location: [27.7172, 85.3240] as [number, number], // Kathmandu, Nepal coordinates
    radius: 7000, // 7km radius in meters
    color: "#4caf50",
    fillColor: "#4caf5033",
  }
];

// Mock vehicle location data including history for simulation
const mockVehicles = [
  { 
    id: 1, 
    type: 'car', 
    name: 'Car 042', 
    position: [28.1996, 83.9756] as [number, number], // Near Pokhara
    previousPositions: [[28.1896, 83.9656], [28.1946, 83.9706]], // To simulate movement
    speed: 65,
    heading: 'North',
    destination: 'Pokhara Central',
    estimatedArrival: '14:30',
    driver: 'John Doe',
    inGeofence: {} as Record<number, boolean>,  // Track which geofences the vehicle is in
  },
  { 
    id: 2, 
    type: 'truck', 
    name: 'Truck 105', 
    position: [28.2296, 83.9956] as [number, number], // In Pokhara
    previousPositions: [[28.2196, 83.9856], [28.2246, 83.9906]], // To simulate movement
    speed: 45,
    heading: 'East',
    destination: 'Pokhara Distribution Center',
    estimatedArrival: '16:15',
    driver: 'Sarah Connor',
    inGeofence: {} as Record<number, boolean>,
  },
  { 
    id: 3, 
    type: 'van', 
    name: 'Van 087', 
    position: [27.7072, 85.3140] as [number, number], // Near Kathmandu
    previousPositions: [[27.6972, 85.3040], [27.7022, 85.3090]], // To simulate movement
    speed: 55,
    heading: 'South',
    destination: 'Kathmandu Office',
    estimatedArrival: '15:45',
    driver: 'Robert Chen',
    inGeofence: {} as Record<number, boolean>,
  },
  { 
    id: 4, 
    type: 'truck', 
    name: 'Truck 118', 
    position: [27.7272, 85.3340] as [number, number], // In Kathmandu
    previousPositions: [[27.7172, 85.3240], [27.7222, 85.3290]], // To simulate movement
    speed: 30,
    heading: 'West',
    destination: 'Kathmandu Warehouse',
    estimatedArrival: '17:20',
    driver: 'Maria Garcia',
    inGeofence: {} as Record<number, boolean>,
  }
];

// Function to check if a point is inside a circle (geofence)
const isPointInCircle = (point: [number, number], circle: [number, number], radius: number): boolean => {
  // Calculate distance between points in meters
  const lat1 = point[0];
  const lon1 = point[1];
  const lat2 = circle[0];
  const lon2 = circle[1];

  // Haversine formula to calculate distance
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;
  return distance <= radius;
};

const Dashboard = () => {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [stats, setStats] = useState(mockStats);
  const [alerts, setAlerts] = useState(mockAlerts);
  const [selectedVehicle, setSelectedVehicle] = useState<null | typeof mockVehicles[0]>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.2096, 83.9856]); // Pokhara coordinates
  const [vehiclePositions, setVehiclePositions] = useState(mockVehicles);
  const [geofenceAlerts, setGeofenceAlerts] = useState<{id: number, vehicle: string, geofence: string, timestamp: string}[]>([]);
  
  // Reference to track initialization state
  const initialized = useRef(false);

  useEffect(() => {
    // This would fetch data from Supabase in a real app
    const timer = setTimeout(() => {
      setIsMapLoaded(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Effect to simulate vehicle movement and check geofence status
  useEffect(() => {
    if (!isMapLoaded || initialized.current) return;
    
    // Mark as initialized to prevent duplicate initialization
    initialized.current = true;
    
    // Initialize geofence status for all vehicles
    const initializedVehicles = vehiclePositions.map(vehicle => {
      const vehicleWithGeofence = {...vehicle};
      geofences.forEach(geofence => {
        vehicleWithGeofence.inGeofence[geofence.id] = isPointInCircle(
          vehicle.position, 
          geofence.location, 
          geofence.radius
        );
      });
      return vehicleWithGeofence;
    });
    setVehiclePositions(initializedVehicles);

    // Set up interval for vehicle movement simulation
    const movementInterval = setInterval(() => {
      setVehiclePositions(prevPositions => {
        // Move the vehicles slightly to simulate movement
        const updatedPositions = prevPositions.map(vehicle => {
          // Small random movement
          const newLat = vehicle.position[0] + (Math.random() - 0.5) * 0.005;
          const newLng = vehicle.position[1] + (Math.random() - 0.5) * 0.005;
          
          const updatedVehicle = {
            ...vehicle,
            position: [newLat, newLng] as [number, number],
            previousPositions: [...vehicle.previousPositions, vehicle.position]
          };
          
          // Check if vehicle has entered or left any geofences
          geofences.forEach(geofence => {
            const wasInGeofence = vehicle.inGeofence[geofence.id];
            const isInGeofence = isPointInCircle(
              updatedVehicle.position, 
              geofence.location, 
              geofence.radius
            );
            
            updatedVehicle.inGeofence[geofence.id] = isInGeofence;
            
            // Vehicle has entered a geofence
            if (isInGeofence && !wasInGeofence) {
              // Create geofence alert
              const alertTimestamp = new Date().toISOString();
              setGeofenceAlerts(prev => [
                ...prev,
                {
                  id: Date.now(),
                  vehicle: vehicle.name,
                  geofence: geofence.name,
                  timestamp: alertTimestamp
                }
              ]);
              
              // Show toast notification
              toast(`${vehicle.name} has entered ${geofence.name}`, {
                description: `Driver: ${vehicle.driver}`,
                action: {
                  label: "View",
                  onClick: () => setSelectedVehicle(updatedVehicle),
                },
              });
              
              // Add to alerts list
              setAlerts(prev => [
                {
                  id: Date.now(),
                  vehicle: vehicle.name,
                  type: `Entered ${geofence.name}`,
                  severity: "medium",
                  timestamp: alertTimestamp
                },
                ...prev
              ]);
            }
            
            // Vehicle has exited a geofence
            if (!isInGeofence && wasInGeofence) {
              toast(`${vehicle.name} has left ${geofence.name}`, {
                description: `Driver: ${vehicle.driver}`,
                action: {
                  label: "View",
                  onClick: () => setSelectedVehicle(updatedVehicle),
                },
              });
            }
          });
          
          return updatedVehicle;
        });
        
        return updatedPositions;
      });
    }, 5000); // Update every 5 seconds
    
    return () => {
      clearInterval(movementInterval);
    };
  }, [isMapLoaded]);

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
                <div className="w-full h-full p-0">
                  <MapContainer 
                    center={mapCenter}
                    zoom={10} 
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* Render geofence circles */}
                    {geofences.map(geofence => (
                      <Circle
                        key={geofence.id}
                        center={geofence.location}
                        radius={geofence.radius}
                        pathOptions={{
                          color: geofence.color,
                          fillColor: geofence.fillColor,
                          fillOpacity: 0.2
                        }}
                      >
                        <Popup>
                          <div className="text-sm p-2">
                            <p className="font-bold">{geofence.name} Geofence</p>
                            <p>Radius: {geofence.radius / 1000} km</p>
                          </div>
                        </Popup>
                      </Circle>
                    ))}
                    
                    {/* Render vehicle markers */}
                    {vehiclePositions.map(vehicle => (
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
                            {/* Show geofence status */}
                            {Object.entries(vehicle.inGeofence).map(([geoId, isIn]) => {
                              const geofence = geofences.find(g => g.id === Number(geoId));
                              if (!geofence) return null;
                              return (
                                <p key={geoId} className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block mr-1 ${isIn ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                  {isIn ? `In ${geofence.name}` : `Outside ${geofence.name}`}
                                </p>
                              );
                            })}
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
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
              {alerts.slice(0, 4).map((alert) => (
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
                <TabsTrigger value="geofence">Geofence Events</TabsTrigger>
                <TabsTrigger value="7days">Last 7 Days</TabsTrigger>
                <TabsTrigger value="30days">Last 30 Days</TabsTrigger>
              </TabsList>
              
              <TabsContent value="map" className="h-96">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
                  <div className="lg:col-span-2 h-full relative">
                    <div className="absolute top-2 right-2 z-10 bg-white bg-opacity-80 rounded px-2 py-1 text-xs font-medium">
                      {selectedVehicle ? `Tracking: ${selectedVehicle.name}` : 'Click on a vehicle to track'}
                    </div>
                    <MapContainer 
                      center={mapCenter}
                      zoom={10} 
                      style={{ height: '100%', width: '100%', borderRadius: '0.375rem' }}
                      zoomControl={false}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      
                      {/* Render geofence circles */}
                      {geofences.map(geofence => (
                        <Circle
                          key={geofence.id}
                          center={geofence.location}
                          radius={geofence.radius}
                          pathOptions={{
                            color: geofence.color,
                            fillColor: geofence.fillColor,
                            fillOpacity: 0.2
                          }}
                        >
                          <Popup>
                            <div className="text-sm p-2">
                              <p className="font-bold">{geofence.name} Geofence</p>
                              <p>Radius: {geofence.radius / 1000} km</p>
                            </div>
                          </Popup>
                        </Circle>
                      ))}
                      
                      {/* Render vehicle markers */}
                      {vehiclePositions.map(vehicle => (
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
                            <Gauge className="h-4 w-4 mr-2 text-slate-500" />
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
                              <MapIcon className="h-4 w-4 mr-2 text-slate-500" />
                              <p className="font-medium">{selectedVehicle.destination}</p>
                            </div>
                            <p className="text-sm text-slate-600">ETA: {selectedVehicle.estimatedArrival}</p>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-xs text-slate-500">Driver</p>
                            <p className="font-medium">{selectedVehicle.driver}</p>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-xs text-slate-500">Geofence Status</p>
                            {Object.entries(selectedVehicle.inGeofence).map(([geoId, isIn]) => {
                              const geofence = geofences.find(g => g.id === Number(geoId));
                              if (!geofence) return null;
                              return (
                                <div 
                                  key={geoId} 
                                  className={`text-sm px-2 py-1 rounded-md ${
                                    isIn ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {isIn ? `In ${geofence.name} zone` : `Outside ${geofence.name} zone`}
                                </div>
                              );
                            })}
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
              
              <TabsContent value="geofence" className="h-96">
                <div className="h-full flex flex-col">
                  <div className="mb-4">
                    <h3 className="text-md font-medium mb-2">Geofence Events</h3>
                    <p className="text-sm text-slate-500">Recent vehicle entries to defined geofence areas</p>
                  </div>
                  
                  {geofenceAlerts.length > 0 ? (
                    <div className="flex-1 overflow-auto border rounded-md">
                      <div className="divide-y">
                        {geofenceAlerts.map((alert) => (
                          <div key={alert.id} className="p-4 hover:bg-slate-50">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{alert.vehicle} entered {alert.geofence}</h4>
                                <p className="text-sm text-slate-500">{formatTimestamp(alert.timestamp)}</p>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  const vehicle = vehiclePositions.find(v => v.name === alert.vehicle);
                                  if (vehicle) {
                                    setSelectedVehicle(vehicle);
                                    setMapCenter(vehicle.position);
                                  }
                                }}
                              >
                                View
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center border rounded-md">
                      <div className="text-center text-slate-500">
                        <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No geofence events recorded yet</p>
                        <p className="text-xs mt-2">Events will appear when vehicles enter defined areas</p>
                      </div>
                    </div>
                  )}
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
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
