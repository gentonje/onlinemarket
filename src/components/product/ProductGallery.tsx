import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "../ui/skeleton";
import { useState, useEffect } from "react";
import { ImageLoader } from "../ImageLoader";

interface ProductGalleryProps {
  images: { storage_path: string; is_main: boolean }[];
  selectedImage: string;
  onImageSelect: (path: string) => void;
  title: string;
}

export const ProductGallery = ({
  images,
  selectedImage,
  onImageSelect,
  title
}: ProductGalleryProps) => {
  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-square w-full rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50">
        <ImageLoader
          src={selectedImage}
          alt={title}
          className="w-full h-full object-contain"
          width={600}
          height={600}
          priority={true}
        />
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-5 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className={`
              relative aspect-square rounded-lg overflow-hidden cursor-pointer
              border-2 transition-all duration-300
              ${selectedImage === image.storage_path
                ? 'border-orange-500 ring-2 ring-orange-500/20'
                : 'border-transparent hover:border-orange-500/50'}
            `}
            onClick={() => onImageSelect(image.storage_path)}
          >
            <ImageLoader
              src={image.storage_path}
              alt={`${title} ${index + 1}`}
              className="w-full h-full object-cover"
              width={100}
              height={100}
              priority={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
};