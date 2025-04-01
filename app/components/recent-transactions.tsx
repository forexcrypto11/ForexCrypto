import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight, ExternalLink } from 'lucide-react';

type Transaction = {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
};

type RecentTransactionsProps = {
  userId: string;
  type?: 'deposit' | 'withdrawal';
};

export default function RecentTransactions({ userId, type }: RecentTransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch(`/api/transactions?userId=${userId}&type=${type}&limit=3`);
        const data = await response.json();
        setTransactions(data.transactions);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [userId, type]);

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Recent Transactions</h2>
        <Link 
          href="/dashboard/transactions" 
          className="text-primary hover:text-primary/80 text-sm flex items-center gap-1"
        >
          View All <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
      
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-3 rounded-lg border bg-background/50"
          >
            <div className="flex items-center gap-3">
              {transaction.type === 'deposit' ? (
                <ArrowDownRight className="h-5 w-5 text-green-500" />
              ) : (
                <ArrowUpRight className="h-5 w-5 text-red-500" />
              )}
              <div>
                <p className="font-medium">
                  {transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">₹{transaction.amount}</p>
              <p className={`text-sm ${
                transaction.status === 'completed' ? 'text-green-500' :
                transaction.status === 'pending' ? 'text-yellow-500' :
                'text-red-500'
              }`}>
                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}