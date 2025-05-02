
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export type VehicleType = 'car' | 'truck' | 'van' | 'bus';

interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  licensePlate: string;
  status: 'active' | 'maintenance' | 'inactive';
}

interface AddVehicleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (vehicle: Vehicle) => void;
}

const AddVehicleForm = ({ open, onOpenChange, onSave }: AddVehicleFormProps) => {
  const [vehicleData, setVehicleData] = useState<Omit<Vehicle, 'id'>>({
    name: '',
    type: 'car',
    licensePlate: '',
    status: 'active'
  });

  const handleChange = (field: keyof Omit<Vehicle, 'id'>, value: string) => {
    setVehicleData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate a unique ID
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: `v-${Date.now()}`
    };
    
    // Save the vehicle
    onSave(newVehicle);
    
    // Reset form
    setVehicleData({
      name: '',
      type: 'car',
      licensePlate: '',
      status: 'active'
    });
    
    // Close dialog
    onOpenChange(false);
    
    // Show success notification
    toast.success(`Vehicle "${newVehicle.name}" added successfully`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Vehicle</DialogTitle>
            <DialogDescription>
              Enter the details of the new vehicle to add it to the fleet.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={vehicleData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select
                value={vehicleData.type}
                onValueChange={(value) => handleChange('type', value as VehicleType)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="car">Car</SelectItem>
                  <SelectItem value="truck">Truck</SelectItem>
                  <SelectItem value="van">Van</SelectItem>
                  <SelectItem value="bus">Bus</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="licensePlate" className="text-right">
                License Plate
              </Label>
              <Input
                id="licensePlate"
                value={vehicleData.licensePlate}
                onChange={(e) => handleChange('licensePlate', e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={vehicleData.status}
                onValueChange={(value) => handleChange('status', value as 'active' | 'maintenance' | 'inactive')}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit">Add Vehicle</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddVehicleForm;
