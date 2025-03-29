import { useEffect } from "react";
import { useLocation } from "wouter";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Search, Home, ShoppingBag, User, LogOut, HelpCircle, Settings } from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: any | null;
  onLogout: () => void;
}

export default function MobileMenu({ isOpen, onClose, user, onLogout }: MobileMenuProps) {
  const [, navigate] = useLocation();

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const navigateTo = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!user || !user.fullName) return user?.username?.[0]?.toUpperCase() || '?';
    
    return user.fullName
      .split(' ')
      .map((name: string) => name[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="left" className="w-[85%] sm:w-[350px]">
        <SheetHeader className="text-left">
          <SheetTitle>BidMaster</SheetTitle>
        </SheetHeader>
        
        {user ? (
          <div className="py-4">
            <div className="flex items-center space-x-3 mb-2">
              <Avatar>
                {user.profileImage ? (
                  <AvatarImage src={user.profileImage} alt={user.username} />
                ) : null}
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user.fullName || user.username}</p>
                <p className="text-sm text-neutral-500">@{user.username}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4 flex flex-col space-y-2">
            <Button onClick={() => navigateTo("/auth")}>Login</Button>
            <Button variant="outline" onClick={() => navigateTo("/auth")}>
              Register
            </Button>
          </div>
        )}
        
        <Separator className="my-2" />
        
        <div className="mt-4 space-y-1">
          <Button 
            variant="ghost" 
            className="w-full justify-start" 
            onClick={() => navigateTo("/")}
          >
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start" 
            onClick={() => navigateTo("/auctions")}
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Auctions
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start" 
            onClick={() => navigateTo("/auctions")}
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start" 
            onClick={() => navigateTo("/support")}
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Support
          </Button>
        </div>
        
        {user && (
          <>
            <Separator className="my-4" />
            
            <div className="space-y-1">
              <Button 
                variant="ghost" 
                className="w-full justify-start" 
                onClick={() => navigateTo("/profile")}
              >
                <User className="h-4 w-4 mr-2" />
                My Profile
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50" 
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>
          </>
        )}
        
        <SheetFooter className="absolute bottom-4 left-0 right-0 px-6">
          <p className="text-xs text-neutral-500 text-center">
            &copy; 2023 BidMaster. All rights reserved.
          </p>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
