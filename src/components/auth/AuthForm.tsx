
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthFormProps {
  onSubmit: (email: string, password: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

const AuthForm = ({ onSubmit, isLoading = false, error = null }: AuthFormProps) => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === "signup") {
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      
      // Register user with Supabase
      supabase.auth.signUp({
        email,
        password,
      }).then(({ error }) => {
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Account created! Check your email for verification.");
          setActiveTab("login");
        }
      });
    } else {
      // Login - handled by parent component
      onSubmit(email, password);
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <Tabs defaultValue="login" value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "signup")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="mt-4 p-0">
            <div className="text-center">
              <h3 className="text-lg font-medium">Welcome back</h3>
              <p className="text-sm text-gray-500">Enter your credentials to access your account</p>
            </div>
          </TabsContent>
          
          <TabsContent value="signup" className="mt-4 p-0">
            <div className="text-center">
              <h3 className="text-lg font-medium">Create an account</h3>
              <p className="text-sm text-gray-500">Enter your details to create a new account</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-900 rounded-md text-sm">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
              placeholder="Enter your password"
            />
          </div>
          
          {activeTab === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required
                placeholder="Confirm your password"
              />
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Processing..." : activeTab === "login" ? "Login" : "Sign up"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AuthForm;
