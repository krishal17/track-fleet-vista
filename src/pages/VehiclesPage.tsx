
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddVehicleForm from "@/components/vehicles/AddVehicleForm";
import { VehicleStorage, Vehicle } from "@/services/VehicleStorage";

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load vehicles from Supabase or local storage
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const storedVehicles = await VehicleStorage.getVehicles();
        setVehicles(storedVehicles);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      }
    };

    fetchVehicles();
  }, []);

  const handleSaveVehicle = async (vehicle: Vehicle) => {
    setIsLoading(true);
    try {
      // Save to Supabase or local storage
      const savedVehicle = await VehicleStorage.saveVehicle(vehicle);
      
      // Update state
      setVehicles(prev => [savedVehicle, ...prev]);
    } catch (error) {
      console.error("Error saving vehicle:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return new Date().toLocaleDateString();
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Fleet Vehicles</h1>
        <Button onClick={() => setIsAddVehicleOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Vehicle
        </Button>
      </div>

      {vehicles.length === 0 ? (
        <Card className="bg-gray-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500 mb-4">No vehicles in the fleet yet</p>
            <Button onClick={() => setIsAddVehicleOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Your First Vehicle
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map(vehicle => (
            <Card key={vehicle.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{vehicle.name}</CardTitle>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-gray-500">{vehicle.licensePlate}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(vehicle.status)}`}>
                    {vehicle.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Type</p>
                    <p className="font-medium capitalize">{vehicle.type}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Added on</p>
                    <p className="font-medium">
                      {formatDate(vehicle.created_at)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddVehicleForm
        open={isAddVehicleOpen}
        onOpenChange={setIsAddVehicleOpen}
        onSave={handleSaveVehicle}
        isLoading={isLoading}
      />
    </div>
  );
};

export default VehiclesPage;
