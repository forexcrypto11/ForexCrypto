"use client";

import { motion } from "framer-motion";
import TradingViewWidget from "@/components/trading-view-widget";
import { 
  IndianRupee, ArrowUpRight, ArrowDownRight, TrendingUp, 
  TrendingDown, RefreshCw, AlertCircle, Clock, BarChart3,
  History, Coins, Briefcase
} from "lucide-react";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useAuth } from "@/app/auth-context";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import useSWR from "swr";

type DashboardData = {
  accountBalance: number;
  baseAccountBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  openPositionsProfitLoss: number;
  closedPositionsProfitLoss: number;
  totalProfitLoss: number;
  totalTrades: number;
  totalVolume: number;
  approvedLoanAmount: number;
  totalOpenOrdersAmount: number;
  totalClosedOrdersAmount: number;
  totalOrdersAmount: number;
  approvedLoanDetails?: {
    amount: number;
    duration: number;
    updatedAt: string;
  } | null;
  recentTransactions: Array<{
    id: string;
    type: 'DEPOSIT' | 'WITHDRAW';
    amount: number;
    timestamp: string;
    status: string;
    verified: boolean;
  }>;
  openPositions: Array<{
    id: string;
    symbol: string;
    type: string;
    profitLoss: number;
    tradeDate: string;
    quantity: number;
    buyPrice: number;
  }>;
  closedPositions: Array<{
    id: string;
    symbol: string;
    type: string;
    profitLoss: number;
    tradeDate: string;
    quantity: number;
    buyPrice: number;
    sellPrice: number;
  }>;
};

type Order = {
  id: string;
  status: 'OPEN' | 'CLOSED';
  quantity: number;
  buyPrice: number;
  symbol: string;
  type: string;
  profitLoss: number;
  tradeDate: string;
};

type OrdersResponse = {
  orders: Order[];
  totalProfitLoss: number;
  closedPositionsProfitLoss: number;
  openPositionsProfitLoss: number;
};

