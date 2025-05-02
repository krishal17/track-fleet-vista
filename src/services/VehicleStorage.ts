
import { VehicleType } from "@/components/vehicles/AddVehicleForm";
import { supabase } from "@/integrations/supabase/client";

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
  created_at?: string;
}

const STORAGE_KEY = 'fleet_vehicles';

export const VehicleStorage = {
  getVehicles: async (): Promise<Vehicle[]> => {
    // Try to get from Supabase first
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // If we have data from Supabase, return it
      if (data && data.length > 0) {
        return data.map(vehicle => ({
          ...vehicle,
          id: vehicle.id,
          position: vehicle.last_lat && vehicle.last_lng ? [vehicle.last_lat, vehicle.last_lng] as [number, number] : undefined
        }));
      }
    } catch (error) {
      console.error('Error fetching from Supabase:', error);
      // Fall back to local storage if Supabase fails
    }
    
    // Fall back to local storage
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) return [];
    
    try {
      return JSON.parse(storedData);
    } catch (error) {
      console.error('Error parsing stored vehicles:', error);
      return [];
    }
  },
  
  saveVehicle: async (vehicle: Vehicle): Promise<Vehicle> => {
    // Try to save to Supabase
    try {
      // Format the data for Supabase
      const vehicleData = {
        name: vehicle.name,
        license_plate: vehicle.licensePlate,
        status: vehicle.status,
        last_lat: vehicle.position ? vehicle.position[0] : null,
        last_lng: vehicle.position ? vehicle.position[1] : null,
        fuel_level: vehicle.fuelLevel || null,
        model: vehicle.type // Using type as model for now
      };
      
      const { data, error } = await supabase
        .from('vehicles')
        .insert(vehicleData)
        .select('*')
        .single();
      
      if (error) throw error;
      
      if (data) {
        // Return the vehicle with the Supabase ID
        return {
          ...vehicle,
          id: data.id,
          created_at: data.created_at
        };
      }
    } catch (error) {
      console.error('Error saving to Supabase:', error);
      // Fall back to local storage if Supabase fails
    }
    
    // Fall back to local storage
    const currentVehicles = await VehicleStorage.getVehicles();
    const updatedVehicles = [...currentVehicles, vehicle];
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedVehicles));
    return vehicle;
  },
  
  updateVehicle: async (updatedVehicle: Vehicle): Promise<void> => {
    // Try to update in Supabase if it's a UUID (Supabase ID)
    if (updatedVehicle.id && updatedVehicle.id.length === 36) {
      try {
        const { error } = await supabase
          .from('vehicles')
          .update({
            name: updatedVehicle.name,
            license_plate: updatedVehicle.licensePlate,
            status: updatedVehicle.status,
            last_lat: updatedVehicle.position ? updatedVehicle.position[0] : null,
            last_lng: updatedVehicle.position ? updatedVehicle.position[1] : null,
            fuel_level: updatedVehicle.fuelLevel || null,
            model: updatedVehicle.type
          })
          .eq('id', updatedVehicle.id);
        
        if (error) throw error;
        
        // If successful, we're done
        return;
      } catch (error) {
        console.error('Error updating in Supabase:', error);
        // Fall back to local storage
      }
    }
    
    // Fall back to local storage
    const currentVehicles = await VehicleStorage.getVehicles();
    const updatedVehicles = currentVehicles.map(v => 
      v.id === updatedVehicle.id ? updatedVehicle : v
    );
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedVehicles));
  },
  
  deleteVehicle: async (vehicleId: string): Promise<void> => {
    // Try to delete from Supabase if it's a UUID (Supabase ID)
    if (vehicleId && vehicleId.length === 36) {
      try {
        const { error } = await supabase
          .from('vehicles')
          .delete()
          .eq('id', vehicleId);
        
        if (error) throw error;
        
        // If successful, we're done
        return;
      } catch (error) {
        console.error('Error deleting from Supabase:', error);
        // Fall back to local storage
      }
    }
    
    // Fall back to local storage
    const currentVehicles = await VehicleStorage.getVehicles();
    const updatedVehicles = currentVehicles.filter(v => v.id !== vehicleId);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedVehicles));
  },
  
  getRecentVehicles: async (limit: number = 5): Promise<Vehicle[]> => {
    // Try to get from Supabase first
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      // If we have data from Supabase, return it
      if (data && data.length > 0) {
        return data.map(vehicle => ({
          ...vehicle,
          id: vehicle.id,
          licensePlate: vehicle.license_plate,
          position: vehicle.last_lat && vehicle.last_lng ? [vehicle.last_lat, vehicle.last_lng] as [number, number] : undefined,
          fuelLevel: vehicle.fuel_level,
          type: vehicle.model as VehicleType || 'car'
        }));
      }
    } catch (error) {
      console.error('Error fetching recent vehicles from Supabase:', error);
      // Fall back to local storage if Supabase fails
    }
    
    // Fall back to local storage
    const allVehicles = await VehicleStorage.getVehicles();
    return allVehicles.slice(0, limit);
  }
};
