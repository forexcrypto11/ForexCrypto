"use client";

import { motion } from "framer-motion";
import TradingViewWidget from "@/components/trading-view-widget";
import { 
  IndianRupee, ArrowUpRight, ArrowDownRight, TrendingUp, 
  TrendingDown, RefreshCw, AlertCircle, Clock, BarChart3,
  History, Coins, Briefcase
} from "lucide-react";
import { useEffect, useState, useCallback, useMemo, memo } from "react";
import { useAuth } from "@/app/auth-context";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { useDashboardData } from "@/app/utils/use-dashboard-data";
import { DashboardData, Order } from "@/app/utils/use-socket";

// Add a memoized StatCard component 
const StatCard = memo(({ stat, index }: { stat: any, index: number }) => {
  return (
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
  );
});
StatCard.displayName = 'StatCard';

// Add a memoized TransactionItem component
const TransactionItem = memo(({ transaction }: { transaction: any }) => {
  return (
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
  );
});
TransactionItem.displayName = 'TransactionItem';

// Add a memoized PositionItem component
const PositionItem = memo(({ position }: { position: any }) => {
  return (
    <div 
      key={position.id} 
      className="grid grid-cols-5 gap-4 p-4 border-b last:border-0 items-center"
    >
      <div className="font-medium">{position.symbol}</div>
      <div className="text-sm">
        <span className={position.type === 'LONG' || position.type === 'BUY' ? 
          "text-green-500 flex items-center gap-1" : 
          "text-red-500 flex items-center gap-1"}>
          {position.type === 'LONG' || position.type === 'BUY' ? 
            <TrendingUp className="h-4 w-4" /> : 
            <TrendingDown className="h-4 w-4" />} 
          {position.type}
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
  );
});
PositionItem.displayName = 'PositionItem';

// Dashboard page component with real data from database
export default function DashboardPage() {
  const { userId } = useAuth();
  const router = useRouter();
  
  // Component state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [pendingUpdates, setPendingUpdates] = useState<Partial<DashboardData>>({});
  
  // Use the optimized REST API hook for real database data
  const { 
    isConnected, 
    isLoading, 
    error: apiError, 
    dashboardData, 
    ordersData, 
    refreshData,
    lastUpdated 
  } = useDashboardData();
  
  // Calculate frontend-derived values from real API data
  const ordersApiTotalProfitLoss = ordersData?.totalProfitLoss ?? 0;
  const ordersApiOpenPositionsPL = ordersData?.openPositionsProfitLoss ?? 0;
  const ordersApiClosedPositionsPL = ordersData?.closedPositionsProfitLoss ?? 0;
  
  // Derived values from orders data - using tradeAmount for accurate calculations
  const apiOrders = ordersData?.orders || [];
  const apiOpenTradesCount = apiOrders.filter((order: Order) => order.status === "OPEN").length;
  const openTradesInvestment = apiOrders
    .filter((order: Order) => order.status === "OPEN")
    .reduce((sum: number, order: Order) => sum + (order.tradeAmount || 0), 0);
  const totalInvestment = apiOrders.reduce((sum: number, order: Order) => 
    sum + (order.tradeAmount || 0), 0);
  
  // Optimistically merged data with pending updates and latest API data
  const displayData = useMemo(() => {
    return dashboardData ? { 
      ...dashboardData, 
      ...pendingUpdates,
      // Override with the latest API data calculation
      totalProfitLoss: ordersApiTotalProfitLoss,
      openPositionsProfitLoss: ordersApiOpenPositionsPL,
      closedPositionsProfitLoss: ordersApiClosedPositionsPL,
    } : null;
  }, [dashboardData, pendingUpdates, ordersApiTotalProfitLoss, ordersApiOpenPositionsPL, ordersApiClosedPositionsPL]);
  
  // Handle refresh with loading indicator
  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await refreshData();
      
      toast({
        title: "Dashboard Updated",
        description: "Latest data has been loaded from the database.",
        duration: 3000,
      });
      
      // Add a timeout to ensure the refresh indicator shows for a minimum time
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Update Failed",
        description: "Could not refresh dashboard data.",
        variant: "destructive",
        duration: 3000,
      });
      setIsRefreshing(false);
    }
  }, [refreshData]);
  
  // Calculate derived values from real data
  const profitLoss = displayData?.totalProfitLoss ?? 0;
  const profitLossPercentage = displayData?.baseAccountBalance && displayData.baseAccountBalance > 0
    ? ((profitLoss / displayData.baseAccountBalance) * 100).toFixed(2) + '%'
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

  // Stats configuration with real data
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

    if (displayData?.totalOpenOrdersAmount && displayData.totalOpenOrdersAmount > 0) {
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
  const hasError = apiError;

  // Skeleton loading UI component for a faster perceived loading experience
  if (isLoading && !dashboardData && !ordersData) {
    return (
      <div className="space-y-6 p-4 md:p-6 -mt-4">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-muted animate-pulse rounded-md"></div>
            <div className="h-4 w-32 bg-muted animate-pulse rounded-md"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-muted animate-pulse rounded-md"></div>
            <div className="h-10 w-24 bg-muted animate-pulse rounded-md"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-muted h-32 animate-pulse rounded-xl"></div>
          ))}
        </div>
        
        <div className="bg-muted h-96 animate-pulse rounded-xl"></div>
      </div>
    );
  }

  if (hasError) {
    // Log the errors for better debugging
    console.error("Data fetch error:", apiError);
    
    // More descriptive error UI
    return (
      <div className="flex justify-center items-center h-[60vh] flex-col">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Connection Issue</h3>
          <p className="text-muted-foreground mb-6">We&apos;re having trouble loading your dashboard data. This might be due to network issues or server load.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
        
        <p className="text-amber-500 mt-4 text-sm">
          {apiError.message || "Unable to establish a connection to the server"}
        </p>
        
        <Button 
          variant="default"
          className="mt-4 bg-blue-500 hover:bg-blue-600"
          onClick={() => window.location.reload()}
        >
          Reload Page
        </Button>
      </div>
    );
  }

  // Show a connection status indicator
  const connectionStatus = (
    <div className={`fixed bottom-4 right-4 z-50 px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-medium ${
      isConnected ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                   'bg-red-500/10 text-red-500 border border-red-500/20'
    }`}>
      <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
      {isConnected ? 'Live Data' : 'Reconnecting...'}
    </div>
  );

  return (
    <div className="space-y-6 p-4 md:p-6 -mt-4 relative">
      {connectionStatus}
      
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
            disabled={isRefreshing || !isConnected}
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
          <StatCard key={stat.title} stat={stat} index={index} />
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
                    {ordersApiClosedPositionsPL >= 0 ? '+' : '-'}₹{Math.abs(ordersApiClosedPositionsPL || 0).toLocaleString()}
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
                {displayData?.recentTransactions?.length ? (
                  displayData.recentTransactions.map((transaction) => (
                    <TransactionItem key={transaction.id} transaction={transaction} />
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
                {((displayData?.openPositions || [])?.length) ? (
                  (displayData?.openPositions || []).map((position) => (
                    <PositionItem key={position.id} position={position} />
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
    </div>
  );
} 