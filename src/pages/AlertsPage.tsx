
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { 
  Bell, 
  AlertTriangle, 
  Search, 
  Download,
  Filter,
  Car,
  Check
} from "lucide-react";

// Types definition
type Alert = {
  id: string;
  alert_type: string;
  description: string | null;
  severity: string;
  timestamp: string;
  is_resolved: boolean | null;
  vehicle_id: string;
  vehicle?: Vehicle;
};

type Vehicle = {
  id: string;
  name: string;
  license_plate: string;
  status: string;
  firmware_version?: string;
  needs_update?: boolean;
};

type Driver = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string;
  subscription_status: string;
  subscription_end_date: string;
};

const AlertsPage = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedVehicleFilter, setSelectedVehicleFilter] = useState<string>("all");
  const [showNotification, setShowNotification] = useState(true);
  
  useEffect(() => {
    fetchAlerts();
    fetchVehicles();
    fetchDrivers();
    
    // Show notification toast on initial load
    if (showNotification) {
      toast({
        title: "New Alerts Available",
        description: "You have 3 unresolved alerts that require attention.",
        variant: "destructive",
      });
      setShowNotification(false);
    }
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("alerts")
        .select(`
          *,
          vehicles (
            id,
            name,
            license_plate,
            status
          )
        `);

      if (error) throw error;

      if (data) {
        // Transform data to match our Alert type
        const alertsWithVehicles = data.map(alert => ({
          ...alert,
          vehicle: alert.vehicles
        }));
        setAlerts(alertsWithVehicles);
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*");

      if (error) throw error;

      if (data) {
        // Add dummy firmware data
        const vehiclesWithFirmware = data.map(v => ({
          ...v,
          firmware_version: `v${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 10)}`,
          needs_update: Math.random() > 0.6
        }));
        setVehicles(vehiclesWithFirmware);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const { data, error } = await supabase.from("drivers").select("*");
      
      if (error) throw error;
      
      if (data) {
        // Add dummy address and subscription data
        const driversWithDetails = data.map(driver => ({
          ...driver,
          address: `${Math.floor(Math.random() * 1000) + 1} ${['Main', 'Oak', 'Maple', 'Pine', 'Elm'][Math.floor(Math.random() * 5)]} St, ${['New York', 'Chicago', 'Los Angeles', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)]}, US`,
          subscription_status: Math.random() > 0.3 ? 'active' : 'expired',
          subscription_end_date: new Date(Date.now() + (Math.random() > 0.3 ? 90 : -30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }));
        setDrivers(driversWithDetails);
      }
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };

  // Mark alert as resolved
  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from("alerts")
        .update({ is_resolved: true })
        .eq("id", alertId);

      if (error) throw error;

      // Update local state
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, is_resolved: true } : alert
      ));

      toast({
        title: "Alert Resolved",
        description: "The alert has been marked as resolved.",
      });
    } catch (error) {
      console.error("Error resolving alert:", error);
      toast({
        title: "Error",
        description: "Failed to resolve the alert.",
        variant: "destructive",
      });
    }
  };

  // Generate dummy report data
  const generateReportData = () => {
    const data = [
      ["Alert ID", "Type", "Vehicle", "Severity", "Date", "Status"],
      ...alerts.map(alert => [
        alert.id,
        alert.alert_type,
        alert.vehicle?.name || "Unknown",
        alert.severity,
        new Date(alert.timestamp).toLocaleString(),
        alert.is_resolved ? "Resolved" : "Pending"
      ])
    ];
    
    return data.map(row => row.join(",")).join("\n");
  };

  // Download report as CSV
  const downloadReport = () => {
    const csvContent = generateReportData();
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `alerts_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Filter alerts based on search query, tab, and vehicle filter
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = 
      alert.alert_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (alert.description && alert.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (alert.vehicle?.name && alert.vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTab = 
      activeTab === "all" || 
      (activeTab === "resolved" && alert.is_resolved === true) ||
      (activeTab === "pending" && alert.is_resolved !== true);
      
    const matchesVehicleFilter =
      selectedVehicleFilter === "all" ||
      (selectedVehicleFilter === "active" && alert.vehicle?.status === "active") ||
      (selectedVehicleFilter === "firmware" && vehicles.find(v => v.id === alert.vehicle_id)?.needs_update);
    
    return matchesSearch && matchesTab && matchesVehicleFilter;
  });

  // Count alerts by status
  const alertCounts = {
    all: alerts.length,
    resolved: alerts.filter(a => a.is_resolved === true).length,
    pending: alerts.filter(a => a.is_resolved !== true).length
  };

  // Get severity badge color
  const getSeverityBadgeColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high": return "bg-red-500 hover:bg-red-600";
      case "medium": return "bg-yellow-500 hover:bg-yellow-600";
      case "low": return "bg-blue-500 hover:bg-blue-600";
      default: return "bg-gray-500 hover:bg-gray-600";
    }
  };

  // Get firmware status badge
  const getFirmwareBadge = (vehicle: Vehicle) => {
    if (!vehicle.needs_update) return null;
    return (
      <Badge className="bg-orange-500 hover:bg-orange-600 ml-2">
        Firmware Update
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Alerts & Notifications</h1>

      {/* Dashboard Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Bell className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{alertCounts.all}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">Pending Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <AlertTriangle className="mr-2 h-4 w-4 text-yellow-600" />
              <span className="text-2xl font-bold">{alertCounts.pending}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Resolved Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold">{alertCounts.resolved}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search, Filter, and Download */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search alerts..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedVehicleFilter} onValueChange={setSelectedVehicleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by vehicles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vehicles</SelectItem>
                <SelectItem value="active">Active Vehicles</SelectItem>
                <SelectItem value="firmware">Needs Firmware Update</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={downloadReport}>
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </div>
      </div>

      {/* Notification Alert Banner */}
      <Alert className="bg-yellow-50 border-yellow-200">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800">Vehicle Firmware Updates Available</AlertTitle>
        <AlertDescription className="text-yellow-700">
          {vehicles.filter(v => v.needs_update).length} vehicles need firmware updates. 
          Filter by "Needs Firmware Update" to see affected vehicles.
        </AlertDescription>
      </Alert>

      {/* Alerts List */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 mb-2">
                <TabsTrigger value="all">All ({alertCounts.all})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({alertCounts.pending})</TabsTrigger>
                <TabsTrigger value="resolved">Resolved ({alertCounts.resolved})</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading alerts...</p>
            ) : filteredAlerts.length === 0 ? (
              <p>No alerts found.</p>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {filteredAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center mb-1">
                          <h3 className="font-medium text-lg">{alert.alert_type}</h3>
                          <Badge className={`ml-2 ${getSeverityBadgeColor(alert.severity)}`}>
                            {alert.severity}
                          </Badge>
                          {alert.vehicle && getFirmwareBadge(vehicles.find(v => v.id === alert.vehicle_id) as Vehicle)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Vehicle: {alert.vehicle?.name} ({alert.vehicle?.license_plate})
                        </p>
                        <p className="text-sm mb-3">{alert.description}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <span>{new Date(alert.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                      {!alert.is_resolved && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => resolveAlert(alert.id)}
                        >
                          <Check className="mr-1 h-4 w-4" />
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Driver Information Section */}
      <h2 className="text-2xl font-bold mt-8">Driver Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {drivers.slice(0, 4).map((driver) => (
          <Card key={driver.id}>
            <CardHeader>
              <CardTitle className="text-lg">{driver.name}</CardTitle>
              <Badge 
                className={driver.subscription_status === 'active' ? 
                  "bg-green-500 hover:bg-green-600" : 
                  "bg-red-500 hover:bg-red-600"}
              >
                {driver.subscription_status === 'active' ? 'Active Subscription' : 'Subscription Expired'}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p>{driver.email || "No email provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p>{driver.phone || "No phone provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p>{driver.address}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Subscription End Date</p>
                  <p>{driver.subscription_end_date}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AlertsPage;
