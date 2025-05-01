
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Car, 
  AlertTriangle, 
  Wrench, 
  Search, 
  FilePlus, 
  MapPin
} from "lucide-react";

// Define the vehicle type based on the Supabase schema
type Vehicle = {
  id: string;
  name: string;
  license_plate: string;
  status: "active" | "inactive" | "maintenance";
  last_lat: number | null;
  last_lng: number | null;
  fuel_level: number | null;
  model: string | null;
  year: number | null;
  created_at: string;
  updated_at: string;
};

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("vehicles")
        .select("*");

      if (error) throw error;

      if (data) {
        setVehicles(data as Vehicle[]);
        // Select the first vehicle by default
        if (data.length > 0 && !selectedVehicle) {
          setSelectedVehicle(data[0] as Vehicle);
        }
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter vehicles based on search query and active tab
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.license_plate.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && vehicle.status === activeTab;
  });

  // Count vehicles by status
  const vehicleCounts = {
    all: vehicles.length,
    active: vehicles.filter(v => v.status === "active").length,
    inactive: vehicles.filter(v => v.status === "inactive").length,
    maintenance: vehicles.filter(v => v.status === "maintenance").length
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500 hover:bg-green-600";
      case "inactive": return "bg-gray-500 hover:bg-gray-600";
      case "maintenance": return "bg-yellow-500 hover:bg-yellow-600";
      default: return "bg-gray-500 hover:bg-gray-600";
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Vehicles</h1>

      {/* Dashboard Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Car className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{vehicleCounts.all}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Active Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Car className="mr-2 h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold">{vehicleCounts.active}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inactive Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <AlertTriangle className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{vehicleCounts.inactive}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">In Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Wrench className="mr-2 h-4 w-4 text-yellow-600" />
              <span className="text-2xl font-bold">{vehicleCounts.maintenance}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Add Vehicle */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vehicles..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button>
          <FilePlus className="mr-2 h-4 w-4" />
          Add Vehicle
        </Button>
      </div>

      {/* Vehicles List and Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Vehicles List */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Vehicles</CardTitle>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-4 mb-2">
                  <TabsTrigger value="all">All ({vehicleCounts.all})</TabsTrigger>
                  <TabsTrigger value="active">Active ({vehicleCounts.active})</TabsTrigger>
                  <TabsTrigger value="inactive">Inactive ({vehicleCounts.inactive})</TabsTrigger>
                  <TabsTrigger value="maintenance">Maintenance ({vehicleCounts.maintenance})</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading vehicles...</p>
              ) : filteredVehicles.length === 0 ? (
                <p>No vehicles found.</p>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {filteredVehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedVehicle?.id === vehicle.id
                          ? "bg-primary-50 border-primary-200"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => setSelectedVehicle(vehicle)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{vehicle.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {vehicle.license_plate}
                          </p>
                        </div>
                        <Badge className={getStatusBadgeColor(vehicle.status)}>
                          {vehicle.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Vehicle Details */}
        <div className="md:col-span-2">
          {selectedVehicle ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Vehicle Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <span>Vehicle Details</span>
                    <Badge className={getStatusBadgeColor(selectedVehicle.status)}>
                      {selectedVehicle.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-xl">{selectedVehicle.name}</h3>
                      <p className="text-muted-foreground">{selectedVehicle.model}, {selectedVehicle.year}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">License Plate</p>
                        <p className="font-medium">{selectedVehicle.license_plate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Fuel Level</p>
                        <p className="font-medium">{selectedVehicle.fuel_level}%</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Last Updated</p>
                      <p className="font-medium">
                        {new Date(selectedVehicle.updated_at).toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Maintenance</Button>
                      <Button variant="outline" size="sm">History</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Map Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedVehicle.last_lat && selectedVehicle.last_lng ? (
                    <div className="bg-gray-100 rounded-md h-[250px] flex items-center justify-center">
                      <div className="text-center">
                        <p>Map would display here</p>
                        <p className="text-sm text-muted-foreground">
                          Lat: {selectedVehicle.last_lat.toFixed(4)}, 
                          Lng: {selectedVehicle.last_lng.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-100 rounded-md h-[250px] flex items-center justify-center">
                      <p className="text-muted-foreground">No location data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center border rounded-lg bg-muted/50 p-8">
              <p className="text-muted-foreground">Select a vehicle to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehiclesPage;
