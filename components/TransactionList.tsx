import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import { useAuth } from '@/app/auth-context';
import { TransactionType, TransactionStatus } from '@prisma/client';
import type { WithdrawalRequest } from '@/app/types/transaction';

const TransactionList = () => {
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
        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }
        const data = await response.json();
        if (data.success) {
          setTransactions(data.transactions);
        }
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [userId]);

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading transactions...
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No recent transactions found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction, index) => (
        <motion.div
          key={transaction.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-background/80 backdrop-blur-lg rounded-lg border p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-full ${
              transaction.type === TransactionType.DEPOSIT 
                ? 'bg-green-500/10' 
                : 'bg-red-500/10'
            }`}>
              {transaction.type === TransactionType.DEPOSIT 
                ? <ArrowDown className="h-4 w-4 text-green-500" />
                : <ArrowUp className="h-4 w-4 text-red-500" />
              }
            </div>
            <div>
              <p className="font-medium">
                {transaction.type === TransactionType.DEPOSIT ? 'Deposit' : 'Withdrawal'}
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {new Date(transaction.timestamp).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className={`font-medium ${
              transaction.type === TransactionType.DEPOSIT 
                ? 'text-green-500' 
                : 'text-red-500'
            }`}>
              {transaction.type === TransactionType.DEPOSIT ? '+' : '-'}
              ₹{transaction.amount.toLocaleString()}
            </p>
            <span className={`px-2 py-1 rounded-full text-xs ${
              transaction.status === TransactionStatus.COMPLETED 
                ? 'bg-green-500/10 text-green-500'
                : transaction.status === TransactionStatus.PENDING
                ? 'bg-yellow-500/10 text-yellow-500'
                : 'bg-red-500/10 text-red-500'
            }`}>
              {transaction.status}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default TransactionList; 