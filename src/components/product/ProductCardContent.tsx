import { Product } from "@/types/product";
import { CardContent, CardFooter, CardTitle } from "../ui/card";

interface ProductCardContentProps {
  product: Product;
}

export const ProductCardContent = ({ product }: ProductCardContentProps) => {
  return (
    <>
      <CardContent className="px-0 space-y-2 relative">
        <div className="px-4 pt-1">
          <CardTitle className="text-sm font-medium truncate text-gray-800 dark:text-gray-100 min-w-[100px] text-center max-w-[90%] mx-auto">
            {product.title}
          </CardTitle>
        </div>
        <div className="h-[42px] overflow-hidden">
          <p className="text-xs text-gray-500 dark:text-gray-300 line-clamp-2 px-4">{product.description}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <span 
          className={`text-xs px-3 py-1.5 rounded-full font-medium 
            ${product.in_stock 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
            } transition-colors`}
        >
          {product.in_stock ? 'In Stock' : 'Out of Stock'}
        </span>
      </CardFooter>
    </>
  );
};