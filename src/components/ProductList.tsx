
import React, { useCallback, memo } from "react";
import { Product } from "@/types/product";
import ProductCard from "./ProductCard";
import { SupportedCurrency } from "@/utils/currencyConverter";
import { useInView } from "react-intersection-observer";
import { Skeleton } from "./ui/skeleton";

interface ProductListProps {
  products: Product[];
  getProductImageUrl: (product: Product) => string;
  onProductClick: (product: Product) => void;
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  observerRef?: (node?: Element | null) => void;
  selectedCurrency: SupportedCurrency;
  showStatus?: boolean;
  onDelete?: (productId: string) => Promise<void>;
  isAdmin?: boolean;
  emptyMessage?: string;
}

const ProductSkeleton = memo(() => (
  <div className="space-y-3 rounded-xl overflow-hidden bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-4">
    <Skeleton className="h-[200px] w-full rounded-lg" />
    <Skeleton className="h-6 w-2/3" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <div className="flex justify-between mt-4">
      <Skeleton className="h-8 w-20 rounded-full" />
      <Skeleton className="h-8 w-20 rounded-full" />
    </div>
  </div>
));

ProductSkeleton.displayName = 'ProductSkeleton';

export const ProductList = ({
  products,
  getProductImageUrl,
  onProductClick,
  isLoading,
  isFetchingNextPage,
  observerRef,
  selectedCurrency,
  showStatus = false,
  onDelete,
  isAdmin,
  emptyMessage = "No products found"
}: ProductListProps) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Create a memoized callback for the intersection observer
  const setLastElementRef = useCallback((node: Element | null) => {
    ref(node);
    if (inView && observerRef) {
      observerRef(node);
    }
  }, [ref, inView, observerRef]);

  // Render loading skeletons
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Render empty state
  if (products.length === 0) {
    return (
      <div className="text-center py-16 rounded-xl mt-8 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 shadow-inner">
        <div className="max-w-md mx-auto px-4">
          <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300">{emptyMessage}</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your search or filters to find what you're looking for</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
      {products.map((product, index) => (
        <div
          key={product.id}
          ref={index === products.length - 1 ? setLastElementRef : undefined}
          className="transform transition-transform hover:-translate-y-1 duration-300"
        >
          <ProductCard
            product={product}
            getProductImageUrl={getProductImageUrl}
            onClick={() => onProductClick(product)}
            selectedCurrency={selectedCurrency}
            showStatus={showStatus}
            onDelete={onDelete}
            isAdmin={isAdmin}
          />
        </div>
      ))}
      
      {isFetchingNextPage && (
        <>
          <ProductSkeleton />
          <ProductSkeleton />
          <ProductSkeleton />
        </>
      )}
    </div>
  );
};

// Optimize with memoization
export default memo(ProductList);
