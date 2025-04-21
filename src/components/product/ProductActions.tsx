import { Button } from "../ui/button";
import { ShoppingCart } from "lucide-react";
import { SupportedCurrency } from "@/utils/currencyConverter";

interface ProductActionsProps {
  price: number;
  currency: string;
  selectedCurrency: SupportedCurrency;
  convertedPrice: number;
  inStock: boolean;
  onAddToCart: () => void;
  isAddingToCart: boolean;
}

export const ProductActions = ({
  price,
  currency,
  selectedCurrency,
  convertedPrice,
  inStock,
  onAddToCart,
  isAddingToCart
}: ProductActionsProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="flex-1 w-full">
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-orange-500">
            {selectedCurrency} {Math.round(convertedPrice).toLocaleString()}
          </p>
          {currency !== selectedCurrency && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ({currency} {price.toLocaleString()})
            </p>
          )}
        </div>
      </div>
      
      <Button 
        onClick={onAddToCart}
        disabled={!inStock || isAddingToCart}
        className="w-full sm:w-auto min-w-[200px] bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500"
      >
        <ShoppingCart className="w-5 h-5 mr-2" />
        {isAddingToCart ? 'Adding...' : inStock ? 'Add to Cart' : 'Out of Stock'}
      </Button>
    </div>
  );
};