"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/app/auth-context";
import { Order, TradeStatus } from "@/app/types/orders";
import { Check, Calculator, TrendingUp, TrendingDown } from "lucide-react";

// Loading Bar Component
function LoadingBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 10;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-1 bg-green-50 overflow-hidden rounded-full">
      <div 
        className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300 ease-out" 
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export default function AdminSellRequestsPage() {
  const { user, isLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [sellPrices, setSellPrices] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isTableLoading, setIsTableLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchPendingSellOrders();
    }
  }, [user]);

  const fetchPendingSellOrders = async () => {
    try {
      setIsTableLoading(true);
      const response = await fetch("/api/admin/orders/pending-sell");
      if (!response.ok) throw new Error("Failed to fetch pending sell orders");
      const data = await response.json();
      setOrders(data.orders);
      
      // Initialize sell prices state
      const prices: Record<string, number> = {};
      data.orders.forEach((order: Order) => {
        prices[order.id] = order.buyPrice; // Initialize with buy price as default
      });
      setSellPrices(prices);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch orders");
    } finally {
      setIsTableLoading(false);
    }
  };

  const handleSellPriceChange = (orderId: string, price: number) => {
    setSellPrices(prev => ({
      ...prev,
      [orderId]: price
    }));
  };

  const handleApproveSell = async (orderId: string) => {
    if (!sellPrices[orderId]) {
      setError("Please enter a valid sell price");
      return;
    }

    setIsSubmitting(orderId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/admin/orders/approve-sell", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          sellPrice: sellPrices[orderId],
          timestamp: Date.now() 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to approve sell request");
      }

      const result = await response.json();
      
      setSuccess("Sell executed successfully. User's profit/loss has been updated.");
      
      await fetchPendingSellOrders();
      
      try {
        await fetch(`/api/user/dashboard/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: result.order.userId })
        });
      } catch (refreshError) {
        console.error("Failed to refresh user dashboard:", refreshError);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(null);
    }
  };


  // Helper function to calculate P&L based on order type and prices
  const calculateProfitLoss = (order: Order, sellPrice: number): number => {
    // Same calculation for all order types
    return (sellPrice - order.buyPrice) * order.quantity;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-muted-foreground">
          You do not have permission to access this page
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
        <h1 className="text-3xl font-bold text-primary mb-6">Pending Sell Requests</h1>
      </motion.div>

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-500/10 text-green-500 rounded-lg"
        >
          {success}
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/10 text-red-500 rounded-lg"
        >
          {error}
        </motion.div>
      )}

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-background/80 backdrop-blur-lg rounded-xl border p-4 md:p-6 shadow-sm"
      >
        {isTableLoading ? (
          <div className="space-y-4">
            {/* Loading Skeleton */}
            <div className="relative">
              <LoadingBar />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                </div>
              </div>
              <div className="mt-4 p-4 border rounded-lg">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="w-full md:w-40 h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
            <p className="text-center text-green-600 font-medium">Loading sell requests...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No pending sell requests
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border rounded-lg p-4 space-y-4"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Symbol</p>
                    <p className="font-medium">{order.symbol}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      {order.type}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Quantity</p>
                    <p className="font-medium">{order.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Buy Price</p>
                    <p className="font-medium">₹{order.buyPrice}</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-end gap-4 mt-4">
                  <div className="flex-1">
                    <label htmlFor={`sellPrice-${order.id}`} className="block text-sm font-medium mb-1">
                      Set Sell Price (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₹</span>
                      <input
                        id={`sellPrice-${order.id}`}
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="Enter sell price"
                        value={sellPrices[order.id] || ''}
                        onChange={(e) => handleSellPriceChange(order.id, parseFloat(e.target.value))}
                        className="w-full p-2 pl-7 rounded-md border border-gray-300 bg-background"
                      />
                    </div>
                  </div>
                  <div className="flex-none">
                    <button
                      onClick={() => handleApproveSell(order.id)}
                      disabled={isSubmitting === order.id || !sellPrices[order.id]}
                      className="w-full md:w-auto px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      {isSubmitting === order.id ? "Processing..." : "Approve & Execute"}
                    </button>
                  </div>
                </div>
                
                {sellPrices[order.id] && order.buyPrice && (
                  <div className="mt-2 p-3 bg-accent/20 rounded-md flex items-center">
                    <Calculator className="h-4 w-4 text-muted-foreground mr-2" />
                    <p className="text-sm">
                      <span className="font-medium">Expected P&L: </span>
                      <span className={
                        calculateProfitLoss(order, sellPrices[order.id]) >= 0 
                          ? "text-green-500" 
                          : "text-red-500"
                      }>
                        {calculateProfitLoss(order, sellPrices[order.id]).toFixed(2)} INR
                      </span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}