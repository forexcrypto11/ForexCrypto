"use client";

import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { ArrowUp, ArrowDown, Calendar, Wallet, CreditCard } from "lucide-react";
import { useAuth } from "@/app/auth-context";
import { TransactionType, TransactionStatus } from "@prisma/client";
import { WithdrawalRequest } from "@/app/types/transaction";
import dynamic from 'next/dynamic';

// Dynamically import the component that fetches data
const TransactionList = dynamic(
  () => import('@/components/TransactionList'),
  { ssr: false }
);

// Loading Bar Component (Added for table loading)
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

export default function TransactionPage() {
  const [transactions, setTransactions] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { userId } = useAuth();

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/transactions?userId=${userId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch transactions');
        }

        if (data.success) {
          setTransactions(data.data.transactions);
        } else {
          throw new Error(data.error || 'Failed to fetch transactions');
        }
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [userId]);

  // Calculate totals
  const totalDeposits = transactions
    .filter(t => t.type === TransactionType.DEPOSIT && t.status !== TransactionStatus.FAILED)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawals = transactions
    .filter(t => t.type === TransactionType.WITHDRAW)
    .reduce((sum, t) => sum + t.amount, 0);

  const netCashFlow = totalDeposits - totalWithdrawals;

  const stats = [
    {
      title: "Total Deposits",
      value: `₹${totalDeposits.toLocaleString()}`,
      icon: <ArrowDown className="h-4 w-4 text-green-500" />,
      className: "text-green-500"
    },
    {
      title: "Total Withdrawals",
      value: `₹${totalWithdrawals.toLocaleString()}`,
      icon: <ArrowUp className="h-4 w-4 text-red-500" />,
      className: "text-red-500"
    },
    {
      title: "Net Cash Flow",
      value: `₹${netCashFlow.toLocaleString()}`,
      icon: <Wallet className="h-4 w-4" />,
      className: netCashFlow >= 0 ? "text-green-500" : "text-red-500"
    }
  ];

  if (!userId) {
    return <div>Please log in to view transactions</div>;
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-primary mb-6">Transaction History</h1>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-background/80 backdrop-blur-lg rounded-xl border p-6 shadow-sm"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className={`text-2xl font-semibold mt-1 ${stat.className}`}>
                  {stat.value}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-background/50">
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Transaction List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-background/80 backdrop-blur-lg rounded-xl border shadow-sm overflow-hidden"
      >
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Recent Transactions
          </h2>
        </div>

        {loading ? (
          <div className="space-y-4">
            {/* Loading Skeleton - similar to first example */}
            <div className="relative">
              <LoadingBar />
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-4 text-left text-muted-foreground">
                        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      </th>
                      <th className="p-4 text-left text-muted-foreground">
                        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      </th>
                      <th className="p-4 text-right text-muted-foreground">
                        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      </th>
                      <th className="p-4 text-left text-muted-foreground">
                        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-4">
                          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        </td>
                        <td className="p-4">
                          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        </td>
                        <td className="p-4">
                          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="text-center text-green-600 font-medium">Loading transaction data...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No transactions found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-4 text-left text-muted-foreground">Date</th>
                  <th className="p-4 text-left text-muted-foreground">Type</th>
                  <th className="p-4 text-right text-muted-foreground">Amount</th>
                  <th className="p-4 text-left text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction, idx) => (
                  <motion.tr
                    key={transaction.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b last:border-0 hover:bg-muted/50"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(transaction.timestamp).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        transaction.type === TransactionType.DEPOSIT 
                          ? 'bg-green-500/10 text-green-500' 
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {transaction.type === TransactionType.DEPOSIT ? 'Deposit' : 'Withdrawal'}
                      </span>
                    </td>
                    <td className={`p-4 text-right font-medium ${
                      transaction.type === TransactionType.DEPOSIT 
                        ? 'text-green-500' 
                        : 'text-red-500'
                    }`}>
                      {transaction.type === TransactionType.DEPOSIT ? '+' : '-'}
                      ₹{transaction.amount.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        transaction.status === TransactionStatus.COMPLETED 
                          ? 'bg-green-500/10 text-green-500'
                          : transaction.status === TransactionStatus.PENDING
                          ? 'bg-yellow-500/10 text-yellow-500'
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}