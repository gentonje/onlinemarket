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

export default function Index() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrency>("SSP");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sortOrder, setSortOrder] = useState<string>("none");

  // Fetch products with optimized query - show all products, not just user's
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
    showOnlyPublished: true,
    userOnly: false // Show all products, not just the user's
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
    if (!mainImage || !mainImage.storage_path) return "/placeholder.svg";
    const publicUrl = supabase.storage
      .from("images")
      .getPublicUrl(mainImage.storage_path).data.publicUrl;
    return publicUrl || "/placeholder.svg";
  }, []);

  // Event handlers
  const handleProductClick = useCallback((product: Product) => {
    setSelectedProduct(product);
    // Track view
    trackProductView(product.id).catch(console.error);
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

  // Track product views
  const trackProductView = async (productId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('product_views').insert({
        product_id: productId,
        viewer_id: user?.id || null,
      });
    } catch (error) {
      console.error('Error tracking product view:', error);
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
            { label: "All Products", href: "/products" }
          ]}
        />
        {selectedProduct ? (
          <ProductDetail 
            product={{
              ...selectedProduct,
              product_images: (selectedProduct.product_images || []).map(img => ({
                ...img,
                publicUrl: supabase.storage.from("images").getPublicUrl(img.storage_path).data.publicUrl || "/placeholder.svg"
              }))
            }}
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
            emptyMessage="No products found"
            showStatus={false}
          />
        )}
      </div>
    </>
  );
}
