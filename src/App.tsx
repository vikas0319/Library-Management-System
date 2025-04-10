
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LibraryProvider } from "@/contexts/LibraryContext";
import Layout from "@/components/Layout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import SearchBooks from "./pages/SearchBooks";
import IssueBook from "./pages/IssueBook";
import ReturnBook from "./pages/ReturnBook";
import BookManagement from "./pages/BookManagement";
import Membership from "./pages/Membership";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Admin-only route wrapper
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <LibraryProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Layout>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                
                {/* Protected routes */}
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/search" 
                  element={
                    <ProtectedRoute>
                      <SearchBooks />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/issue-book" 
                  element={
                    <ProtectedRoute>
                      <IssueBook />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/return-book" 
                  element={
                    <ProtectedRoute>
                      <ReturnBook />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Admin-only routes */}
                <Route 
                  path="/books" 
                  element={
                    <AdminRoute>
                      <BookManagement />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/membership" 
                  element={
                    <AdminRoute>
                      <Membership />
                    </AdminRoute>
                  } 
                />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </LibraryProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
