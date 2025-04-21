import { Button } from "@/components/ui/button";
import { ArrowLeft, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProductInfoProps {
  title: string;
  category: string;
  averageRating: number;
  inStock: boolean;
  description: string;
  onBack: () => void;
}

export const ProductInfo = ({
  title,
  category,
  averageRating,
  inStock,
  description,
  onBack,
}: ProductInfoProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Badge variant={inStock ? "default" : "destructive"} className="rounded-full px-3">
          {inStock ? "In Stock" : "Out of Stock"}
        </Badge>
      </div>

      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          {title}
        </h1>
        
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="rounded-full text-sm font-medium">
            {category}
          </Badge>
          
          <div className="flex items-center">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  className={`${
                    star <= averageRating 
                      ? 'text-yellow-400 fill-yellow-400' 
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              {averageRating.toFixed(1)}
            </span>
          </div>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};