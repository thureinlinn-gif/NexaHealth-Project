import { useState } from "react";
import { Sparkles, Home, Upload, Stethoscope, MapPin, History, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import { NavLink } from "@/components/NavLink";
import { WalletButton } from "@/components/WalletButton";
import { motion } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-8">
          {/* Logo/Brand */}
          <motion.div 
            className="flex items-center gap-2 cursor-pointer flex-shrink-0" 
            onClick={() => navigate("/")}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 10, 0],
                scale: [1, 1.1, 1, 1.1, 1]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                repeatDelay: 2,
                ease: "easeInOut"
              }}
            >
              <Sparkles className="h-8 w-8 text-primary drop-shadow-[0_0_8px_hsl(var(--primary))]" />
            </motion.div>
            <motion.h1 
              className="text-2xl font-bold text-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              NexaHealth
            </motion.h1>
          </motion.div>

          {/* Navigation Links - Hidden on mobile */}
          <nav className="hidden md:flex items-center gap-6 flex-1">
            <NavLink 
              to="/" 
              className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-primary"
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </NavLink>
            <NavLink 
              to="/upload" 
              className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-primary"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </NavLink>
            <NavLink 
              to="/symptoms" 
              className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-primary"
            >
              <Stethoscope className="h-4 w-4 mr-2" />
              Assessment
            </NavLink>
            <NavLink 
              to="/facility-map" 
              className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-primary"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Find Care
            </NavLink>
            <NavLink 
              to="/history" 
              className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-primary"
            >
              <History className="h-4 w-4 mr-2" />
              History
            </NavLink>
          </nav>

          {/* Right side buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Mobile menu */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-6">
                  <NavLink 
                    to="/" 
                    className="flex items-center text-base font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                    activeClassName="text-primary"
                    onClick={() => setIsSheetOpen(false)}
                  >
                    <Home className="h-5 w-5 mr-3" />
                    Home
                  </NavLink>
                  <NavLink 
                    to="/upload" 
                    className="flex items-center text-base font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                    activeClassName="text-primary"
                    onClick={() => setIsSheetOpen(false)}
                  >
                    <Upload className="h-5 w-5 mr-3" />
                    Upload
                  </NavLink>
                  <NavLink 
                    to="/symptoms" 
                    className="flex items-center text-base font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                    activeClassName="text-primary"
                    onClick={() => setIsSheetOpen(false)}
                  >
                    <Stethoscope className="h-5 w-5 mr-3" />
                    Assessment
                  </NavLink>
                  <NavLink 
                    to="/facility-map" 
                    className="flex items-center text-base font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                    activeClassName="text-primary"
                    onClick={() => setIsSheetOpen(false)}
                  >
                    <MapPin className="h-5 w-5 mr-3" />
                    Find Care
                  </NavLink>
                  <NavLink 
                    to="/history" 
                    className="flex items-center text-base font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                    activeClassName="text-primary"
                    onClick={() => setIsSheetOpen(false)}
                  >
                    <History className="h-5 w-5 mr-3" />
                    History
                  </NavLink>
                  <Button
                    variant="default"
                    className="w-full justify-start gap-3 mt-2"
                    onClick={() => {
                      window.open('https://t.me/Haacckkorg_bot', '_blank');
                      setIsSheetOpen(false);
                    }}
                  >
                    <Send className="h-5 w-5" />
                    Chat on Telegram
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>

            <ThemeToggle />
            
            {/* Wallet Connection Button */}
            <WalletButton />
            
            {/* Telegram Button - Hidden on small screens */}
            <Button 
              variant="default"
              size="default"
              className="gap-2 hidden sm:flex"
              onClick={() => window.open('https://t.me/Haacckkorg_bot', '_blank')}
            >
              <Send className="h-4 w-4" />
              Chat on Telegram
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
