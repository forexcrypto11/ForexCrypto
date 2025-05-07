"use client";

import { motion } from "framer-motion";
import { 
  Users, Activity, Wallet, Coins, Clock, AlertTriangle, 
  TrendingUp, TrendingDown, RefreshCw, BarChart3, History 
} from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/app/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import useSWR from "swr";

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
  pendingLoanRequests: Array<{
    id: string;
    user: string;
    amount: string;
    leverage: string;
    date: string;
  }>;
  totalUsers: number;
  activeUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  pendingWithdrawals: number;
  pendingLoansCount: number;
  recentTransactions: Array<{
    id: string;
    type: 'DEPOSIT' | 'WITHDRAW';
    amount: number;
    timestamp: string;
    status: string;
    user: string;
  }>;
};

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
    <div className="w-full h-1 fixed top-0 left-0 z-50 bg-green-50 overflow-hidden">
      <div 
        className="h-full bg-green-500 transition-all duration-300 ease-out" 
        style={{ 
          width: `${progress}%`,
          background: "linear-gradient(90deg, rgba(74,222,128,1) 0%, rgba(34,197,94,1) 50%, rgba(22,163,74,1) 100%)"
        }}
      />
    </div>
  );
}

export default function AdminDashboard() {
  const { userId, role } = useAuth();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Optimized data fetching with SWR
  const { data: dashboardData, error: dashboardError, mutate: mutateDashboard, isLoading: isDashboardLoading } = useSWR<AdminDashboardData>(
    userId && role === 'admin' ? '/api/admin/dashboard' : null,
    async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const res = await fetch(`/api/admin/dashboard`, {
          headers: { 
            'X-User-Id': userId || '',
            'Cache-Control': 'no-cache'
          },
          next: { revalidate: 30 },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!res.ok) throw new Error(`Failed to fetch admin dashboard data: ${res.status}`);
        const data = await res.json();
        return data;
      } catch (error) {
        console.error('Failed to fetch admin dashboard data:', error);
        throw error;
      }
    },
    {
      dedupingInterval: 10000,
      focusThrottleInterval: 5000,
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateIfStale: true,
      onSuccess: () => {
        setLastUpdated(new Date());
      },
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      shouldRetryOnError: true,
      keepPreviousData: true
    }
  );

  useEffect(() => {
    if (role && role !== 'admin') {
      router.push('/dashboard');
    }
  }, [role, router]);

  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await mutateDashboard();
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Refresh failed:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh dashboard data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [mutateDashboard]);

  const handleWithdrawalAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      setIsActionLoading(true);
      const response = await fetch(`/api/admin/withdrawals/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId || ''
        },
        body: JSON.stringify({ action })
      });
      
      if (response.ok) {
        await mutateDashboard();
        toast({
          title: "Success",
          description: `Withdrawal ${action}ed successfully`,
          variant: "default"
        });
      }
    } catch (error) {
      console.error(`Failed to ${action} withdrawal:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} withdrawal. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleLoanAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      setIsActionLoading(true);
      const response = await fetch(`/api/admin/loans/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId || ''
        },
        body: JSON.stringify({ action })
      });
      
      if (response.ok) {
        await mutateDashboard();
        toast({
          title: "Success",
          description: `Loan ${action}ed successfully`,
          variant: "default"
        });
      }
    } catch (error) {
      console.error(`Failed to ${action} loan:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} loan. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Users': return <Users className="h-6 w-6 text-primary" />;
      case 'Activity': return <Activity className="h-6 w-6 text-primary" />;
      case 'Wallet': return <Wallet className="h-6 w-6 text-primary" />;
      case 'Coins': return <Coins className="h-6 w-6 text-primary" />;
      default: return <Activity className="h-6 w-6 text-primary" />;
    }
  };

  const formattedLastUpdated = lastUpdated 
    ? `Last updated: ${lastUpdated.toLocaleTimeString()}`
    : 'Updating...';

  // Show loading state
  if (isDashboardLoading && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show error state
  if (dashboardError && !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Failed to Load Dashboard</h2>
        <p className="text-gray-600 mb-4">Please try refreshing the page</p>
        <Button onClick={() => handleRefresh()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 -mt-4 relative">
      {isRefreshing && (
        <div className="w-full h-1 fixed top-0 left-0 z-50 bg-green-50 overflow-hidden">
          <div 
            className="h-full bg-green-500 transition-all duration-300 ease-out" 
            style={{ 
              width: '100%',
              background: "linear-gradient(90deg, rgba(74,222,128,1) 0%, rgba(34,197,94,1) 50%, rgba(22,163,74,1) 100%)",
              animation: 'progress 1.5s ease-in-out infinite',
            }}
          />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:justify-between md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">{formattedLastUpdated}</p>
        </div>
        <Button 
          onClick={handleRefresh}
          variant="outline"
          disabled={isRefreshing}
          className="flex items-center justify-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Withdrawal Requests
            </CardTitle>
            <CardDescription>Manage user withdrawal requests</CardDescription>
          </CardHeader>
          <CardContent>
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
                          <Button 
                            onClick={() => handleWithdrawalAction(withdrawal.id, 'approve')}
                            disabled={isActionLoading}
                            variant="outline"
                            size="sm"
                            className="text-green-500 hover:text-green-600 hover:bg-green-50"
                          >
                            Approve
                          </Button>
                          <Button 
                            onClick={() => handleWithdrawalAction(withdrawal.id, 'reject')}
                            disabled={isActionLoading}
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            Reject
                          </Button>
                        </>
                      ) : (
                        <span className={`text-sm ${
                          withdrawal.status === 'Approved' ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {withdrawal.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Loans */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Pending Loan Requests
            </CardTitle>
            <CardDescription>Manage user loan requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(dashboardData?.pendingLoanRequests || []).map((loan) => (
                <div key={loan.id} className="flex justify-between items-center p-3 hover:bg-accent/10 rounded-lg">
                  <div>
                    <p className="font-medium">{loan.user}</p>
                    <p className="text-sm text-muted-foreground">{loan.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{loan.amount}</p>
                    <p className="text-sm text-muted-foreground">Leverage: {loan.leverage}x</p>
                    <div className="flex gap-2 mt-1">
                      <Button 
                        onClick={() => handleLoanAction(loan.id, 'approve')}
                        disabled={isActionLoading}
                        variant="outline"
                        size="sm"
                        className="text-green-500 hover:text-green-600 hover:bg-green-50"
                      >
                        Approve
                      </Button>
                      <Button 
                        onClick={() => handleLoanAction(loan.id, 'reject')}
                        disabled={isActionLoading}
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {(!dashboardData?.pendingLoanRequests || dashboardData.pendingLoanRequests.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  No pending loan requests
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
          <CardDescription>View all recent user transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(dashboardData?.recentTransactions || []).length > 0 ? (
              (dashboardData?.recentTransactions || []).map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="flex justify-between items-center p-4 border-b last:border-0"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      {transaction.type === 'DEPOSIT' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <p className="font-medium">{transaction.type}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {transaction.user} · {new Date(transaction.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      transaction.type === 'DEPOSIT' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {transaction.type === 'DEPOSIT' ? '+' : '-'}₹{(transaction.amount || 0).toLocaleString()}
                    </p>
                    <p className={`text-xs ${
                      transaction.status === 'COMPLETED' ? 'text-green-500' : 
                      transaction.status === 'PENDING' ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                      {transaction.status}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No recent transactions
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}