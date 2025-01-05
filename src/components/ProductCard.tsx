import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { convertCurrency, SupportedCurrency } from "@/utils/currencyConverter";
import { Product } from "@/types/product";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ImageLoader } from "./ImageLoader";

interface ProductCardProps {
  product: Product;
  getProductImageUrl: (product: Product) => string;
  onClick?: () => void;
  selectedCurrency: SupportedCurrency;
}

const ProductCard = ({ product, getProductImageUrl, onClick, selectedCurrency }: ProductCardProps) => {
  const { data: owner } = useQuery({
    queryKey: ['profile', product.user_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, full_name')
        .eq('id', product.user_id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data;
    },
    enabled: !!product.user_id
  });

  const convertedPrice = convertCurrency(
    product.price || 0,
    (product.currency || "SSP") as SupportedCurrency,
    selectedCurrency
  );

  const getImageUrl = () => {
    const mainImage = product.product_images?.find(img => img.is_main === true);
    if (mainImage?.storage_path) {
      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(mainImage.storage_path);
      return data.publicUrl;
    }
    return "/placeholder.svg";
  };

  const imageUrl = getImageUrl();

  return (
    <Card 
      className="w-full h-[323px] hover:shadow-lg transition-all duration-300 cursor-pointer group bg-white/50 backdrop-blur-sm border-neutral-200/80"
      onClick={onClick}
    >
      <CardContent className="px-0 space-y-2 relative">
        <div 
          className="h-52 w-full relative overflow-hidden rounded-t-lg"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          <ImageLoader
            src={imageUrl}
            alt={product.title || ""}
            className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
            width={400}
            height={208}
            priority={false}
          />
          <span className="absolute top-3 right-3 text-sm px-2 py-1 rounded-full bg-white/80 backdrop-blur-sm text-orange-500 font-medium whitespace-nowrap z-50 border border-neutral-100/50">
            {selectedCurrency} {convertedPrice.toFixed(2)}
          </span>
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs px-2 py-1 rounded-full bg-white/80 backdrop-blur-sm text-gray-800 font-medium min-w-[100px] text-center truncate max-w-[90%] border border-neutral-100/50">
            {product.category}
          </span>
        </div>
        <div className="px-4 pt-1">
          <CardTitle className="text-sm font-medium truncate text-gray-800 min-w-[100px] text-center max-w-[90%] mx-auto">
            {product.title}
          </CardTitle>
        </div>
        <div className="h-[42px] overflow-hidden">
          <p className="text-xs text-gray-600 line-clamp-2 px-4">{product.description}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center pt-0 -mt-4">
        <span 
          className={`text-xs px-3 py-1.5 rounded-full font-medium 
            ${product.in_stock 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
            } transition-colors`}
        >
          {product.in_stock ? 'In Stock' : 'Out of Stock'}
        </span>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;