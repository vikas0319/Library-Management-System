
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

type User = {
  id: string;
  name: string;
  role: "admin" | "user";
  email: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo purposes
const MOCK_USERS = [
  {
    id: "1",
    name: "Admin User",
    role: "admin" as const,
    email: "admin@bookworm.com",
    password: "admin123",
  },
  {
    id: "2",
    name: "Regular User",
    role: "user" as const,
    email: "user@bookworm.com",
    password: "user123",
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  
  // Check if user is already logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("bookworm-user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("bookworm-user");
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const foundUser = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem("bookworm-user", JSON.stringify(userWithoutPassword));
      toast.success(`Welcome back, ${userWithoutPassword.name}!`);
      return true;
    }

    toast.error("Invalid email or password");
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("bookworm-user");
    toast.info("You have been logged out");
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
