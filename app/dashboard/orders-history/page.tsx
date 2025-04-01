"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Briefcase, Coins, BarChart, Calendar, ArrowUpRight, ArrowDownRight, IndianRupee  } from "lucide-react";
import { Order } from "@/app/types/orders";
import { useAuth } from "@/app/auth-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const openSellModal = (order: Order) => {
    setSelectedOrder(order);
    setSellPrice(order.buyPrice); // Default to current price, could be market price instead
    setSellModalOpen(true);
    setSellError(null);
  };

  const closeSellModal = () => {
    setSellModalOpen(false);
    setSelectedOrder(null);
    setSellPrice(0);
    setSellError(null);
  };

  const handleSellRequest = async () => {
    if (!selectedOrder || !user) return;
    
    setIsSubmitting(true);
    setSellError(null);
    
    try {
      const response = await fetch("/api/orders/sell-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          sellPrice,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit sell request");
      }
      
      // Update the local state to reflect changes
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === selectedOrder.id 
            ? { ...order, status: "PENDING_SELL" as any } 
            : order
        )
      );
      
      closeSellModal();
    } catch (err) {
      setSellError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
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

  // Rest of your existing component code...
  const totalTrades = orders.length;
  const totalVolume = orders.reduce((sum, o) => sum + (o.tradeAmount || 0), 0);
  const netPNL = orders.reduce((sum, o) => {
    if (o.status.toString() === "CLOSED" && o.profitLoss) {
      return sum + o.profitLoss;
    }
    return sum;
  }, 0);
  const totalInvestment = orders.reduce((sum, o) => sum + (o.buyPrice * o.quantity), 0);

  const filteredOrders = orders.filter(order => {
    if (filter === 'ALL') return true;
    return order.status.toString() === filter;
  });
  
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
            <CardTitle>Net Profit/Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-semibold mt-2 ${netPNL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ₹{Math.abs(netPNL).toLocaleString()}
            </p>
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
            <button 
              onClick={() => setFilter('ALL')}
              className={`hover:text-primary transition-colors ${filter === 'ALL' ? 'text-primary' : ''}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('PENDING')}
              className={`hover:text-primary transition-colors ${filter === 'PENDING' ? 'text-primary' : ''}`}
            >
              Pending
            </button>
            <button 
              onClick={() => setFilter('OPEN')}
              className={`hover:text-primary transition-colors ${filter === 'OPEN' ? 'text-primary' : ''}`}
            >
              Open
            </button>
            <button 
              onClick={() => setFilter('PENDING_SELL')}
              className={`hover:text-primary transition-colors ${filter === 'PENDING_SELL' ? 'text-primary' : ''}`}
            >
              Pending Sell
            </button>
            <button 
              onClick={() => setFilter('CLOSED')}
              className={`hover:text-primary transition-colors ${filter === 'CLOSED' ? 'text-primary' : ''}`}
            >
              Closed
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
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
                {filteredOrders.map((order, idx) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 * idx }}
                    className="hover:bg-accent/5 transition-colors"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(order.tradeDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-3 font-medium">{order.symbol}</td>
                    <td className="p-3 text-right">
                      <span className="font-semibold">{order.quantity}</span>
                    </td>
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
                      order.profitLoss 
                        ? order.profitLoss > 0 
                          ? 'text-green-500' 
                          : 'text-red-500'
                        : 'text-muted-foreground'
                    }`}>
                      {order.profitLoss ? `₹${Math.abs(order.profitLoss).toFixed(2)}` : '-'}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status.toString() === "OPEN" ? 'bg-yellow-400/10 text-yellow-400' : 
                        order.status.toString() === "CLOSED" ? 'bg-blue-400/10 text-blue-400' : 
                        order.status.toString() === "PENDING" ? 'bg-orange-400/10 text-orange-400' :
                        'bg-purple-400/10 text-purple-400'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {order.status.toString() === "OPEN" && (
                        <button
                          onClick={() => openSellModal(order)}
                          className="p-2 rounded-md bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors"
                        >
                         <IndianRupee  className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      {/* Sell Order Modal */}
      {sellModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-background rounded-lg shadow-lg max-w-md w-full p-6"
          >
            <h3 className="text-xl font-bold mb-4">Sell Order Request</h3>
            
            {sellError && (
              <div className="p-3 bg-red-500/10 text-red-500 rounded-md mb-4">
                {sellError}
              </div>
            )}
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Symbol:</span>
                <span className="font-medium">{selectedOrder.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity:</span>
                <span className="font-medium">{selectedOrder.quantity}</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Buy Price:</span>
                  <span className="font-medium">₹{selectedOrder.buyPrice}</span>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <label htmlFor="sellPrice" className="block text-sm font-medium mb-1">
                  Sell Price (INR)
                </label>
                <input
                  id="sellPrice"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 rounded-md border border-gray-300 bg-background"
                />
              </div>
              
              <div className="mt-4 p-4 bg-background rounded-lg border">
                <h3 className="font-medium mb-2">Estimated Profit/Loss</h3>
                <div className="flex justify-between items-center">
                  <span>Sell Price × Quantity:</span>
                  <span className={`text-lg font-bold ${
                    sellPrice > selectedOrder.buyPrice ? 'text-green-500' : 'text-red-500'
                  }`}>
                    ₹{((sellPrice - selectedOrder.buyPrice) * selectedOrder.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={closeSellModal}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-accent/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSellRequest}
                disabled={isSubmitting || sellPrice <= 0}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Sell Request"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}