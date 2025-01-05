import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

interface WishlistButtonProps {
  productId: string;
  className?: string;
}

export const WishlistButton = ({ productId, className }: WishlistButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: wishlist } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data: wishlist, error } = await supabase
          .from("wishlists")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching wishlist:", error);
          return null;
        }
        return wishlist;
      } catch (error) {
        console.error("Error fetching wishlist:", error);
        return null;
      }
    }
  });

  const { data: isInWishlist } = useQuery({
    queryKey: ["wishlist", wishlist?.id, productId],
    queryFn: async () => {
      try {
        if (!wishlist) return false;

        const { data, error } = await supabase
          .from("wishlist_items")
          .select("id")
          .eq("wishlist_id", wishlist.id)
          .eq("product_id", productId)
          .maybeSingle();

        if (error) {
          console.error("Error checking wishlist item:", error);
          return false;
        }
        return !!data;
      } catch (error) {
        console.error("Error checking wishlist item:", error);
        return false;
      }
    },
    enabled: !!wishlist
  });

  const createWishlistMutation = useMutation({
    mutationFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data: wishlist, error } = await supabase
          .from("wishlists")
          .insert({ user_id: user.id })
          .select()
          .single();

        if (error) throw error;
        return wishlist;
      } catch (error) {
        console.error("Error creating wishlist:", error);
        throw error;
      }
    }
  });

  const toggleWishlistMutation = useMutation({
    mutationFn: async () => {
      try {
        if (!wishlist) {
          const newWishlist = await createWishlistMutation.mutateAsync();
          const { error } = await supabase
            .from("wishlist_items")
            .insert({
              wishlist_id: newWishlist.id,
              product_id: productId
            });
          if (error) throw error;
        } else {
          if (isInWishlist) {
            const { error } = await supabase
              .from("wishlist_items")
              .delete()
              .eq("wishlist_id", wishlist.id)
              .eq("product_id", productId);
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from("wishlist_items")
              .insert({
                wishlist_id: wishlist.id,
                product_id: productId
              });
            if (error) throw error;
          }
        }
      } catch (error) {
        console.error("Wishlist error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success(isInWishlist ? "Removed from wishlist" : "Added to wishlist");
    },
    onError: (error) => {
      console.error("Wishlist error:", error);
      toast.error("Failed to update wishlist");
    }
  });

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    try {
      await toggleWishlistMutation.mutateAsync();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`${className} bg-white/80 backdrop-blur-sm hover:bg-white/90 ${
        isInWishlist ? "text-red-500" : "text-gray-500"
      }`}
      onClick={handleClick}
      disabled={isLoading}
    >
      <Heart className={`h-4 w-4 ${isInWishlist ? "fill-current" : ""}`} />
    </Button>
  );
};