export default function DashboardPage() {
  const { userId } = useAuth();
  const router = useRouter();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [pendingUpdates, setPendingUpdates] = useState<Partial<DashboardData>>({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Optimized data fetching with SWR
  const { data: dashboardData, error: dashboardError, mutate: mutateDashboard, isLoading: isDashboardLoading } = useSWR<DashboardData>(
    userId ? '/api/user/dashboard' : null,
    async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const res = await fetch(`/api/user/dashboard`, {
          headers: { 
            'X-User-Id': userId || '',
            'Cache-Control': 'no-cache'
          },
          next: { revalidate: 30 },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!res.ok) throw new Error(`Failed to fetch dashboard data: ${res.status}`);
        const { dashboardData } = await res.json();
        return dashboardData;
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
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
        setIsInitialLoad(false);
      },
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      shouldRetryOnError: true,
      keepPreviousData: true
    }
  );
  
  // Fetch orders data in parallel with dashboard data
  const { data: ordersData, error: ordersError, mutate: mutateOrders, isLoading: isOrdersLoading } = useSWR<OrdersResponse>(
    userId ? '/api/orders' : null,
    async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // Reduced timeout to 8 seconds
        
        const response = await fetch('/api/orders', {
          headers: {
            'x-user-id': userId || '',
            'Cache-Control': 'no-cache'
          },
          next: { revalidate: 30 }, // Enable Next.js ISR caching
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error(`Failed to fetch orders data: ${response.status}`);
        return response.json();
      } catch (error) {
        console.error("Failed to fetch profit/loss data:", error);
        throw error;
      }
    },
    {
      dedupingInterval: 10000, // 10 seconds
      focusThrottleInterval: 5000,
      revalidateOnFocus: false,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      shouldRetryOnError: true,
      keepPreviousData: true // Keep showing previous data while loading new data
    }
  );
  
  // Calculate frontend-derived values from API
  const ordersApiTotalProfitLoss = ordersData?.totalProfitLoss ?? 0;
  const ordersApiOpenPositionsPL = ordersData?.openPositionsProfitLoss ?? 0;
  const ordersApiClosedPositionsPL = ordersData?.closedPositionsProfitLoss ?? 0;
  
  // Derived values from orders data
  const apiOrders = ordersData?.orders || [];
  const apiOpenTradesCount = apiOrders.filter((order: Order) => order.status === "OPEN").length;
  const openTradesInvestment = apiOrders
    .filter((order: Order) => order.status === "OPEN")
    .reduce((sum: number, order: Order) => sum + (order.quantity * order.buyPrice), 0);
  const totalInvestment = apiOrders.reduce((sum: number, order: Order) => 
    sum + (order.quantity * order.buyPrice), 0);
  
  // Optimistically merged data
  const displayData = useMemo(() => {
    return dashboardData ? { 
      ...dashboardData, 
      ...pendingUpdates,
      // Override the backend profit/loss with our consistent calculation
      totalProfitLoss: ordersApiTotalProfitLoss,
      openPositionsProfitLoss: ordersApiOpenPositionsPL,
      closedPositionsProfitLoss: ordersApiClosedPositionsPL,
    } : null;
  }, [dashboardData, pendingUpdates, ordersApiTotalProfitLoss, ordersApiOpenPositionsPL, ordersApiClosedPositionsPL]);
  
  // Handle refresh - mutate both data sources simultaneously
  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await Promise.all([
        mutateDashboard(),
        mutateOrders()
      ]);
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
  }, [mutateDashboard, mutateOrders]);
  
  // Optimistic update handler
  const handleOptimisticUpdate = (updates: Partial<DashboardData>) => {
    setPendingUpdates(prev => ({ ...prev, ...updates }));
    
    // Immediate optimistic update followed by background revalidation
    setTimeout(() => {
      Promise.all([mutateDashboard(), mutateOrders()]).catch(() => {
        // Revert if update fails
        setPendingUpdates(prev => {
          const reverted = { ...prev };
          Object.keys(updates).forEach(key => delete reverted[key as keyof DashboardData]);
          return reverted;
        });
      });
    }, 300);
  };
  
  // Update derived calculations on data change
  useEffect(() => {
    if (!userId) return;
    
    // Set up periodic refresh in background
    const interval = setInterval(() => {
      mutateDashboard();
      mutateOrders();
    }, 30000); // 30 second refresh

    return () => clearInterval(interval);
  }, [userId, mutateDashboard, mutateOrders]);

  // Calculate derived values
  const profitLoss = displayData?.totalProfitLoss ?? 0;
  const profitLossPercentage = displayData?.accountBalance 
    ? ((profitLoss / displayData.accountBalance) * 100).toFixed(2) + '%'
    : '0%';

  const totalFinancialActivity = (displayData?.totalDeposits || 0) + (displayData?.totalWithdrawals || 0);
  const depositPercentage = totalFinancialActivity > 0 
    ? ((displayData?.totalDeposits || 0) / totalFinancialActivity) * 100 
    : 0;

  const hasPendingTransactions = displayData?.recentTransactions?.some(
    transaction => transaction.status === 'PENDING'
  );

  const formattedLastUpdated = lastUpdated 
    ? `Last updated: ${lastUpdated.toLocaleTimeString()}`
    : 'Updating...';

  // Stats configuration - improved to never show "₹0" when loading
  const stats = useMemo(() => {
    const baseStats = [
      { 
        title: "Account Balance", 
        value: displayData ? `₹${((displayData.baseAccountBalance || 0) + 
                               (displayData.approvedLoanAmount || 0) - 
                               (displayData.totalOpenOrdersAmount || 0) + 
                               (displayData.totalProfitLoss || 0)).toLocaleString()}` : "Loading...", 
        color: "text-green-400",
        icon: <IndianRupee className="h-5 w-5 text-primary" />,
        tooltip: "Base Balance + Loan - Open Orders + Profit/Loss",
        isLoading: !displayData
      },
      { 
        title: "Total Deposits", 
        value: displayData ? `₹${(displayData.totalDeposits || 0).toLocaleString()}` : "Loading...", 
        color: "text-green-400",
        icon: <TrendingUp className="h-5 w-5 text-primary" />,
        isLoading: !displayData
      },
      { 
        title: "Total Withdrawals", 
        value: displayData ? `₹${(displayData.totalWithdrawals || 0).toLocaleString()}` : "Loading...", 
        color: "text-green-400",
        icon: <ArrowUpRight className="h-5 w-5 text-primary" />,
        isLoading: !displayData
      },
      { 
        title: "Profit/Loss", 
        value: displayData ? `₹${(displayData.totalProfitLoss || 0).toLocaleString()}` : "Loading...", 
        change: profitLossPercentage,
        color: profitLoss >= 0 ? "text-green-400" : "text-red-400",
        icon: profitLoss >= 0 ? 
          <TrendingUp className="h-5 w-5 text-primary" /> : 
          <TrendingDown className="h-5 w-5 text-primary" />,
        isLoading: !displayData
      }
    ];

    if (displayData?.approvedLoanAmount) {
      baseStats.push({
        title: "Approved Loan", 
        value: `₹${(displayData.approvedLoanAmount || 0).toLocaleString()}`, 
        color: "text-blue-400",
        icon: <Coins className="h-5 w-5 text-primary" />,
        isLoading: !displayData
      });
    }

    if (displayData?.totalOrdersAmount) {
      baseStats.push({
        title: "Order Investments", 
        value: `₹${(openTradesInvestment || 0).toLocaleString()}`, 
        color: "text-blue-400",
        icon: <Briefcase className="h-5 w-5 text-primary" />,
        tooltip: `${apiOpenTradesCount || 0} open trades`,
        isLoading: !displayData
      });
    }

    return baseStats;
  }, [displayData, profitLoss, profitLossPercentage, apiOpenTradesCount, openTradesInvestment]);

  // Loading states and error handling
  const isLoading = (isDashboardLoading || isOrdersLoading) && !dashboardError && !ordersError;
  const hasError = dashboardError || ordersError;

  // Memoized account balance calculation
  const accountBalance = useMemo(() => {
    if (isInitialLoad || isDashboardLoading) return null;
    
    const baseBalance = displayData?.baseAccountBalance ?? 0;
    const profitLoss = displayData?.totalProfitLoss ?? 0;
    return baseBalance + profitLoss;
  }, [displayData?.baseAccountBalance, displayData?.totalProfitLoss, isInitialLoad, isDashboardLoading]);

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
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
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
          <h1 className="text-3xl font-bold text-primary">Dashboard Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">{formattedLastUpdated}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <Button 
            onClick={handleRefresh}
            variant="outline"
            disabled={isRefreshing}
            className="flex items-center justify-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <div className="flex gap-2 sm:gap-4">
            <Button 
              onClick={() => router.push('/dashboard/deposit')}
              className="flex-1 sm:flex-none bg-green-500 hover:bg-green-600"
            >
              Deposit
            </Button>
            <Button 
              onClick={() => router.push('/dashboard/withdraw')}
              className="flex-1 sm:flex-none bg-primary hover:bg-primary/90"
            >
              Withdraw
            </Button>
          </div>
        </div>
      </motion.div>

      {hasPendingTransactions && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 p-4 rounded-lg flex items-center gap-3"
        >
          <AlertCircle className="h-5 w-5" />
          <p>You have pending transactions. These may take some time to process.</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
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
                  {stat.isLoading ? (
                    <div className="h-8 w-24 bg-muted animate-pulse rounded-md"></div>
                  ) : (
                    <>
                  <p className="text-2xl font-semibold">{stat.value}</p>
                  {stat.change && (
                    <span className={`text-sm ${stat.color}`}>{stat.change}</span>
                      )}
                    </>
                  )}
                </div>
                {stat.tooltip && (
                  <p className="text-xs text-muted-foreground mt-1">{stat.tooltip}</p>
                )}
              </div>
              <div className="p-2 rounded-lg bg-primary/10">
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs for different dashboard views */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="positions" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Positions
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Trading Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-background/80 backdrop-blur-lg rounded-xl border p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Trades</p>
                  <p className="text-2xl font-semibold mt-2">{(dashboardData?.totalTrades || 0)}</p>
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
                  <p className="text-sm text-muted-foreground">Total Investment Done</p>
                  <p className="text-2xl font-semibold mt-2">₹{(totalInvestment || 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {apiOpenTradesCount || 0} open trades
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-background/80 backdrop-blur-lg rounded-xl border p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Closed Positions P&L</p>
                  <p className={`text-2xl font-semibold mt-2 ${
                    ordersApiClosedPositionsPL >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    ₹{Math.abs(ordersApiClosedPositionsPL).toLocaleString()}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10">
                  {ordersApiClosedPositionsPL >= 0 ? (
                    <ArrowUpRight className="h-6 w-6 text-green-400" />
                  ) : (
                    <ArrowDownRight className="h-6 w-6 text-red-400" />
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Loan Alert for Approved Loans */}
          {dashboardData && dashboardData.approvedLoanAmount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-500/10 border border-blue-500/30 text-blue-500 p-4 rounded-lg flex items-center gap-3"
            >
              <Coins className="h-5 w-5" />
              <div>
                <p className="font-medium">Loan Approved</p>
                <p className="text-sm">Your loan request for ₹{dashboardData.approvedLoanAmount.toLocaleString()} has been approved and added to your account balance.</p>
              </div>
            </motion.div>
          )}
          
          {/* Deposits vs Withdrawals Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Deposits vs Withdrawals</CardTitle>
              <CardDescription>Transaction activity breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span>Deposits</span>
                    </div>
                    <span className="text-sm font-medium">
                      ₹{(dashboardData?.totalDeposits || 0).toLocaleString()}
                    </span>
                  </div>
                  <Progress value={depositPercentage} className="h-2 bg-muted" indicatorClassName="bg-green-500" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <span>Withdrawals</span>
                    </div>
                    <span className="text-sm font-medium">
                      ₹{(dashboardData?.totalWithdrawals || 0).toLocaleString()}
                    </span>
                  </div>
                  <Progress value={100 - depositPercentage} className="h-2 bg-muted" indicatorClassName="bg-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Activity Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Activity</CardTitle>
              <CardDescription>Account Balance Breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span>Base Balance (Deposits - Withdrawals)</span>
                    </div>
                    <span className="text-sm font-medium">
                      ₹{(dashboardData?.baseAccountBalance || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                {dashboardData?.approvedLoanAmount ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                        <span>Loan Amount</span>
                      </div>
                      <span className="text-sm font-medium">
                        +₹{(dashboardData?.approvedLoanAmount || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ) : null}
                
                {dashboardData?.totalOpenOrdersAmount ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                        <span>Open Order Investments</span>
                      </div>
                      <span className="text-sm font-medium">
                        -₹{(openTradesInvestment || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground pl-5">
                      {apiOpenTradesCount || 0} open trades (₹{(openTradesInvestment || 0).toLocaleString()})
                    </div>
                  </div>
                ) : null}

                {dashboardData?.totalClosedOrdersAmount ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                        <span>Closed Order Investments</span>
                      </div>
                      <span className="text-sm font-medium">
                        ₹{(dashboardData?.totalClosedOrdersAmount || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ) : null}

                {displayData?.totalProfitLoss !== undefined && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${(displayData?.totalProfitLoss || 0) >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span>Profit/Loss</span>
                      </div>
                      <span className={`text-sm font-medium ${(displayData?.totalProfitLoss || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {(displayData?.totalProfitLoss || 0) >= 0 ? '+' : '-'}₹{Math.abs(displayData?.totalProfitLoss || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex flex-col pl-5 text-xs text-muted-foreground">
                      <span>Closed positions: {(ordersApiClosedPositionsPL || 0) >= 0 ? '+' : '-'}₹{Math.abs(ordersApiClosedPositionsPL || 0).toLocaleString()}</span>
                      <span>Open positions: {(ordersApiOpenPositionsPL || 0) >= 0 ? '+' : '-'}₹{Math.abs(ordersApiOpenPositionsPL || 0).toLocaleString()}</span>
                    </div>
                  </div>
                )}
                
                <div className="pt-2 mt-2 border-t border-dashed">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold">
                      <span>Available Balance</span>
                    </div>
                    {accountBalance !== null ? (
                      <span className="font-semibold">
                        ₹{accountBalance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </span>
                    ) : (
                      <div className="h-6 w-32 animate-pulse bg-gray-200 rounded" />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-background/50 backdrop-blur-lg rounded-xl border p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
              <div className="space-y-4">
                {(dashboardData?.recentTransactions || [])?.map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center p-3 hover:bg-accent/10 rounded-lg">
                    <div>
                      <p className="font-medium">{transaction.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm ${transaction.type === 'DEPOSIT' ? 'text-green-400' : 'text-red-400'}`}>
                        {transaction.type === 'DEPOSIT' ? '+' : '-'}₹{(transaction.amount || 0).toLocaleString()}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {transaction.status === 'COMPLETED' ? (
                          <span className={`text-green-400 ${transaction.type === 'DEPOSIT' && !transaction.verified ? 'flex items-center gap-1' : ''}`}>
                            {transaction.type === 'DEPOSIT' && !transaction.verified ? (
                              <>
                                <AlertCircle className="h-3 w-3" /> Verification Pending
                              </>
                            ) : 'Completed'}
                          </span>
                        ) : (
                          <span className="text-red-400">Failed</span>
                        )}
                      </p>
                    </div>
                  </div>
                )) || (
                  <p className="text-muted-foreground text-center">No recent transactions</p>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-background/50 backdrop-blur-lg rounded-xl border p-6 shadow-sm"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Open Positions</h3>
                {apiOpenTradesCount > 0 && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">{apiOpenTradesCount} trades</span> · 
                    <span className="font-medium ml-1">₹{openTradesInvestment.toLocaleString()}</span> invested
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {((dashboardData?.openPositions || [])?.length) ? (
                  (dashboardData?.openPositions || []).map((position) => (
                    <div 
                      key={position.id} 
                      className="grid grid-cols-5 gap-4 p-4 border-b last:border-0 items-center"
                    >
                      <div className="font-medium">{position.symbol}</div>
                      <div className="text-sm">
                        <span className="text-green-500 flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" /> {position.type}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">
                          {position.quantity} @ ₹{(position.buyPrice || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm">
                        {new Date(position.tradeDate).toLocaleDateString()}
                      </div>
                      <div className={`text-right font-medium ${
                        (position.profitLoss || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {(position.profitLoss || 0) >= 0 ? '+' : '-'}₹{Math.abs(position.profitLoss || 0).toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No open positions
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>View all your deposits and withdrawals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.recentTransactions?.length ? (
                  dashboardData.recentTransactions.map((transaction) => (
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
                          {new Date(transaction.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          transaction.type === 'DEPOSIT' ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {transaction.type === 'DEPOSIT' ? '+' : '-'}₹{(transaction.amount || 0).toLocaleString()}
                        </p>
                        <p className={`text-xs ${
                          transaction.status === 'COMPLETED' ? 
                            (transaction.type === 'DEPOSIT' && !transaction.verified ? 'text-yellow-500' : 'text-green-500') : 
                            transaction.status === 'PENDING' ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                          {transaction.status === 'COMPLETED' && transaction.type === 'DEPOSIT' && !transaction.verified ? 
                            'Verification Pending' : transaction.status}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No transaction history available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Positions Tab */}
        <TabsContent value="positions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Trading Positions</CardTitle>
                <CardDescription>Your current open positions</CardDescription>
              </div>
              {apiOpenTradesCount > 0 && (
                <div className="text-sm border border-primary/20 bg-primary/5 rounded-md px-3 py-1">
                  <span className="font-medium text-primary">{apiOpenTradesCount} open trades</span>
                  <span className="text-muted-foreground"> · </span>
                  <span className="font-medium text-primary">₹{openTradesInvestment.toLocaleString()}</span>
                  <span className="text-muted-foreground"> invested</span>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {((dashboardData?.openPositions || [])?.length) ? (
                  (dashboardData?.openPositions || []).map((position) => (
                    <div 
                      key={position.id} 
                      className="grid grid-cols-5 gap-4 p-4 border-b last:border-0 items-center"
                    >
                      <div className="font-medium">{position.symbol}</div>
                      <div className="text-sm">
                        <span className="text-green-500 flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" /> {position.type}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">
                          {position.quantity} @ ₹{(position.buyPrice || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm">
                        {new Date(position.tradeDate).toLocaleDateString()}
                      </div>
                      <div className={`text-right font-medium ${
                        (position.profitLoss || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {(position.profitLoss || 0) >= 0 ? '+' : '-'}₹{Math.abs(position.profitLoss || 0).toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No open positions
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Chart Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-background/50 backdrop-blur-lg rounded-xl border shadow-sm h-[600px]"
      >
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Live Market Chart</h3>
        </div>
        <div className="h-[calc(100%-56px)] p-4">
          <TradingViewWidget />
        </div>
      </motion.div>
    </div>
  );
}