import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface CartSummaryProps {
  currency: string;
  totalAmount: number;
  selectedPaymentMethod: string;
  onPaymentMethodChange: (value: string) => void;
  onCheckout: () => void;
  isLoading: boolean;
}

export const CartSummary = ({
  currency,
  totalAmount,
  selectedPaymentMethod,
  onPaymentMethodChange,
  onCheckout,
  isLoading,
}: CartSummaryProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Payment Method
        </label>
        <Select
          value={selectedPaymentMethod}
          onValueChange={onPaymentMethodChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="paypal">PayPal</SelectItem>
            <SelectItem value="mpesa">M-Pesa</SelectItem>
            <SelectItem value="mtn_momo">MTN Mobile Money</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="pt-4 border-t">
        <p className="flex justify-between mb-2">
          <span>Total</span>
          <span className="font-bold">
            {currency} {totalAmount}
          </span>
        </p>
        <Button
          className="w-full"
          onClick={onCheckout}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Proceed to Checkout"
          )}
        </Button>
      </div>
    </div>
  );
};