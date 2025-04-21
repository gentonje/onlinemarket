import { Card, CardContent, CardFooter } from "./ui/card";
import { Suspense, useState, useEffect } from "react";
import { ProductGallery } from "./product/ProductGallery";
import { ProductReviews } from "./product/ProductReviews";
import { ProductInfo } from "./product/ProductInfo";
import { ProductActions } from "./product/ProductActions";
import { ProductSimilar } from "./product/ProductSimilar";
import { Product } from "@/types/product";
import { Skeleton } from "./ui/skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SupportedCurrency, convertCurrency } from "@/utils/currencyConverter";

interface ProductDetailProps {
  product: Product;
  getProductImageUrl: (product: Product) => string;
  onBack: () => void;
  selectedCurrency?: SupportedCurrency;
}

const ProductDetail = ({ 
  product, 
  onBack, 
  getProductImageUrl,
  selectedCurrency = "SSP" 
}: ProductDetailProps) => {
  const [selectedImage, setSelectedImage] = useState<string>(
    product.product_images?.find(img => img.is_main)?.storage_path || 
    product.product_images?.[0]?.storage_path || 
    ''
  );
  const [convertedPrice, setConvertedPrice] = useState<number>(product.price || 0);
  const queryClient = useQueryClient();

  useEffect(() => {
    const updatePrice = async () => {
      const converted = await convertCurrency(
        product.price || 0,
        (product.currency || "SSP") as SupportedCurrency,
        selectedCurrency
      );
      setConvertedPrice(converted);
    };
    updatePrice();
  }, [product.price, product.currency, selectedCurrency]);

  const { data: similarProducts } = useQuery({
    queryKey: ['similar-products', product.id, product.category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_images(*)')
        .eq('category', product.category)
        .neq('id', product.id)
        .limit(4);
      
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!product.category,
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to add items to cart');

      const { error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id: product.id,
          quantity: 1,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
      toast.success('Added to cart successfully');
    },
    onError: (error) => {
      console.error('Error adding to cart:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to add to cart');
      }
    },
  });

  const handleAddToCart = () => {
    if (!product.in_stock) {
      toast.error('This product is out of stock');
      return;
    }
    addToCartMutation.mutate();
  };

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      <Card className="overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Image Gallery */}
            <div className="p-6 lg:border-r border-gray-200/50 dark:border-gray-700/50">
              <Suspense fallback={<Skeleton className="aspect-square w-full rounded-xl" />}>
                <ProductGallery
                  images={product.product_images || []}
                  selectedImage={selectedImage}
                  onImageSelect={setSelectedImage}
                  title={product.title || ''}
                />
              </Suspense>
            </div>

            {/* Right Column - Product Info */}
            <div className="p-6 flex flex-col h-full">
              <ProductInfo
                title={product.title || ''}
                category={product.category || 'Other'}
                averageRating={product.average_rating || 0}
                inStock={product.in_stock || false}
                description={product.description || ''}
                onBack={onBack}
              />

              <div className="mt-auto pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                <ProductActions
                  price={product.price || 0}
                  currency={product.currency || "SSP"}
                  selectedCurrency={selectedCurrency}
                  convertedPrice={convertedPrice}
                  inStock={product.in_stock || false}
                  onAddToCart={handleAddToCart}
                  isAddingToCart={addToCartMutation.isPending}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Section */}
      <Card className="overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50">
        <CardContent className="p-6">
          <Suspense fallback={<Skeleton className="h-48 w-full" />}>
            <ProductReviews 
              productId={product.id} 
              sellerId={product.seller_id || ''} 
            />
          </Suspense>
        </CardContent>
      </Card>

      {/* Similar Products Section */}
      {similarProducts && (
        <Card className="overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50">
          <CardContent className="p-6">
            <ProductSimilar
              products={similarProducts}
              getProductImageUrl={getProductImageUrl}
              onProductClick={(similarProduct) => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                onBack();
                setTimeout(() => onBack(), 100);
              }}
              selectedCurrency={selectedCurrency}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductDetail;
