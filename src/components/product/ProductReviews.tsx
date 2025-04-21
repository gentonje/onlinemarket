import { useState } from "react";
import { Star, Send } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Card } from "../ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ReactNode } from "react";

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_id: string;
  product_id: string;
  profiles: {
    username?: string;
    full_name?: string;
  };
  review_replies?: Array<{
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    profiles: {
      username?: string;
      full_name?: string;
    };
  }>;
}

interface ProductReviewsProps {
  productId: string;
  sellerId: string;
}

export const ProductReviews = ({ productId, sellerId }: ProductReviewsProps) => {
  const queryClient = useQueryClient();
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [replyText, setReplyText] = useState("");

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    }
  });

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles (username, full_name),
          review_replies (
            id,
            content,
            created_at,
            user_id,
            profiles (username, full_name)
          )
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const isSeller = session?.user?.id === sellerId;

  const addReviewMutation = useMutation({
    mutationFn: async (reviewData: { productId: string; rating: number; comment: string }) => {
      const { error } = await supabase
        .from('reviews')
        .insert({
          product_id: reviewData.productId,
          rating: reviewData.rating,
          comment: reviewData.comment,
          user_id: session?.user?.id
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
    }
  });

  const addReplyMutation = useMutation({
    mutationFn: async ({ reviewId, content }: { reviewId: string; content: string }) => {
      const { error } = await supabase
        .from('review_replies')
        .insert({
          review_id: reviewId,
          content,
          user_id: session?.user?.id
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      setReplyText('');
    }
  });

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !comment.trim()) return;

    try {
      await addReviewMutation.mutateAsync({
        productId,
        rating,
        comment: comment.trim()
      });
      setIsAddingReview(false);
      setRating(0);
      setComment("");
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const handleSubmitReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    
    try {
      await addReplyMutation.mutateAsync({
        reviewId,
        content: replyText.trim()
      });
    } catch (error) {
      console.error("Error submitting reply:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Reviews</h2>
        {session && (
          <Button
            onClick={() => setIsAddingReview(true)}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
          >
            Write a Review
          </Button>
        )}
      </div>

      {isAddingReview && (
        <Card className="p-6 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50">
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <Label htmlFor="rating">Rating</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className={`p-1 rounded-full transition-colors ${
                      rating >= value 
                        ? 'text-yellow-400 hover:text-yellow-500' 
                        : 'text-gray-300 hover:text-gray-400'
                    }`}
                  >
                    <Star className={`w-6 h-6 ${rating >= value ? 'fill-current' : ''}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="comment">Your Review</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mt-2"
                placeholder="Share your thoughts about this product..."
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddingReview(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!rating || !comment.trim() || addReviewMutation.isPending}
              >
                {addReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-6">
        {reviews.map((review) => (
          <Card 
            key={review.id}
            className="p-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={`${
                          star <= review.rating 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {(review.profiles?.username || review.profiles?.full_name || 'Anonymous') as ReactNode}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">{review.comment}</p>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(review.created_at).toLocaleDateString()}
              </span>
            </div>

            {review.review_replies?.map((reply) => (
              <div key={reply.id} className="mt-4 pl-6 border-l-2 border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-300">
                    Seller Response
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(reply.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {reply.content}
                </p>
              </div>
            ))}

            {isSeller && !review.review_replies?.length && (
              <div className="mt-4">
                <div className="flex gap-2">
                  <Input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Reply to this review..."
                    className="flex-1"
                  />
                  <Button
                    onClick={() => handleSubmitReply(review.id)}
                    disabled={addReplyMutation.isPending}
                    size="sm"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}

        {!reviews.length && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No reviews yet. Be the first to review this product!</p>
          </div>
        )}
      </div>
    </div>
  );
};