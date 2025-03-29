import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Menu, Search, Bell, ChevronDown, LogOut, User, Package, Settings } from "lucide-react";
import MobileMenu from "./mobile-menu";

export default function Header() {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Track scroll position for shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!user || !user.fullName) return user?.username?.[0]?.toUpperCase() || '?';
    
    return user.fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header className={`bg-white ${isScrolled ? 'shadow-sm' : ''}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <a
              href="/"
              className="text-primary font-bold text-2xl"
              onClick={(e) => {
                e.preventDefault();
                navigate("/");
              }}
            >
              BidMaster
            </a>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a
              href="/"
              className={`text-neutral-800 hover:text-primary transition-colors ${
                location === "/" ? "text-primary font-medium" : ""
              }`}
              onClick={(e) => {
                e.preventDefault();
                navigate("/");
              }}
            >
              Home
            </a>
            <a
              href="/auctions"
              className={`text-neutral-800 hover:text-primary transition-colors ${
                location === "/auctions" ? "text-primary font-medium" : ""
              }`}
              onClick={(e) => {
                e.preventDefault();
                navigate("/auctions");
              }}
            >
              Auctions
            </a>
            <a
              href="/support"
              className={`text-neutral-800 hover:text-primary transition-colors ${
                location === "/support" ? "text-primary font-medium" : ""
              }`}
              onClick={(e) => {
                e.preventDefault();
                navigate("/support");
              }}
            >
              Support
            </a>
          </nav>
          
          {/* User Controls */}
          <div className="flex items-center space-x-4">
            {/* Desktop actions */}
            <div className="hidden md:block">
              <a
                href="/auctions"
                className="text-neutral-800 hover:text-primary mr-4"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/auctions");
                }}
              >
                <Search className="h-5 w-5" />
              </a>
              {user && (
                <a href="#" className="text-neutral-800 hover:text-primary mr-4">
                  <Bell className="h-5 w-5" />
                </a>
              )}
            </div>
            
            {/* User dropdown when logged in */}
            {user ? (
              <div className="hidden md:block relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 p-1">
                      <Avatar className="h-8 w-8">
                        {user.profileImage ? (
                          <AvatarImage src={user.profileImage} alt={user.username} />
                        ) : null}
                        <AvatarFallback>{getInitials()}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.username}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/auctions")}>
                      <Package className="h-4 w-4 mr-2" />
                      My Auctions
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/auth")}
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate("/auth")}
                >
                  Register
                </Button>
              </div>
            )}
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setShowMobileMenu(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <MobileMenu
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        user={user}
        onLogout={handleLogout}
      />
    </header>
  );
}
