import React, { useState, useCallback, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { SupportedCurrency } from "@/utils/currencyConverter";
import ProductDetail from "@/components/ProductDetail";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductListingSection } from "@/components/products/ProductListingSection";
import { useProducts } from "@/hooks/useProducts";
import { Navigation } from "@/components/Navigation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function MyProducts() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrency>("SSP");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sortOrder, setSortOrder] = useState<string>("none");

  // Fetch only the current user's products
  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    prefetchNextPage,
  } = useProducts({
    searchQuery,
    selectedCategory,
    sortOrder,
    showOnlyPublished: false, // Show all user's products regardless of status
    userOnly: true // Only show current user's products
  });

  // Setup intersection observer for infinite loading
  const { ref, inView } = useInView({
    threshold: 0.1,
    rootMargin: "200px",
  });

  // Handle intersection to load more products
  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Prefetch next page when idle
  React.useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) {
      const idleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));
      const handle = idleCallback(() => {
        prefetchNextPage();
      });
      
      return () => {
        if (window.cancelIdleCallback) {
          window.cancelIdleCallback(handle);
        } else {
          clearTimeout(handle);
        }
      };
    }
  }, [hasNextPage, isFetchingNextPage, prefetchNextPage]);

  // Flatten product pages
  const allProducts = useMemo(() => data?.pages.flat() || [], [data?.pages]);

  // Get image URL with memoization
  const getProductImageUrl = useCallback((product: Product) => {
    if (!product.product_images?.length) return "/placeholder.svg";
    
    const mainImage = product.product_images.find(img => img.is_main) || product.product_images[0];
    if (!mainImage) return "/placeholder.svg";

    return supabase.storage
      .from("images")
      .getPublicUrl(mainImage.storage_path).data.publicUrl;
  }, []);

  // Event handlers
  const handleProductClick = useCallback((product: Product) => {
    setSelectedProduct(product);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  const handleSortChange = useCallback((sort: string) => {
    setSortOrder(sort);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const handlePriceRangeChange = useCallback((min: number, max: number) => {
    console.log('Price range changed:', { min, max });
    // Implementation for price range filtering would go here
  }, []);

  // Delete product handler
  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) throw error;
        toast.success("Product deleted successfully");
      
      // The UI will update automatically through React Query cache invalidation
      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error("Failed to delete product");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 mt-20">
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navigation searchQuery={searchQuery} onSearchChange={handleSearchChange} />
      <div className="container mx-auto px-4 pt-20 pb-20">
        <BreadcrumbNav
          items={[
            { label: "My Products", href: "/my-products" }
          ]}
        />
        {selectedProduct ? (
          <ProductDetail 
            product={selectedProduct}
            getProductImageUrl={getProductImageUrl}
            onBack={handleBack}
            selectedCurrency={selectedCurrency}
          />
        ) : (
          <ProductListingSection
            products={allProducts}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={handleCategoryChange}
            onProductClick={handleProductClick}
            isFetchingNextPage={isFetchingNextPage}
            observerRef={ref}
            selectedCurrency={selectedCurrency}
            onPriceRangeChange={handlePriceRangeChange}
            onSortChange={handleSortChange}
            getProductImageUrl={getProductImageUrl}
            emptyMessage="You don't have any products yet"
            showStatus={true}
            onDelete={handleDeleteProduct}
            isAdmin={true}
          />
        )}
      </div>
    </>
  );
}
