
import { VehicleType } from "@/components/vehicles/AddVehicleForm";

export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  licensePlate: string;
  status: 'active' | 'maintenance' | 'inactive';
  position?: [number, number];
  speed?: number;
  heading?: number;
  destination?: string;
  fuelLevel?: number;
  lastMaintenance?: string;
}

const STORAGE_KEY = 'fleet_vehicles';

export const VehicleStorage = {
  getVehicles: (): Vehicle[] => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) return [];
    
    try {
      return JSON.parse(storedData);
    } catch (error) {
      console.error('Error parsing stored vehicles:', error);
      return [];
    }
  },
  
  saveVehicle: (vehicle: Vehicle): void => {
    const currentVehicles = VehicleStorage.getVehicles();
    const updatedVehicles = [...currentVehicles, vehicle];
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedVehicles));
  },
  
  updateVehicle: (updatedVehicle: Vehicle): void => {
    const currentVehicles = VehicleStorage.getVehicles();
    const updatedVehicles = currentVehicles.map(v => 
      v.id === updatedVehicle.id ? updatedVehicle : v
    );
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedVehicles));
  },
  
  deleteVehicle: (vehicleId: string): void => {
    const currentVehicles = VehicleStorage.getVehicles();
    const updatedVehicles = currentVehicles.filter(v => v.id !== vehicleId);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedVehicles));
  }
};
