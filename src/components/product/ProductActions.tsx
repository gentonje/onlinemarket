import { Button } from "../ui/button";
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
    <div className="flex justify-between items-center">
      <p className="text-2xl font-bold text-gray-900">
        {selectedCurrency} {convertedPrice.toFixed(2)}
      </p>
      <Button 
        onClick={onAddToCart}
        disabled={!inStock || isAddingToCart}
      >
        {isAddingToCart ? 'Adding...' : 'Add to Cart'}
      </Button>
    </div>
  );
};