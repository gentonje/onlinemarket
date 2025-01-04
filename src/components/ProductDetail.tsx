import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { useState } from "react";
import { ProductHeader } from "./product/ProductHeader";
import { ProductGallery } from "./product/ProductGallery";
import { ProductReviews } from "./product/ProductReviews";
import { Product } from "@/types/product";

interface ProductDetailProps {
  product: Product;
  getProductImageUrl: (product: Product) => string;
  onBack: () => void;
}

const ProductDetail = ({ product, onBack, getProductImageUrl }: ProductDetailProps) => {
  const [selectedImage, setSelectedImage] = useState<string>(
    product.product_images?.find(img => !img.is_main)?.storage_path || product.product_images?.[0]?.storage_path || ''
  );

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="space-y-4">
        <ProductHeader
          title={product.title || ''}
          category={product.category || 'Other'}
          averageRating={product.average_rating || 0}
          onBack={onBack}
        />

        <div className="flex items-center justify-between">
          <span className={`text-sm px-2 py-1 rounded-full ${
            product.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {product.in_stock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        <div className="space-y-4">
          <div className="aspect-[16/9] relative rounded-lg overflow-hidden">
            <img
              src={supabase.storage.from('images').getPublicUrl(selectedImage).data.publicUrl}
              alt={product.title || ''}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            {(product.product_images || []).map((image, index) => (
              <div
                key={index}
                className={`w-20 h-20 rounded-md overflow-hidden cursor-pointer ${
                  selectedImage === image.storage_path ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedImage(image.storage_path)}
              >
                <img
                  src={supabase.storage.from('images').getPublicUrl(image.storage_path).data.publicUrl}
                  alt={`${product.title || ''} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
        
        <div className="rounded-md border p-4">
          <p className="text-sm text-muted-foreground">{product.description}</p>
        </div>

        <ProductReviews productId={product.id} sellerId={product.seller_id || ''} />
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        <p className="text-2xl font-bold text-vivo-orange">
          {product.currency} {product.price?.toFixed(2)}
        </p>
        <Button>Add to Cart</Button>
      </CardFooter>
    </Card>
  );
};

export default ProductDetail;