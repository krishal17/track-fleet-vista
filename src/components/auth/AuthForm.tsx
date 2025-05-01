
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Lock, AlertCircle } from "lucide-react";

type AuthMode = "login" | "signup" | "forgotPassword";

const AuthForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      switch (authMode) {
        case "login":
          // In a real app, this would connect to Supabase Auth
          console.log("Logging in with:", email, password);
          toast({
            title: "Success!",
            description: "You've been logged in successfully.",
          });
          setTimeout(() => navigate("/dashboard"), 500);
          break;

        case "signup":
          if (password !== confirmPassword) {
            setError("Passwords do not match");
            break;
          }
          // In a real app, this would connect to Supabase Auth
          console.log("Signing up with:", email, password);
          toast({
            title: "Account created!",
            description: "Your account has been created successfully.",
          });
          setAuthMode("login");
          break;

        case "forgotPassword":
          // In a real app, this would connect to Supabase Auth
          console.log("Password reset for:", email);
          toast({
            title: "Password reset email sent",
            description: "Check your inbox for a password reset link.",
          });
          setAuthMode("login");
          break;
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          {authMode === "login" 
            ? "Sign In" 
            : authMode === "signup" 
              ? "Create Account" 
              : "Reset Password"}
        </CardTitle>
        <CardDescription>
          {authMode === "login" 
            ? "Enter your credentials to access your account" 
            : authMode === "signup" 
              ? "Fill out the form to create a new account" 
              : "Enter your email to receive a password reset link"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>
          
          {authMode !== "forgotPassword" && (
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>
          )}
          
          {authMode === "signup" && (
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : 
              authMode === "login" 
                ? "Sign In" 
                : authMode === "signup" 
                  ? "Create Account" 
                  : "Send Reset Link"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        {authMode === "login" && (
          <>
            <Button 
              variant="link" 
              onClick={() => setAuthMode("forgotPassword")}
              className="text-sm px-0"
            >
              Forgot password?
            </Button>
            <div className="text-sm text-center">
              Don't have an account?{" "}
              <Button 
                variant="link" 
                onClick={() => setAuthMode("signup")}
                className="p-0 h-auto text-primary-600"
              >
                Sign up
              </Button>
            </div>
          </>
        )}
        
        {authMode === "signup" && (
          <div className="text-sm text-center">
            Already have an account?{" "}
            <Button 
              variant="link" 
              onClick={() => setAuthMode("login")}
              className="p-0 h-auto text-primary-600"
            >
              Sign in
            </Button>
          </div>
        )}
        
        {authMode === "forgotPassword" && (
          <div className="text-sm text-center">
            Remember your password?{" "}
            <Button 
              variant="link" 
              onClick={() => setAuthMode("login")}
              className="p-0 h-auto text-primary-600"
            >
              Sign in
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default AuthForm;
