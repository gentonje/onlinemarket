import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface PaymentHandlerProps {
  orderId: string;
  paymentMethod: string;
}

export const PaymentHandler = ({ orderId, paymentMethod }: PaymentHandlerProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePayment = async () => {
    try {
      // Simulate payment processing for local methods only
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Payment Successful",
        description: `Your payment with ${paymentMethod} has been processed successfully.`,
      });
      
      // Navigate to success page or home
      navigate("/");
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return { handlePayment };
};