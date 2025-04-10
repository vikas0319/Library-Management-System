
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Book, 
  BookCopy, 
  BookOpen, 
  Home, 
  Layers, 
  Library, 
  LogOut, 
  Search, 
  Users, 
  BarChart3, 
  FileBarChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  // If not authenticated and not on login page, redirect to login
  useEffect(() => {
    if (!isAuthenticated && location.pathname !== "/login") {
      navigate("/login");
    }
  }, [isAuthenticated, location.pathname, navigate]);

  // Admin navigation items
  const adminNav = [
    { name: "Dashboard", icon: <Home size={18} />, path: "/" },
    { name: "Book Management", icon: <Book size={18} />, path: "/books" },
    { name: "User Management", icon: <Users size={18} />, path: "/users" },
    { name: "Membership", icon: <Library size={18} />, path: "/membership" },
    { name: "Reports", icon: <FileBarChart size={18} />, path: "/reports" },
    { name: "Issue Book", icon: <BookCopy size={18} />, path: "/issue-book" },
    { name: "Return Book", icon: <BookOpen size={18} />, path: "/return-book" },
    { name: "Search Books", icon: <Search size={18} />, path: "/search" }
  ];

  // User navigation items
  const userNav = [
    { name: "Dashboard", icon: <Home size={18} />, path: "/" },
    { name: "Search Books", icon: <Search size={18} />, path: "/search" },
    { name: "Issue Book", icon: <BookCopy size={18} />, path: "/issue-book" },
    { name: "Return Book", icon: <BookOpen size={18} />, path: "/return-book" }
  ];

  // Use appropriate nav based on user role
  const navItems = user?.role === "admin" ? adminNav : userNav;

  const handleNavigation = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  // If not authenticated, only show the children (which should be the login page)
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="w-64 bg-library-dark text-white fixed h-full">
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-8">
              <Layers className="text-library-light-accent" size={24} />
              <h1 className="text-xl font-serif">Bookworm Library</h1>
            </div>
            
            <div className="mb-6">
              <div className="text-sm text-library-warm/70">Logged in as</div>
              <div className="font-medium">{user?.name}</div>
              <div className="text-xs opacity-70">{user?.role}</div>
            </div>
            
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  className={`w-full justify-start text-left ${
                    location.pathname === item.path
                      ? "bg-library-accent text-white"
                      : "text-gray-300 hover:bg-library-accent/20"
                  }`}
                  onClick={() => handleNavigation(item.path)}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Button>
              ))}
              
              <Button
                variant="ghost"
                className="w-full justify-start text-left text-gray-300 hover:bg-library-accent/20"
                onClick={logout}
              >
                <span className="mr-3"><LogOut size={18} /></span>
                Logout
              </Button>
            </nav>
          </div>
        </div>
      )}

      {/* Mobile Navigation */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-library-warm p-3 flex items-center justify-between">
          <div className="flex items-center">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" className="p-2 text-white">
                  <Layers size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-library-dark text-white">
                <div className="p-4">
                  <div className="flex items-center space-x-2 mb-8">
                    <Layers className="text-library-light-accent" size={24} />
                    <h1 className="text-xl font-serif">Bookworm Library</h1>
                  </div>
                  
                  <div className="mb-6">
                    <div className="text-sm text-library-warm/70">Logged in as</div>
                    <div className="font-medium">{user?.name}</div>
                    <div className="text-xs opacity-70">{user?.role}</div>
                  </div>
                  
                  <nav className="space-y-1">
                    {navItems.map((item) => (
                      <Button
                        key={item.path}
                        variant="ghost"
                        className={`w-full justify-start text-left ${
                          location.pathname === item.path
                            ? "bg-library-accent text-white"
                            : "text-gray-300 hover:bg-library-accent/20"
                        }`}
                        onClick={() => handleNavigation(item.path)}
                      >
                        <span className="mr-3">{item.icon}</span>
                        {item.name}
                      </Button>
                    ))}
                    
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left text-gray-300 hover:bg-library-accent/20"
                      onClick={logout}
                    >
                      <span className="mr-3"><LogOut size={18} /></span>
                      Logout
                    </Button>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
            <span className="text-white font-serif text-lg ml-2">Bookworm Library</span>
          </div>
          <Button variant="ghost" className="p-2 text-white" onClick={logout}>
            <LogOut size={20} />
          </Button>
        </div>
      )}

      {/* Main Content */}
      <div className={`${isMobile ? 'pt-16' : 'ml-64'} flex-1`}>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
