
import { Link, useLocation } from "react-router-dom";
import { Heart, DollarSign, PlusCircle, ShoppingCart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { SupportedCurrency } from "@/utils/currencyConverter";

interface BottomNavProps {
  isAuthenticated: boolean;
  selectedCurrency?: SupportedCurrency;
  onCurrencyChange?: (currency: SupportedCurrency) => void;
}

export const BottomNav = ({ 
  isAuthenticated, 
  selectedCurrency = "SSP",
  onCurrencyChange
}: BottomNavProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();

  const isActive = (path: string) => location.pathname === path;

  // Don't render BottomNav on login page or if not authenticated
  if (!isAuthenticated || location.pathname === '/login') {
    return null;
  }

  // On mobile, show only wishlist and currency converter
  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 h-14 bg-background/80 backdrop-blur-lg border-t border-border">
        <div className="grid h-full max-w-lg grid-cols-2 mx-auto">
          <Link
            to="/wishlist"
            className={cn(
              "inline-flex flex-col items-center justify-center px-5 hover:bg-accent group transition-all duration-300",
              "before:absolute before:inset-0 before:rounded-lg before:bg-white/5 before:opacity-0 hover:before:opacity-100",
              "relative backdrop-blur-sm bg-white/10 hover:bg-white/20",
              isActive("/wishlist") && "text-orange-500 bg-white/20"
            )}
          >
            <Heart className="w-5 h-5 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
            <span className="text-xs">Wishlist</span>
          </Link>

          {onCurrencyChange && (
            <button
              onClick={() => {
                // Toggle between SSP and USD
                const newCurrency = selectedCurrency === "SSP" ? "USD" : "SSP";
                onCurrencyChange(newCurrency);
              }}
              className={cn(
                "inline-flex flex-col items-center justify-center px-5 hover:bg-accent group transition-all duration-300",
                "before:absolute before:inset-0 before:rounded-lg before:bg-white/5 before:opacity-0 hover:before:opacity-100",
                "relative backdrop-blur-sm bg-white/10 hover:bg-white/20"
              )}
            >
              <DollarSign className="w-5 h-5 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
              <span className="text-xs">{selectedCurrency}</span>
            </button>
          )}
        </div>
      </nav>
    );
  }

  // Desktop version with all navigation items
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-14 bg-background/80 backdrop-blur-lg border-t border-border">
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto">
        <Link
          to="/my-products"
          className={cn(
            "inline-flex flex-col items-center justify-center px-5 hover:bg-accent group transition-all duration-300",
            "before:absolute before:inset-0 before:rounded-lg before:bg-white/5 before:opacity-0 hover:before:opacity-100",
            "relative backdrop-blur-sm bg-white/10 hover:bg-white/20",
            isActive("/my-products") && "text-orange-500 bg-white/20"
          )}
        >
          <User className="w-5 h-5 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
          <span className="text-xs">My Items</span>
        </Link>

        <Link
          to="/add-product"
          className={cn(
            "inline-flex flex-col items-center justify-center px-5 hover:bg-accent group transition-all duration-300",
            "before:absolute before:inset-0 before:rounded-lg before:bg-white/5 before:opacity-0 hover:before:opacity-100",
            "relative backdrop-blur-sm bg-white/10 hover:bg-white/20",
            isActive("/add-product") && "text-orange-500 bg-white/20"
          )}
        >
          <PlusCircle className="w-5 h-5 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
          <span className="text-xs">Add</span>
        </Link>

        <Link
          to="/wishlist"
          className={cn(
            "inline-flex flex-col items-center justify-center px-5 hover:bg-accent group transition-all duration-300",
            "before:absolute before:inset-0 before:rounded-lg before:bg-white/5 before:opacity-0 hover:before:opacity-100",
            "relative backdrop-blur-sm bg-white/10 hover:bg-white/20",
            isActive("/wishlist") && "text-orange-500 bg-white/20"
          )}
        >
          <Heart className="w-5 h-5 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
          <span className="text-xs">Wishlist</span>
        </Link>

        <Link
          to="/cart"
          className={cn(
            "inline-flex flex-col items-center justify-center px-5 hover:bg-accent group transition-all duration-300",
            "before:absolute before:inset-0 before:rounded-lg before:bg-white/5 before:opacity-0 hover:before:opacity-100",
            "relative backdrop-blur-sm bg-white/10 hover:bg-white/20",
            isActive("/cart") && "text-orange-500 bg-white/20"
          )}
        >
          <ShoppingCart className="w-5 h-5 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
          <span className="text-xs">Cart</span>
        </Link>
      </div>
    </nav>
  );
};
