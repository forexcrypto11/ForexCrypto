"use client";

import { motion } from "framer-motion";
import { Users, Activity, Wallet, Coins, Clock, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/auth-context";
import { useRouter } from "next/navigation";
import { LoadingBar } from "@/components/loading-bar";
import Link from "next/link";

type AdminDashboardData = {
  stats: Array<{
    title: string;
    value: string;
    change: string;
    color: string;
    icon: string;
  }>;
  recentWithdrawals: Array<{
    id: string;
    user: string;
    amount: string;
    date: string;
    status: string;
  }>;
  pendingLoans: Array<{
    id: string;
    user: string;
    amount: string;
    leverage: string;
    date: string;
  }>;
};

export default function AdminDashboard() {
  const { userId, role } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Redirect if not admin
    if (role && role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    const fetchAdminDashboard = async () => {
      if (!userId) return;

      try {
        const response = await fetch('/api/admin/dashboard', {
          headers: {
            'X-User-Id': userId
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        } else {
          console.error('Failed to fetch admin dashboard data');
        }
      } catch (error) {
        console.error('Error fetching admin dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminDashboard();
  }, [userId, role, router]);

  // Function to get the appropriate icon component
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Users': return <Users className="h-6 w-6 text-primary" />;
      case 'Activity': return <Activity className="h-6 w-6 text-primary" />;
      case 'Wallet': return <Wallet className="h-6 w-6 text-primary" />;
      case 'Coins': return <Coins className="h-6 w-6 text-primary" />;
      default: return <Activity className="h-6 w-6 text-primary" />;
    }
  };

  // Handle approval/rejection of withdrawals
  const handleWithdrawalAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/admin/withdrawals/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId || ''
        },
        body: JSON.stringify({ action })
      });
      
      if (response.ok) {
        // Refresh dashboard data
        const updatedWithdrawals = dashboardData?.recentWithdrawals.map(withdrawal => 
          withdrawal.id === id 
            ? { ...withdrawal, status: action === 'approve' ? 'Approved' : 'Rejected' } 
            : withdrawal
        ) || [];
        
        setDashboardData(prev => prev ? {
          ...prev,
          recentWithdrawals: updatedWithdrawals
        } : null);
      }
    } catch (error) {
      console.error(`Failed to ${action} withdrawal:`, error);
    }
  };

  // Handle approval/rejection of loans
  const handleLoanAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/admin/loans/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId || ''
        },
        body: JSON.stringify({ action })
      });
      
      if (response.ok) {
        // Refresh dashboard data
        const updatedLoans = dashboardData?.pendingLoans.filter(loan => loan.id !== id) || [];
        
        setDashboardData(prev => prev ? {
          ...prev,
          pendingLoans: updatedLoans
        } : null);
      }
    } catch (error) {
      console.error(`Failed to ${action} loan:`, error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading admin dashboard...</div>;
  }

  return (
    <div className="space-y-6 p-4 md:p-6 -mt-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-primary mb-6">Admin Dashboard</h1>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardData?.stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-background/80 backdrop-blur-lg rounded-xl border p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="text-2xl font-semibold">{stat.value}</p>
                  <span className={`text-sm ${stat.color}`}>{stat.change}</span>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-primary/10">
                {getIconComponent(stat.icon)}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pending Withdrawals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-background/50 backdrop-blur-lg rounded-xl border p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Withdrawal Requests
          </h3>
          <div className="space-y-4">
            {dashboardData?.recentWithdrawals.map((withdrawal) => (
              <div key={withdrawal.id} className="flex justify-between items-center p-3 hover:bg-accent/10 rounded-lg">
                <div>
                  <p className="font-medium">{withdrawal.user}</p>
                  <p className="text-sm text-muted-foreground">{withdrawal.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{withdrawal.amount}</p>
                  <div className="flex gap-2 mt-1">
                    {withdrawal.status === 'Pending' ? (
                      <>
                        <button 
                          onClick={() => handleWithdrawalAction(withdrawal.id, 'approve')}
                          className="text-xs px-2 py-1 rounded-lg bg-green-400/10 text-green-400 hover:bg-green-400/20"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleWithdrawalAction(withdrawal.id, 'reject')}
                          className="text-xs px-2 py-1 rounded-lg bg-red-400/10 text-red-400 hover:bg-red-400/20"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className={`text-sm ${
                        withdrawal.status === 'Approved' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {withdrawal.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {(!dashboardData?.recentWithdrawals || dashboardData.recentWithdrawals.length === 0) && (
              <p className="text-center text-muted-foreground">No pending withdrawal requests</p>
            )}
          </div>
        </motion.div>

        {/* Pending Loans */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-background/50 backdrop-blur-lg rounded-xl border p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Pending Loan Applications
          </h3>
          <div className="space-y-4">
            {dashboardData?.pendingLoans.map((loan) => (
              <div key={loan.id} className="flex justify-between items-center p-3 hover:bg-accent/10 rounded-lg">
                <div>
                  <p className="font-medium">{loan.user}</p>
                  <p className="text-sm text-muted-foreground">Leverage: {loan.leverage}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{loan.amount}</p>
                  <div className="flex gap-2 mt-1">
                    <button 
                      onClick={() => handleLoanAction(loan.id, 'approve')}
                      className="text-xs px-2 py-1 rounded-lg bg-green-400/10 text-green-400 hover:bg-green-400/20"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleLoanAction(loan.id, 'reject')}
                      className="text-xs px-2 py-1 rounded-lg bg-red-400/10 text-red-400 hover:bg-red-400/20"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {(!dashboardData?.pendingLoans || dashboardData.pendingLoans.length === 0) && (
              <p className="text-center text-muted-foreground">No pending loan applications</p>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-background/50 backdrop-blur-lg rounded-xl border p-6 shadow-sm"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          {/* <ArrowUturnDown className="h-5 w-5 mr-3 text-blue-500" /> */}
          {/* <ArrowUturnUp className="h-5 w-5 mr-3 text-green-500" /> */}
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/withdraw-request"
            className="flex items-center px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            {/* <ArrowUturnDown className="h-5 w-5 mr-3 text-blue-500" /> */}
            <div>
              <h3 className="font-medium">Withdraw Requests</h3>
              <p className="text-sm text-gray-500">Manage user withdrawal requests</p>
            </div>
          </Link>

          <Link
            href="/admin/deposit-verification"
            className="flex items-center px-4 py-2 rounded-lg hover:bg-green-50 transition-colors"
          >
            {/* <ArrowUturnUp className="h-5 w-5 mr-3 text-green-500" /> */}
            <div>
              <h3 className="font-medium">Deposit Verification</h3>
              <p className="text-sm text-gray-500">Verify pending deposit requests</p>
            </div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}