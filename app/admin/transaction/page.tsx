"use client";

import { motion } from "framer-motion";
import { IndianRupee , ArrowUp, ArrowDown, Calendar, Wallet, CreditCard } from "lucide-react";

const transactions = [
  { type: "deposit", date: "2023-12-01", description: "Salary Deposit", amount: 5000, status: "completed" },
  { type: "withdrawal", date: "2023-12-02", description: "Rent Payment", amount: 1500, status: "completed" },
  { type: "deposit", date: "2023-12-03", description: "Freelance Payment", amount: 2200, status: "pending" },
  { type: "withdrawal", date: "2023-12-04", description: "Groceries", amount: 350, status: "completed" },
  { type: "withdrawal", date: "2023-12-05", description: "Utility Bills", amount: 480, status: "completed" },
];

export default function TransactionsPage() {
  const totalDeposits = transactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0);
  const totalWithdrawals = transactions.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + t.amount, 0);
  const netFlow = totalDeposits - totalWithdrawals;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-primary mb-6">Transaction History</h1>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-background/80 backdrop-blur-lg rounded-xl border p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Deposits</p>
              <p className="text-2xl font-semibold mt-2">${totalDeposits.toLocaleString()}</p>
            </div>
            <div className="p-2 rounded-lg bg-green-400/10">
              <ArrowUp className="h-6 w-6 text-green-400" />
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
              <p className="text-sm text-muted-foreground">Total Withdrawals</p>
              <p className="text-2xl font-semibold mt-2">${totalWithdrawals.toLocaleString()}</p>
            </div>
            <div className="p-2 rounded-lg bg-red-400/10">
              <ArrowDown className="h-6 w-6 text-red-400" />
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
              <p className="text-sm text-muted-foreground">Net Cash Flow</p>
              <p className={`text-2xl font-semibold mt-2 ${netFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${Math.abs(netFlow).toLocaleString()}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-primary/10">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Transaction List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-background/80 backdrop-blur-lg rounded-xl border shadow-sm overflow-hidden"
      >
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Recent Transactions
          </h3>
          <div className="flex items-center gap-4 text-sm">
            <button className="hover:text-primary">All</button>
            <button className="hover:text-primary">Deposits</button>
            <button className="hover:text-primary">Withdrawals</button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="text-xs text-muted-foreground border-b">
              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, idx) => (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 * idx }}
                  className="hover:bg-accent/5 transition-colors"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {transaction.date}
                    </div>
                  </td>
                  <td className="p-3 font-medium">{transaction.description}</td>
                  <td className={`p-3 text-right font-medium ${transaction.type === 'deposit' ? 'text-green-400' : 'text-red-400'}`}>
                    {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs capitalize ${transaction.type === 'deposit' ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${transaction.status === 'completed' ? 'bg-blue-400/10 text-blue-400' : 'bg-yellow-400/10 text-yellow-400'}`}>
                      {transaction.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}