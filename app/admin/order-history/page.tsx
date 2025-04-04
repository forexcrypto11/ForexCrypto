"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User } from "@prisma/client";
import { Calendar, Users, Pencil, X, TrendingUp, TrendingDown, IndianRupee, FileText } from "lucide-react";
import { Order, NewOrder, TradeType, TradeStatus } from "@/app/types/orders";

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

type UserWithOrders = User & {
  orders: Order[];
};

export default function AdminOrderHistory() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedUserOrders, setSelectedUserOrders] = useState<UserWithOrders | null>(null);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const response = await fetch("/api/admin/users");
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchUserOrders = async (userId: string) => {
    try {
      setIsLoadingOrders(true);
      const response = await fetch(`/api/admin/users/${userId}/orders`);
      const data = await response.json();
      setSelectedUserOrders(data);
    } catch (error) {
      console.error("Error fetching user orders:", error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleUserChange = (userId: string) => {
    setSelectedUser(userId);
    if (userId) {
      fetchUserOrders(userId);
    } else {
      setSelectedUserOrders(null);
    }
  };

  const handleSaveOrder = async (orderData: Order) => {
    try {
      setIsProcessing(true);
      const url = modalMode === 'create' 
        ? '/api/admin/orders'
        : `/api/admin/orders/${orderData.id}`;
      
      const method = modalMode === 'create' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(modalMode === 'create' ? {
          ...orderData,
          userId: selectedUser
        } : orderData),
      });
  
      if (response.ok) {
        fetchUserOrders(selectedUser);
        setIsModalOpen(false);
      } else {
        console.error("Failed to save order:", await response.text());
      }
    } catch (error) {
      console.error("Error saving order:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      setIsProcessing(true);
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchUserOrders(selectedUser);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error deleting order:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateClick = () => {
    setModalMode('create');
    setSelectedOrder(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (order: Order) => {
    setModalMode('edit');
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // Order Card Component
  const OrderCard = ({ order }: { order: Order }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border rounded-lg p-4 mb-4 bg-background/80 hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {new Date(order.createdAt).toLocaleDateString()}
        </div>
        <button
          onClick={() => handleEditClick(order)}
          className="p-1 text-muted-foreground hover:text-primary transition-colors"
        >
          <Pencil className="h-4 w-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-xs text-muted-foreground">Symbol</p>
          <p className="font-medium">{order.symbol}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Quantity</p>
          <p className="font-medium">{order.quantity}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Type</p>
          <span
            className={`px-2 py-1 rounded-full text-xs inline-flex items-center gap-1 ${
              order.type === "BUY"
                ? "bg-green-400/10 text-green-400"
                : "bg-red-400/10 text-red-400"
            }`}
          >
            {order.type === "BUY" ? 
              <TrendingUp className="h-3 w-3" /> : 
              <TrendingDown className="h-3 w-3" />
            }
            {order.type}
          </span>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Status</p>
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              order.status === 'OPEN' ? 'bg-yellow-400/10 text-yellow-400' : 
              order.status === 'CLOSED' ? 'bg-blue-400/10 text-blue-400' :
              'bg-gray-400/10 text-gray-400'
            }`}
          >
            {order.status}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-xs text-muted-foreground">Buy Price</p>
          <p className="font-medium flex items-center">
            <IndianRupee className="h-3 w-3 text-muted-foreground mr-1" />
            {order.buyPrice}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Sell Price</p>
          <p className="font-medium flex items-center">
            <IndianRupee className="h-3 w-3 text-muted-foreground mr-1" />
            {order.sellPrice ? order.sellPrice : '-'}
          </p>
        </div>
      </div>
      
      <div className="border-t pt-3 mt-2">
        <div className="flex justify-between items-center">
          <p className="text-xs font-medium">Profit/Loss:</p>
          <p className={`font-medium ${
            order.profitLoss && order.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {order.profitLoss ? `₹${order.profitLoss.toFixed(2)}` : '-'}
          </p>
        </div>
      </div>
    </motion.div>
  );

  // Order Popup Modal
  const OrderPopupModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-background rounded-xl p-6 max-w-md w-full shadow-lg"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">
            {modalMode === 'create' ? 'Create New Order' : 'Edit Order'}
          </h3>
          <button 
            onClick={() => setIsModalOpen(false)}
            className="p-1 text-muted-foreground hover:text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          if (selectedOrder) handleSaveOrder(selectedOrder);
        }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Symbol</label>
              <input
                type="text"
                value={selectedOrder?.symbol || ''}
                onChange={(e) => selectedOrder && setSelectedOrder({
                  ...selectedOrder,
                  symbol: e.target.value
                })}
                className="w-full p-2 rounded-lg border focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Quantity</label>
                <input
                  type="number"
                  value={selectedOrder?.quantity || 0}
                  onChange={(e) => selectedOrder && setSelectedOrder({
                    ...selectedOrder,
                    quantity: Number(e.target.value)
                  })}
                  className="w-full p-2 rounded-lg border focus:ring-2 focus:ring-primary"
                  required
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Type</label>
                <select
                  value={selectedOrder?.type || 'BUY'}
                  onChange={(e) => selectedOrder && setSelectedOrder({
                    ...selectedOrder,
                    type: e.target.value as "BUY" | "SELL"
                  })}
                  className="w-full p-2 rounded-lg border focus:ring-2 focus:ring-primary"
                >
                  <option value="BUY">Buy</option>
                  <option value="SELL">Sell</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Buy Price (₹)</label>
                <input
                  type="number"
                  value={selectedOrder?.buyPrice || 0}
                  onChange={(e) => selectedOrder && setSelectedOrder({
                    ...selectedOrder,
                    buyPrice: Number(e.target.value)
                  })}
                  className="w-full p-2 rounded-lg border focus:ring-2 focus:ring-primary"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Sell Price (₹)</label>
                <input
                  type="number"
                  value={selectedOrder?.sellPrice || 0}
                  onChange={(e) => selectedOrder && setSelectedOrder({
                    ...selectedOrder,
                    sellPrice: Number(e.target.value)
                  })}
                  className="w-full p-2 rounded-lg border focus:ring-2 focus:ring-primary"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1">Status</label>
              <select
                value={selectedOrder?.status || TradeStatus.OPEN}
                onChange={(e) => selectedOrder && setSelectedOrder({
                  ...selectedOrder,
                  status: e.target.value as TradeStatus
                })}
                className="w-full p-2 rounded-lg border focus:ring-2 focus:ring-primary"
              >
                <option value={TradeStatus.OPEN}>Open</option>
                <option value={TradeStatus.CLOSED}>Closed</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            {modalMode === 'edit' && (
              <button
                type="button"
                onClick={() => selectedOrder && handleDeleteOrder(selectedOrder.id)}
                className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                disabled={isProcessing}
              >
                {isProcessing ? 'Deleting...' : 'Delete'}
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg border hover:bg-accent/50 transition-colors"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {modalMode === 'create' ? 'Creating...' : 'Saving...'}
                </span>
              ) : (
                modalMode === 'create' ? 'Create Order' : 'Save Changes'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-primary mb-6">Manage Order History</h1>
      </motion.div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <select
            value={selectedUser}
            onChange={(e) => handleUserChange(e.target.value)}
            className="w-full p-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={isLoadingUsers}
          >
            <option value="">Select User</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          {isLoadingUsers && <LoadingBar />}
        </div>
        {selectedUser && (
          <button
            onClick={handleCreateClick}
            className="w-full md:w-auto px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 justify-center"
          >
            <span>Create Order</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        )}
      </div>

      {selectedUserOrders && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-background/80 backdrop-blur-lg rounded-xl border shadow-sm overflow-hidden"
        >
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Orders for {selectedUserOrders.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {selectedUserOrders.orders.length} order(s)
            </p>
          </div>
          
          {isLoadingOrders ? (
            <div className="p-4">
              <LoadingBar />
              <div className="space-y-4 mt-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/6 animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {[...Array(4)].map((_, j) => (
                        <div key={j} className="space-y-2">
                          <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-center text-green-600 font-medium mt-4">Loading orders...</p>
            </div>
          ) : selectedUserOrders.orders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              No orders found for this user
            </div>
          ) : (
            <>
              {/* Mobile View */}
              <div className="md:hidden p-4">
                {selectedUserOrders.orders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
              
              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="text-sm text-muted-foreground border-b">
                    <tr>
                      <th className="p-3 text-left">Date</th>
                      <th className="p-3 text-left">Symbol</th>
                      <th className="p-3 text-right">Qty</th>
                      <th className="p-3 text-right">Buy (₹)</th>
                      <th className="p-3 text-right">Sell (₹)</th>
                      <th className="p-3 text-left">Type</th>
                      <th className="p-3 text-right">P&L (₹)</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedUserOrders.orders.map((order) => (
                      <tr 
                        key={order.id} 
                        className="hover:bg-accent/5 border-t transition-colors"
                      >
                        <td className="p-3">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3 font-medium">{order.symbol}</td>
                        <td className="p-3 text-right">{order.quantity}</td>
                        <td className="p-3 text-right">
                          <IndianRupee className="h-3 w-3 inline mr-1 text-muted-foreground" />
                          {order.buyPrice}
                        </td>
                        <td className="p-3 text-right">
                          {order.sellPrice ? (
                            <>
                              <IndianRupee className="h-3 w-3 inline mr-1 text-muted-foreground" />
                              {order.sellPrice}
                            </>
                          ) : '-'}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            order.type === 'BUY' ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'
                          }`}>
                            {order.type}
                          </span>
                        </td>
                        <td className={`p-3 text-right ${
                          order.profitLoss && order.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {order.profitLoss ? (
                            <>
                              <IndianRupee className="h-3 w-3 inline mr-1" />
                              {order.profitLoss.toFixed(2)}
                            </>
                          ) : '-'}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            order.status === 'OPEN' ? 'bg-yellow-400/10 text-yellow-400' : 
                            order.status === 'CLOSED' ? 'bg-blue-400/10 text-blue-400' :
                            'bg-gray-400/10 text-gray-400'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleEditClick(order)}
                            className="p-1 text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </motion.div>
      )}

      {isModalOpen && <OrderPopupModal />}
    </div>
  );
}