import { useState } from "react";
import { motion } from "framer-motion";
import { TradeType } from "@/app/types/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

type OrderFormProps = {
  onOrderCreated: () => void;
};

export default function OrderForm({ onOrderCreated }: OrderFormProps) {
  const [formData, setFormData] = useState({
    symbol: "",
    quantity: "",
    buyPrice: "",
    type: TradeType.LONG,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          quantity: parseFloat(formData.quantity),
          buyPrice: parseFloat(formData.buyPrice),
          tradeAmount: parseFloat(formData.quantity) * parseFloat(formData.buyPrice),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create order");
      }

      toast({
        title: "Order Created",
        description: "Your order has been created successfully.",
      });

      // Reset form
      setFormData({
        symbol: "",
        quantity: "",
        buyPrice: "",
        type: TradeType.LONG,
      });

      // Refresh orders list
      onOrderCreated();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create order",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-background/80 backdrop-blur-lg rounded-xl border p-6 shadow-sm"
    >
      <h3 className="text-lg font-semibold mb-4">Create New Order</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="symbol">Symbol</Label>
            <Input
              id="symbol"
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
              placeholder="e.g., BTC/USD"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: TradeType) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TradeType.LONG}>Long</SelectItem>
                <SelectItem value={TradeType.SHORT}>Short</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="Enter quantity"
              min="0.01"
              step="0.01"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buyPrice">Buy Price</Label>
            <Input
              id="buyPrice"
              type="number"
              value={formData.buyPrice}
              onChange={(e) => setFormData({ ...formData, buyPrice: e.target.value })}
              placeholder="Enter buy price"
              min="0.01"
              step="0.01"
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating Order..." : "Create Order"}
        </Button>
      </form>
    </motion.div>
  );
} 