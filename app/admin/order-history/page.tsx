"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User } from "@prisma/client";
import { Calendar, Users, Pencil, X, TrendingUp, TrendingDown, IndianRupee  } from "lucide-react";
import { EditOrderModal } from "@/app/components/EditOrderModal";
import { Order, NewOrder, TradeType, TradeStatus } from "@/app/types/orders";

type UserWithOrders = User & {
  orders: Order[];
};

export default function AdminOrderHistory() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedUserOrders, setSelectedUserOrders] = useState<UserWithOrders | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [newOrder, setNewOrder] = useState<Omit<NewOrder, 'userId'>>({
    symbol: "",
    quantity: 0,
    buyPrice: 0,
    sellPrice: 0,
    tradeAmount: 0,
    type: TradeType.LONG,
    status: TradeStatus.OPEN,
  });
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditOrder = async (updatedOrder: Order) => {
    try {
      const response = await fetch(`/api/admin/orders/${updatedOrder.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedOrder),
      });

      if (response.ok) {
        fetchUserOrders(selectedUser);
        setEditingOrder(null);
      }
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();
      console.log("API Response:", data);
      setUsers(data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  };

  const fetchUserOrders = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/orders`);
      const data = await response.json();
      setSelectedUserOrders(data);
    } catch (error) {
      console.error("Error fetching user orders:", error);
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

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/ordersaa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newOrder,
          userId: selectedUser,
          tradeDate: new Date(),
          profitLoss: (newOrder.sellPrice - newOrder.buyPrice) * newOrder.quantity,
        }),
      });

      if (response.ok) {
        setIsCreatingOrder(false);
        fetchUserOrders(selectedUser);
        setNewOrder({
          symbol: "",
          quantity: 0,
          buyPrice: 0,
          sellPrice: 0,
          tradeAmount: 0,
          type: TradeType.LONG,
          status: TradeStatus.OPEN
        });
      }
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchUserOrders(selectedUser);
      }
    } catch (error) {
      console.error("Error deleting order:", error);
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

  const handleSaveOrder = async (orderData: Order) => {
    try {
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
    }
  };

  // Mobile card for orders
  const renderOrderCard = (order: Order) => (
    <motion.div
      key={order.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border rounded-lg p-4 mb-4 bg-background/80"
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{new Date(order.tradeDate).toLocaleDateString()}</span>
        </div>
        <button
          onClick={() => handleEditClick(order)}
          className="p-1 hover:text-primary"
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
              order.type === "LONG"
                ? "bg-green-400/10 text-green-400"
                : "bg-red-400/10 text-red-400"
            }`}
          >
            {order.type === "LONG" ? 
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
              order.status === 'OPEN' ? 'bg-yellow-400/10 text-yellow-400' : 'bg-blue-400/10 text-blue-400'
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
           <IndianRupee  className="h-3 w-3 text-muted-foreground" />
            {order.buyPrice}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Sell Price</p>
          <p className="font-medium flex items-center">
           <IndianRupee  className="h-3 w-3 text-muted-foreground" />
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
            {order.profitLoss ? `${order.profitLoss.toFixed(2)}` : '-'}
          </p>
        </div>
      </div>
    </motion.div>
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
        <div className="flex-1">
          <select
            value={selectedUser}
            onChange={(e) => handleUserChange(e.target.value)}
            className="w-full p-2 rounded-lg border bg-background"
          >
            <option value="">Select User</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>
        {selectedUser && (
          <button
            onClick={handleCreateClick}
            className="w-full md:w-auto px-4 py-2 bg-primary text-white rounded-lg flex justify-center items-center"
          >
            Create Order
          </button>
        )}
      </div>

      {isCreatingOrder && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background/80 backdrop-blur-lg rounded-xl border p-6 mb-6"
        >
          <h3 className="text-lg font-semibold mb-4">Create New Order</h3>
          <form onSubmit={handleCreateOrder} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Symbol</label>
                <input
                  type="text"
                  value={newOrder.symbol}
                  onChange={(e) => setNewOrder({ ...newOrder, symbol: e.target.value })}
                  className="w-full p-2 rounded-lg border"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Quantity</label>
                <input
                  type="number"
                  value={newOrder.quantity}
                  onChange={(e) => setNewOrder({ ...newOrder, quantity: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg border"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Trade Amount</label>
                <input
                  type="number"
                  value={newOrder.tradeAmount}
                  onChange={(e) => setNewOrder({ ...newOrder, tradeAmount: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg border"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Buy Price</label>
                <input
                  type="number"
                  value={newOrder.buyPrice}
                  onChange={(e) => setNewOrder({ ...newOrder, buyPrice: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg border"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Sell Price</label>
                <input
                  type="number"
                  value={newOrder.sellPrice}
                  onChange={(e) => setNewOrder({ ...newOrder, sellPrice: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg border"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Type</label>
                <select
                  value={newOrder.type}
                  onChange={(e) => setNewOrder({ ...newOrder, type: e.target.value as TradeType })}
                  className="w-full p-2 rounded-lg border"
                >
                  <option value={TradeType.LONG}>Long</option>
                  <option value={TradeType.SHORT}>Short</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Status</label>
                <select
                  value={newOrder.status}
                  onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value as TradeStatus })}
                  className="w-full p-2 rounded-lg border"
                >
                  <option value={TradeStatus.OPEN}>Open</option>
                  <option value={TradeStatus.CLOSED}>Closed</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreatingOrder(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-lg"
              >
                Create Order
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {selectedUserOrders && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-background/80 backdrop-blur-lg rounded-xl border shadow-sm"
        >
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Orders for {selectedUserOrders.name}
            </h3>
          </div>
          
          {/* Mobile View */}
          <div className="md:hidden p-4">
            {selectedUserOrders.orders.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No orders found for this user
              </div>
            ) : (
              selectedUserOrders.orders.map(order => renderOrderCard(order))
            )}
          </div>
          
          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
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
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {selectedUserOrders.orders.map((order) => (
                  <tr key={order.id} className="hover:bg-accent/5">
                    <td className="p-3">
                      {new Date(order.tradeDate).toLocaleDateString()}
                    </td>
                    <td className="p-3">{order.symbol}</td>
                    <td className="p-3 text-right">{order.quantity}</td>
                    <td className="p-3 text-right">₹{order.buyPrice}</td>
                    <td className="p-3 text-right">
                      {order.sellPrice ? `₹${order.sellPrice}` : '-'}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.type === 'LONG' ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'
                      }`}>
                        {order.type}
                      </span>
                    </td>
                    <td className={`p-3 text-right ${
                      order.profitLoss && order.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {order.profitLoss ? `${order.profitLoss.toFixed(2)}` : '-'}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status === 'OPEN' ? 'bg-yellow-400/10 text-yellow-400' : 'bg-blue-400/10 text-blue-400'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleEditClick(order)}
                        className="p-1 hover:text-primary"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <EditOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveOrder}
        onDelete={handleDeleteOrder}
        order={selectedOrder}
        mode={modalMode}
        userId={selectedUser}
      />
    </div>
  );
}