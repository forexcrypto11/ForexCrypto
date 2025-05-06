"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Briefcase, Coins, BarChart, Calendar, ArrowUpRight, ArrowDownRight, IndianRupee  } from "lucide-react";
import { Order } from "@/app/types/orders";
import { useAuth } from "@/app/auth-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Loading Bar Component (Added)
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

export default function OrdersHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'CLOSED' | 'PENDING' | 'PENDING_SELL'>('ALL');
  const { user, isLoading: authLoading } = useAuth();
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sellPrice, setSellPrice] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sellError, setSellError] = useState<string | null>(null);
  const [totalProfitLoss, setTotalProfitLoss] = useState<number>(0);
  const [openPositionsPL, setOpenPositionsPL] = useState<number>(0);
  const [closedPositionsPL, setClosedPositionsPL] = useState<number>(0);

  useEffect(() => {
    if (!authLoading && user) {
      fetchOrders();
    }
  }, [user, authLoading]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders', {
        headers: {
          'x-user-id': user?.id || ''
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      setOrders(data.orders);
      
      // Use the profit/loss values from the API response
      
      setTotalProfitLoss(data.totalProfitLoss);
      setClosedPositionsPL(data.closedPositionsProfitLoss);
      setOpenPositionsPL(data.openPositionsProfitLoss);
      
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Show unauthorized message if not logged in
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-muted-foreground">
          Please log in to view your order history
        </div>
      </div>
    );
  }

  // Calculate summary values
  const totalTrades = orders.length;
  const totalInvestment = orders.reduce((sum, o) => sum + (o.quantity * o.buyPrice), 0);
  
  return (
    <div className="space-y-6 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-primary mb-6">Trading History</h1>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-background/80 backdrop-blur-lg rounded-xl border p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Trades</p>
              <p className="text-2xl font-semibold mt-2">{totalTrades}</p>
            </div>
            <div className="p-2 rounded-lg bg-primary/10">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-background/80 backdrop-blur-lg rounded-xl border p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Investments</p>
              <p className="text-2xl font-semibold mt-2">₹{totalInvestment.toLocaleString()}</p>
            </div>
            <div className="p-2 rounded-lg bg-primary/10">
              <Coins className="h-6 w-6 text-primary" />
            </div>
          </div>
        </motion.div>
        
        <Card>
          <CardHeader>
            <CardTitle>Profit/Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-semibold mt-2 ${totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ₹{Math.abs(totalProfitLoss).toLocaleString()}
            </p>
            <div className="flex flex-col mt-2 text-xs text-muted-foreground">
              <span>Closed: ₹{closedPositionsPL.toLocaleString()}</span>
              <span>Open: ₹{openPositionsPL.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-background/80 backdrop-blur-lg rounded-xl border shadow-sm overflow-hidden"
      >
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Order History
          </h3>
          <div className="flex items-center gap-4 text-sm">
            {/* Add filter buttons here if needed */}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="space-y-4">
              {/* Loading Skeleton */}
              <div className="relative">
                <LoadingBar />
                <table className="w-full">
                  <thead className="text-xs text-muted-foreground border-b">
                    <tr>
                      {[...Array(9)].map((_, i) => (
                        <th key={i} className="p-3">
                          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(5)].map((_, rowIndex) => (
                      <tr key={rowIndex} className="border-b">
                        {[...Array(9)].map((_, cellIndex) => (
                          <td key={cellIndex} className="p-3">
                            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-center text-green-600 font-medium">Loading order data...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="text-xs text-muted-foreground border-b">
                <tr>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Symbol</th>
                  <th className="p-3 text-right">Qty</th>
                  <th className="p-3 text-right">Buy Price</th>
                  <th className="p-3 text-right">Sell Price</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-right">P&L</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, idx) => (
                  <tr key={order.id} className="border-b hover:bg-accent/5">
                    <td className="p-3">
                      {new Date(order.tradeDate).toLocaleDateString()}
                    </td>
                    <td className="p-3 font-medium">{order.symbol}</td>
                    <td className="p-3 text-right">{order.quantity}</td>
                    <td className="p-3 text-right">₹{order.buyPrice}</td>
                    <td className="p-3 text-right">{order.sellPrice ? `₹${order.sellPrice}` : '-'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.type === 'LONG' ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'
                      }`}>
                        {order.type}
                      </span>
                    </td>
                    <td className={`p-3 text-right font-medium ${
                      order.profitLoss ? (order.profitLoss >= 0 ? 'text-green-500' : 'text-red-500') : ''
                    }`}>
                      {order.profitLoss ? `₹${Math.abs(order.profitLoss).toLocaleString()}` : '-'}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status === 'OPEN' ? 'bg-yellow-400/10 text-yellow-400' : 
                        order.status === 'CLOSED' ? 'bg-blue-400/10 text-blue-400' : 
                        'bg-purple-400/10 text-purple-400'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {/* Add action buttons here if needed */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  );
} 