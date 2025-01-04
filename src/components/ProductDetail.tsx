import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { useState, Suspense } from "react";
import { ProductHeader } from "./product/ProductHeader";
import { ProductGallery } from "./product/ProductGallery";
import { ProductReviews } from "./product/ProductReviews";
import { Product } from "@/types/product";
import { Skeleton } from "./ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProductDetailProps {
  product: Product;
  getProductImageUrl: (product: Product) => string;
  onBack: () => void;
}

const ProductDetail = ({ product, onBack, getProductImageUrl }: ProductDetailProps) => {
  const [selectedImage, setSelectedImage] = useState<string>(
    product.product_images?.find(img => !img.is_main)?.storage_path || product.product_images?.[0]?.storage_path || ''
  );

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

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="space-y-6">
          <Suspense fallback={<Skeleton className="h-8 w-3/4" />}>
            <ProductHeader
              title={product.title || ''}
              category={product.category || 'Other'}
              averageRating={product.average_rating || 0}
              onBack={onBack}
            />
          </Suspense>

          <Suspense fallback={<Skeleton className="h-6 w-24" />}>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                product.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {product.in_stock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
          </Suspense>

          <Suspense fallback={<Skeleton className="aspect-[4/3] w-full rounded-lg" />}>
            <ProductGallery
              images={product.product_images || []}
              selectedImage={selectedImage}
              onImageSelect={setSelectedImage}
              title={product.title || ''}
            />
          </Suspense>
          
          <Suspense fallback={<Skeleton className="h-24 w-full" />}>
            <div className="rounded-md border p-4">
              <p className="text-sm text-gray-800">{product.description}</p>
            </div>
          </Suspense>

          <Suspense fallback={<Skeleton className="h-48 w-full" />}>
            <ProductReviews productId={product.id} sellerId={product.seller_id || ''} />
          </Suspense>
        </CardContent>

        <CardFooter className="flex justify-between items-center">
          <p className="text-2xl font-bold text-gray-900">
            {product.currency} {product.price?.toFixed(2)}
          </p>
          <Button>Add to Cart</Button>
        </CardFooter>
      </Card>

      {similarProducts && similarProducts.length > 0 && (
        <div className="w-full max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Similar Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {similarProducts.map((similarProduct) => (
              <Card 
                key={similarProduct.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  // Update the current product
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  onBack();
                  setTimeout(() => {
                    // Small delay to ensure smooth transition
                    onBack();
                  }, 100);
                }}
              >
                <CardContent className="p-2">
                  <div className="aspect-square w-full relative mb-2">
                    <img
                      src={getProductImageUrl(similarProduct)}
                      alt={similarProduct.title || ""}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {similarProduct.title}
                  </h3>
                  <p className="text-sm font-medium text-gray-900">
                    {similarProduct.currency} {similarProduct.price?.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;