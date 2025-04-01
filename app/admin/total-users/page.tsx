"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Users, UserPlus, UserCheck, UserX, ArrowUpRight, Mail, Shield, BarChart, Search, Trash2 } from "lucide-react";
import { UserDetailsModal } from "@/app/components/admin/UserDetailsModal";
import { User, Transaction, OrderHistory, LoanRequest } from "@prisma/client";
import Link from 'next/link'
import { format } from 'date-fns'
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import LoadingOverlay from "@/components/ui/loading-overlay";

interface ExtendedUser extends User {
  transactions: Transaction[];
  orders: OrderHistory[];
  loanRequest: LoanRequest | null;
}

interface UserStats {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  suspendedUsers: number;
}

export default function TotalUsers() {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState<ExtendedUser | null>(null);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    newUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data.users);
      
      // Calculate stats
      const today = new Date();
      const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
      
      const newUsersCount = data.filter((user: User) => 
        new Date(user.createdAt) > thirtyDaysAgo
      ).length;
      
      const activeUsersCount = data.filter((user: ExtendedUser) => 
        user.isVerified
      ).length;
      
      const suspendedUsersCount = data.filter((user: ExtendedUser) => 
        !user.isVerified
      ).length;

      setStats({
        totalUsers: data.length,
        newUsers: newUsersCount,
        activeUsers: activeUsersCount,
        suspendedUsers: suspendedUsersCount
      });

    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  const statsData = [
    { 
      title: "Total Users", 
      value: stats.totalUsers, 
      icon: <Users className="h-5 w-5" />, 
      change: `${((stats.totalUsers - stats.newUsers) / stats.totalUsers * 100).toFixed(1)}%`, 
      trend: "positive" 
    },
    { 
      title: "New Users", 
      value: stats.newUsers, 
      icon: <UserPlus className="h-5 w-5" />, 
      change: `+${stats.newUsers}`, 
      trend: "positive" 
    },
    { 
      title: "Active Users", 
      value: `${((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}%`, 
      icon: <UserCheck className="h-5 w-5" />, 
      change: `${stats.activeUsers} users`, 
      trend: "positive" 
    },
    { 
      title: "Suspended", 
      value: stats.suspendedUsers, 
      icon: <UserX className="h-5 w-5" />, 
      change: `${stats.suspendedUsers} users`, 
      trend: "negative" 
    }
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-400';
      case 'trader': return 'text-green-400';
      case 'investor': return 'text-blue-400';
      default: return 'text-muted-foreground';
    }
  };

  const handleViewUser = (user: ExtendedUser) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleEditUser = async (user: ExtendedUser) => {
    // For now, just view the user. You can implement edit functionality later
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to delete user");
      }
      
      toast.success('User successfully deleted');
      await fetchUsers();
      setIsDeleteModalOpen(false);
      setDeleteUser(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete user';
      toast.error(message);
      console.error('Delete user error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && users.length === 0) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {isLoading && <LoadingOverlay message="Processing user data..." />}
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-primary mb-6">User Management</h1>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-background/80 backdrop-blur-lg rounded-xl border p-6 shadow-sm"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm text-muted-foreground mb-2">{stat.title}</h3>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-semibold">{stat.value}</p>
                  <span className={`text-sm ${
                    stat.trend === 'positive' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-primary/10">
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* User List Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-background/80 backdrop-blur-lg rounded-xl border shadow-sm"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Registered Users
            </h2>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* User Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {users.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border rounded-lg p-4 hover:shadow-md transition-all group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* User Avatar */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-medium text-primary">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium">{user.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* User Details */}
                <div className="space-y-2 z-50">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <span className={`text-sm ${
                      user.isVerified ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {user.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Joined</span>
                    <span className="text-sm">
                      {format(new Date(user.createdAt), 'PP')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Last Transaction</span>
                    <span className="text-sm">
                      {user.transactions && user.transactions.length > 0 
                        ? format(new Date(user.transactions[0].timestamp), 'PP')
                        : 'No transactions'
                      }
                    </span>
                  </div>
                </div>

                {/* Action Menu */}
                <div className="mt-4 pt-4 border-t relative z-50">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => window.location.href = `/admin/users/${user.id}`}
                      className="text-xs px-2 py-1 rounded-md bg-accent hover:bg-accent/80 transition-colors"
                    >
                      View Profile
                    </button>
                    <button 
                      onClick={() => window.location.href = `/admin/users/${user.id}/edit`}
                      className="text-xs px-2 py-1 rounded-md bg-accent hover:bg-accent/80 transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => {
                        setDeleteUser(user);
                        setIsDeleteModalOpen(true);
                      }}
                      className="text-xs px-2 py-1 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <Dialog 
        open={isDeleteModalOpen} 
        onOpenChange={(open) => {
          setIsDeleteModalOpen(open);
          if (!open) setDeleteUser(null);
        }}
      >
        {deleteUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
              <p className="mb-4">Are you sure you want to delete {deleteUser.name}? This action cannot be undone.</p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteUser(deleteUser.id)}
                >
                  Delete User
                </Button>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* Add the modal */}
      <UserDetailsModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
      />
    </div>
  );
}