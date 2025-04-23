import { useState, useEffect, memo, useCallback } from "react";
import { Skeleton } from "./ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface ImageLoaderProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve();
    img.onerror = (e) => reject(new Error(`Failed to preload image: ${src}`));
  });
};

export const ImageLoader = memo(({
  src,
  alt,
  className = "",
  width,
  height,
  priority = false,
}: ImageLoaderProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const { toast } = useToast();

  const loadImage = useCallback(async () => {
    if (!src) return;
    
    try {
      // Check if image is in cache
      const cache = await caches.open('image-cache');
      const cachedResponse = await cache.match(src);
      
      if (!cachedResponse) {
        // If not in cache, preload and cache it
        await preloadImage(src);
        const response = await fetch(src);
        const clonedResponse = response.clone();
        await cache.put(src, clonedResponse);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading image:', err);
      setError(true);
      setIsLoading(false);
      toast({
        title: "Error loading image",
        description: "Failed to load image. Please try again later.",
        variant: "destructive",
      });
    }
  }, [src, toast]);

  useEffect(() => {
    setIsLoading(true);
    setError(false);
    loadImage();
  }, [loadImage]);

  if (error) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-md" style={{ width, height }}>
        <span className="text-sm text-gray-500">Failed to load image</span>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <Skeleton 
          className={`${className} animate-none`}
          style={{ width, height }}
        />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'hidden' : 'block'}`}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchpriority={priority ? "high" : "auto"}
        onLoad={() => setIsLoading(false)}
      />
    </>
  );
});

ImageLoader.displayName = 'ImageLoader';
