
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layers } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = "Email is required";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        navigate("/");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-library-paper py-12 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2128&auto=format&fit=crop')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto flex justify-center mb-2">
            <Layers className="h-12 w-12 text-library-accent" />
          </div>
          <CardTitle className="text-3xl font-serif text-library-dark">Bookworm Library</CardTitle>
          <CardDescription>Sign in to access your library account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
              <div className="text-xs text-muted-foreground">
                Try: admin@bookworm.com / admin123 or user@bookworm.com / user123
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-library-accent hover:bg-library-light-accent text-white"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          <p>© 2025 Bookworm Library. All rights reserved.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
