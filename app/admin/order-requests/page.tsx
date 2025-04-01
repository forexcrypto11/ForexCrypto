"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, X, Calendar, IndianRupee , Edit, SaveIcon } from "lucide-react";
import { Order } from "@/app/types/orders";
import { useAuth } from "@/app/auth-context";

// Extended Order type to include user information
type ExtendedOrder = Order & {
  userName?: string;
  accountBalance?: number;
  baseAccountBalance?: number;
  approvedLoanAmount?: number;
  totalOrdersAmount?: number;
};

export default function AdminOrderRequestsPage() {
  const [orders, setOrders] = useState<ExtendedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'PENDING' | 'PENDING_SELL' | 'ALL'>('PENDING');
  const { user, isLoading: authLoading } = useAuth();
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editedBuyPrice, setEditedBuyPrice] = useState<number | null>(null);
  const [sellPrices, setSellPrices] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user?.role === "admin") {
      fetchPendingOrders();
    }
  }, [user, authLoading]);

  const fetchPendingOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/order-requests");
      if (!response.ok) {
        throw new Error("Failed to fetch pending orders");
      }
      const data = await response.json();
      
      // Fetch user details for each order
      const ordersWithUserDetails = await Promise.all(
        data.orders.map(async (order: Order) => {
          try {
            const userResponse = await fetch(`/api/admin/users/${order.userId}`);
            if (userResponse.ok) {
              const userData = await userResponse.json();
              
              // Calculate balance components
              let baseAccountBalance = 0;
              let approvedLoanAmount = 0;
              let totalOrdersAmount = 0;
              
              // Calculate deposits minus withdrawals (base account balance)
              if (userData.user.transactions) {
                const deposits = userData.user.transactions
                  .filter((t: any) => t.type === 'DEPOSIT' && t.status === 'COMPLETED' && t.verified === true)
                  .reduce((sum: number, t: any) => sum + t.amount, 0);
                
                const withdrawals = userData.user.transactions
                  .filter((t: any) => t.type === 'WITHDRAW' && t.status === 'COMPLETED')
                  .reduce((sum: number, t: any) => sum + t.amount, 0);
                
                baseAccountBalance = deposits - withdrawals;
              }
              
              // Calculate approved loan amount
              if (userData.user.loanRequests) {
                approvedLoanAmount = userData.user.loanRequests
                  .filter((loan: any) => loan.status === 'APPROVED')
                  .reduce((sum: number, loan: any) => sum + loan.amount, 0);
              }
              
              // Calculate total order amounts (open and closed)
              if (userData.user.orders) {
                totalOrdersAmount = userData.user.orders
                  .filter((o: any) => o.status === 'OPEN' || o.status === 'CLOSED')
                  .reduce((sum: number, o: any) => sum + o.tradeAmount, 0);
              }
              
              // Calculate final account balance using the formula:
              // Deposits + Loans - Withdrawals - Order Amounts
              const accountBalance = baseAccountBalance + approvedLoanAmount - totalOrdersAmount;
              
              return { 
                ...order, 
                userName: userData.user.name || 'Unknown',
                accountBalance,
                baseAccountBalance,
                approvedLoanAmount,
                totalOrdersAmount
              };
            }
            return order;
          } catch (error) {
            console.error(`Error fetching user details for order ${order.id}:`, error);
            return order;
          }
        })
      );
      
      setOrders(ordersWithUserDetails);
    } catch (error) {
      console.error("Error fetching pending orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (orderId: string) => {
    setProcessingOrderId(orderId);
    try {
      const response = await fetch(`/api/admin/order-requests/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      if (!response.ok) {
        throw new Error("Failed to approve order");
      }

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== orderId)
      );
    } catch (error) {
      console.error("Error approving order:", error);
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleReject = async (orderId: string) => {
    setProcessingOrderId(orderId);
    try {
      const response = await fetch(`/api/admin/order-requests/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      if (!response.ok) {
        throw new Error("Failed to reject order");
      }

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== orderId)
      );
    } catch (error) {
      console.error("Error rejecting order:", error);
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleApproveSell = async (orderId: string) => {
    if (!sellPrices[orderId]) {
      setError("Please enter a valid sell price");
      return;
    }

    setProcessingOrderId(orderId);
    try {
      const response = await fetch(`/api/admin/order-requests/approve-sell`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          orderId,
          sellPrice: sellPrices[orderId]
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to approve sell request");
      }

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== orderId)
      );
    } catch (error) {
      console.error("Error approving sell request:", error);
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleRejectSell = async (orderId: string) => {
    setProcessingOrderId(orderId);
    try {
      const response = await fetch(`/api/admin/order-requests/reject-sell`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      if (!response.ok) {
        throw new Error("Failed to reject sell request");
      }

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== orderId)
      );
    } catch (error) {
      console.error("Error rejecting sell request:", error);
    } finally {
      setProcessingOrderId(null);
    }
  };
  
  const startEditing = (order: ExtendedOrder) => {
    setEditingOrderId(order.id);
    setEditedBuyPrice(order.buyPrice);
  };
  
  const saveEditedBuyPrice = async (orderId: string) => {
    if (editedBuyPrice === null) return;
    
    setProcessingOrderId(orderId);
    try {
      const response = await fetch(`/api/admin/order-requests/update-buy-price`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          orderId, 
          buyPrice: editedBuyPrice 
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update buy price");
      }

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) => 
          order.id === orderId 
            ? { ...order, buyPrice: editedBuyPrice } 
            : order
        )
      );
      
      // Reset editing state
      setEditingOrderId(null);
      setEditedBuyPrice(null);
    } catch (error) {
      console.error("Error updating buy price:", error);
    } finally {
      setProcessingOrderId(null);
    }
  };
  
  const cancelEditing = () => {
    setEditingOrderId(null);
    setEditedBuyPrice(null);
  };

  const renderMobileOrderCard = (order: ExtendedOrder, idx: number) => (
    <motion.div
      key={order.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.05 * idx }}
      className="border rounded-lg p-4 mb-4 bg-background/80"
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{new Date(order.tradeDate).toLocaleDateString()}</span>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            order.status.toString() === "PENDING"
              ? "bg-orange-400/10 text-orange-400"
              : "bg-purple-400/10 text-purple-400"
          }`}
        >
          {order.status}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-xs text-muted-foreground">User</p>
          <p className="font-medium truncate">{order.userName || `${order.userId.substring(0, 8)}...`}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Balance</p>
          <div>
            <p className="font-medium">₹{order.accountBalance?.toFixed(2) || '0.00'}</p>
            {((order.approvedLoanAmount && order.approvedLoanAmount > 0) || 
              (order.totalOrdersAmount && order.totalOrdersAmount > 0)) && (
              <div className="text-xs text-muted-foreground mt-1">
                <div>Base: ₹{(order.baseAccountBalance || 0).toFixed(2)}</div>
                {order.approvedLoanAmount && order.approvedLoanAmount > 0 && (
                  <div>Loan: +₹{order.approvedLoanAmount.toFixed(2)}</div>
                )}
                {order.totalOrdersAmount && order.totalOrdersAmount > 0 && (
                  <div>Orders: -${order.totalOrdersAmount.toFixed(2)}</div>
                )}
              </div>
            )}
          </div>
        </div>
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
            className={`px-2 py-1 rounded-full text-xs ${
              order.type === "LONG"
                ? "bg-green-400/10 text-green-400"
                : "bg-red-400/10 text-red-400"
            }`}
          >
            {order.type}
          </span>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Amount</p>
          <p className="font-medium">${order.tradeAmount.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">Buy Price</p>
            {editingOrderId === order.id ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={editedBuyPrice || ''}
                  onChange={(e) => setEditedBuyPrice(parseFloat(e.target.value))}
                  className="w-24 p-1 border rounded text-right"
                  step="0.01"
                  min="0"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-medium">${order.buyPrice}</span>
                {order.status.toString() === "PENDING" && (
                  <button
                    onClick={() => startEditing(order)}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Edit className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">Sell Price</p>
          <span className="font-medium">{order.sellPrice ? `$${order.sellPrice}` : "-"}</span>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end gap-2">
        {editingOrderId === order.id ? (
          <>
            <button
              onClick={() => saveEditedBuyPrice(order.id)}
              disabled={processingOrderId === order.id}
              className="p-2 rounded-md bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <SaveIcon className="h-4 w-4" />
              <span>Save</span>
            </button>
            <button
              onClick={cancelEditing}
              disabled={processingOrderId === order.id}
              className="p-2 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
          </>
        ) : order.status.toString() === "PENDING" ? (
          <>
            <button
              onClick={() => handleApprove(order.id)}
              disabled={processingOrderId === order.id}
              className="p-2 rounded-md bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <Check className="h-4 w-4" />
              <span>Approve</span>
            </button>
            <button
              onClick={() => handleReject(order.id)}
              disabled={processingOrderId === order.id}
              className="p-2 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              <span>Reject</span>
            </button>
          </>
        ) : order.status.toString() === "PENDING_SELL" ? (
          <>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="number"
                value={sellPrices[order.id] || ''}
                onChange={(e) => setSellPrices(prev => ({
                  ...prev,
                  [order.id]: parseFloat(e.target.value)
                }))}
                placeholder="Enter sell price"
                className="w-24 p-1 border rounded text-right"
                step="0.01"
                min="0"
              />
            </div>
            <button
              onClick={() => handleApproveSell(order.id)}
              disabled={processingOrderId === order.id || !sellPrices[order.id]}
              className="p-2 rounded-md bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <Check className="h-4 w-4" />
              <span>Approve</span>
            </button>
            <button
              onClick={() => handleRejectSell(order.id)}
              disabled={processingOrderId === order.id}
              className="p-2 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              <span>Reject</span>
            </button>
          </>
        ) : null}
      </div>
    </motion.div>
  );

  if (authLoading) {
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
          You dont have permission to access this page
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter((order) => {
    if (filter === "ALL") return true;
    return order.status.toString() === filter;
  });

  return (
    <div className="space-y-6 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-primary mb-6">
          Order Requests
        </h1>
      </motion.div>

      <div className="bg-background/80 backdrop-blur-lg rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
           <IndianRupee  className="h-5 w-5 text-primary" />
            Pending Requests
          </h3>
          <div className="flex items-center gap-4 text-sm">
            <button
              onClick={() => setFilter("ALL")}
              className={`hover:text-primary transition-colors ${
                filter === "ALL" ? "text-primary" : ""
              }`}
            >
              All Requests
            </button>
            <button
              onClick={() => setFilter("PENDING")}
              className={`hover:text-primary transition-colors ${
                filter === "PENDING" ? "text-primary" : ""
              }`}
            >
              New Orders
            </button>
            <button
              onClick={() => setFilter("PENDING_SELL")}
              className={`hover:text-primary transition-colors ${
                filter === "PENDING_SELL" ? "text-primary" : ""
              }`}
            >
              Sell Requests
            </button>
          </div>
        </div>

        {/* Mobile View */}
        <div className="md:hidden p-4">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No pending requests found
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order, idx) => renderMobileOrderCard(order, idx))}
            </div>
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No pending requests found
            </div>
          ) : (
            <table className="w-full">
              <thead className="text-xs text-muted-foreground border-b">
                <tr>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">User</th>
                  <th className="p-3 text-right">Balance</th>
                  <th className="p-3 text-left">Symbol</th>
                  <th className="p-3 text-right">Quantity</th>
                  <th className="p-3 text-right">Buy Price</th>
                  <th className="p-3 text-right">Sell Price</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-right">Amount</th>
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
                    transition={{ delay: 0.05 * idx }}
                    className="hover:bg-accent/5 transition-colors"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(order.tradeDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-3 font-medium">
                      {order.userName || `${order.userId.substring(0, 8)}...`}
                    </td>
                    <td className="p-3 text-right">
                      <div>
                      ₹{order.accountBalance?.toFixed(2) || '0.00'}
                        {((order.approvedLoanAmount && order.approvedLoanAmount > 0) || 
                          (order.totalOrdersAmount && order.totalOrdersAmount > 0)) && (
                          <div className="text-xs text-muted-foreground mt-1">
                            <div>Base: ₹{(order.baseAccountBalance || 0).toFixed(2)}</div>
                            {order.approvedLoanAmount && order.approvedLoanAmount > 0 && (
                              <div>Loan: +₹{order.approvedLoanAmount.toFixed(2)}</div>
                            )}
                            {order.totalOrdersAmount && order.totalOrdersAmount > 0 && (
                              <div>Orders: -₹{order.totalOrdersAmount.toFixed(2)}</div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3 font-medium">{order.symbol}</td>
                    <td className="p-3 text-right">{order.quantity}</td>
                    <td className="p-3 text-right">
                      {editingOrderId === order.id ? (
                        <input
                          type="number"
                          value={editedBuyPrice || ''}
                          onChange={(e) => setEditedBuyPrice(parseFloat(e.target.value))}
                          className="w-24 p-1 border rounded text-right"
                          step="0.01"
                          min="0"
                        />
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          ₹{order.buyPrice}
                          {order.status.toString() === "PENDING" && (
                            <button
                              onClick={() => startEditing(order)}
                              className="text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {order.sellPrice ? `₹${order.sellPrice}` : "-"}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          order.type === "LONG"
                            ? "bg-green-400/10 text-green-400"
                            : "bg-red-400/10 text-red-400"
                        }`}
                      >
                        {order.type}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                    ₹{order.tradeAmount.toFixed(2)}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          order.status.toString() === "PENDING"
                            ? "bg-orange-400/10 text-orange-400"
                            : "bg-purple-400/10 text-purple-400"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-2">
                        {editingOrderId === order.id ? (
                          <>
                            <button
                              onClick={() => saveEditedBuyPrice(order.id)}
                              disabled={processingOrderId === order.id}
                              className="p-1 rounded-md bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors disabled:opacity-50"
                            >
                              <SaveIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={cancelEditing}
                              disabled={processingOrderId === order.id}
                              className="p-1 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : order.status.toString() === "PENDING" ? (
                          <>
                            <button
                              onClick={() => handleApprove(order.id)}
                              disabled={processingOrderId === order.id}
                              className="p-1 rounded-md bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors disabled:opacity-50"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleReject(order.id)}
                              disabled={processingOrderId === order.id}
                              className="p-1 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : order.status.toString() === "PENDING_SELL" ? (
                          <>
                            <div className="flex items-center gap-2 mb-2">
                              <input
                                type="number"
                                value={sellPrices[order.id] || ''}
                                onChange={(e) => setSellPrices(prev => ({
                                  ...prev,
                                  [order.id]: parseFloat(e.target.value)
                                }))}
                                placeholder="Enter sell price"
                                className="w-24 p-1 border rounded text-right"
                                step="0.01"
                                min="0"
                              />
                            </div>
                            <button
                              onClick={() => handleApproveSell(order.id)}
                              disabled={processingOrderId === order.id || !sellPrices[order.id]}
                              className="p-2 rounded-md bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors disabled:opacity-50 flex items-center gap-1"
                            >
                              <Check className="h-4 w-4" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleRejectSell(order.id)}
                              disabled={processingOrderId === order.id}
                              className="p-2 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors disabled:opacity-50 flex items-center gap-1"
                            >
                              <X className="h-4 w-4" />
                              <span>Reject</span>
                            </button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
} 