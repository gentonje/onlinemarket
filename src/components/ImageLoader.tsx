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
    img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
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
    if (!src) {
      setError(true);
      setIsLoading(false);
      return;
    }
    
    try {
      // Check if image is in cache
      const cache = await caches.open('image-cache');
      const cachedResponse = await cache.match(src);
      
      if (!cachedResponse) {
        // If not in cache, preload and cache it
        await preloadImage(src);
        const response = await fetch(src);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        const clonedResponse = response.clone();
        await cache.put(src, clonedResponse);
      }
      
      // Don't set loading to false here, let the img onLoad handler do it
    } catch (err) {
      console.error('Error loading image:', err);
      setError(true);
      setIsLoading(false);
      toast({
        title: "Error loading image",
        description: err instanceof Error ? err.message : "Failed to load image",
        variant: "destructive",
      });
    }
  }, [src, toast]);

  useEffect(() => {
    let mounted = true;

    setIsLoading(true);
    setError(false);
    
    loadImage().catch(() => {
      if (mounted) {
        setError(true);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [src, loadImage]);

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md ${className}`}
        style={{ width, height }}
      >
        <span className="text-sm text-gray-500 dark:text-gray-400">Failed to load image</span>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className={`${className} animate-none`} style={{ width, height }}>
          <Skeleton className="w-full h-full" />
        </div>
      )}
      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        className={`${className} ${isLoading ? 'hidden' : 'block'}`}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setError(true);
          setIsLoading(false);
        }}
      />
    </>
  );
});

ImageLoader.displayName = 'ImageLoader';
