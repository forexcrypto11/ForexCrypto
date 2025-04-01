"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth-context";
import { TradeType } from "@/app/types/orders";
import { DollarSign } from "lucide-react";

export default function OrderRequestPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    symbol: "",
    quantity: 1,
    buyPrice: 0,
    type: TradeType.LONG,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === "quantity" || name === "buyPrice" 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const calculateTradeAmount = (): number => {
    return formData.quantity * formData.buyPrice;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/orders/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symbol: formData.symbol,
          quantity: formData.quantity,
          buyPrice: formData.buyPrice,
          tradeAmount: calculateTradeAmount(),
          type: formData.type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit order request");
      }

      setSuccess(true);
      setFormData({
        symbol: "",
        quantity: 1,
        buyPrice: 0,
        type: TradeType.LONG,
      });

      setTimeout(() => {
        router.push("/dashboard/orders-history");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-muted-foreground">
          Please log in to submit an order request
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-primary mb-6">New Order Request</h1>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-background/80 backdrop-blur-lg rounded-xl border p-4 md:p-6 shadow-sm"
      >
        {success ? (
          <div className="p-4 bg-green-500/10 text-green-500 rounded-lg mb-6">
            Your order request has been submitted successfully and is pending approval.
          </div>
        ) : error ? (
          <div className="p-4 bg-red-500/10 text-red-500 rounded-lg mb-6">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="symbol" className="block text-sm font-medium mb-1">
                Symbol
              </label>
              <input
                id="symbol"
                name="symbol"
                type="text"
                required
                placeholder="BTC/INR"
                value={formData.symbol}
                onChange={handleChange}
                className="w-full p-2 rounded-md border border-gray-300 bg-background"
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium mb-1">
                Trade Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-2 rounded-md border border-gray-300 bg-background"
              >
                <option value={TradeType.LONG}>Long</option>
                <option value={TradeType.SHORT}>Short</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium mb-1">
                  Quantity
                </label>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full p-2 rounded-md border border-gray-300 bg-background"
                />
              </div>

              <div>
                <label htmlFor="buyPrice" className="block text-sm font-medium mb-1">
                  Buy Price (INR)
                </label>
                <input
                  id="buyPrice"
                  name="buyPrice"
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={formData.buyPrice}
                  onChange={handleChange}
                  className="w-full p-2 rounded-md border border-gray-300 bg-background"
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Amount:</span>
                <div className="flex items-center gap-1 text-lg font-bold">
                  
                ₹<span>{calculateTradeAmount().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto px-6 py-3 md:py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Order Request"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
} 