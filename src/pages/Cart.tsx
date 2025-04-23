import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { useCartMutations } from "@/hooks/useCartMutations";
import { useOrderCreation } from "@/components/cart/OrderCreation";
import { PaymentHandler } from "@/components/cart/PaymentHandler";

export default function Cart() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("paypal"); // Default to PayPal or another local method
  const [shippingAddress, setShippingAddress] = useState<string>("");
  const { deleteItemMutation } = useCartMutations();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    },
  });

  const { data: userProfile } = useQuery({
    queryKey: ["userProfile", session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("address")
        .eq("id", session?.user?.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  // Set shipping address from profile when available
  useEffect(() => {
    if (userProfile?.address) {
      setShippingAddress(userProfile.address);
    }
  }, [userProfile]);

  const { data: cartItems, isLoading } = useQuery({
    queryKey: ["cartItems"],
    queryFn: async () => {
      const { data: items, error } = await supabase
        .from("cart_items")
        .select(`
          *,
          product:products (
            title,
            price,
            currency,
            user_id
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return items;
    },
  });

  const orderCreation = useOrderCreation({
    cartItems,
    shippingAddress,
    userId: session?.user?.id || "",
    paymentMethod: selectedPaymentMethod,
  });

  const handleCheckout = async () => {
    if (!cartItems?.length) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checking out",
        variant: "destructive",
      });
      return;
    }

    if (!shippingAddress) {
      toast({
        title: "Shipping address required",
        description: "Please add a shipping address to your profile",
        variant: "destructive",
      });
      return;
    }

    try {
      const order = await orderCreation.mutateAsync();
      const { handlePayment } = PaymentHandler({ 
        orderId: order.id, 
        paymentMethod: selectedPaymentMethod 
      });
      await handlePayment();
    } catch (error) {
      // Error is already handled by the mutation
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Shopping Cart</h1>
        </div>
        
        {!cartItems?.length ? (
          <Card className="p-6">
            <p className="text-center text-foreground font-medium">Your cart is empty</p>
            <Button
              className="mt-4 mx-auto block w-full sm:w-auto px-4 py-2 flex items-center justify-center"
              onClick={() => navigate("/")}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Cart Items</h2>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <CartItem
                    key={item.id}
                    id={item.id}
                    title={item.product.title}
                    quantity={item.quantity}
                    price={item.product.price}
                    currency={item.product.currency}
                    onDelete={() => deleteItemMutation.mutate(item.id)}
                  />
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Checkout</h2>
              <CartSummary
                currency={cartItems[0]?.product.currency || "USD"}
                totalAmount={cartItems.reduce(
                  (sum, item) => sum + item.product.price * item.quantity,
                  0
                )}
                selectedPaymentMethod={selectedPaymentMethod}
                onPaymentMethodChange={setSelectedPaymentMethod}
                onCheckout={handleCheckout}
                isLoading={orderCreation.isPending}
              />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
