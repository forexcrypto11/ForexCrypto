"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { useAuth } from "@/app/auth-context";

export default function WithdrawPage() {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { userId } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!userId) {
      setError("You must be logged in to make a withdrawal");
      setIsLoading(false);
      return;
    }

    const withdrawalAmount = parseFloat(amount);
    if (isNaN(withdrawalAmount) || withdrawalAmount < 10) {
      setError("Please enter a valid amount (minimum ₹10)");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/create-withdrawal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: withdrawalAmount,
          userId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSubmitted(true);
      } else {
        throw new Error(data.message || "Withdrawal request failed");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Withdrawal failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-primary mb-6">Withdraw Funds</h1>
      </motion.div>

      {!isSubmitted ? (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-background/80 backdrop-blur-lg rounded-xl border p-6 shadow-sm max-w-2xl mx-auto"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Withdrawal Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-background border rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter amount"
                  min="10"
                  required
                />
                <span className="absolute right-4 top-3.5 text-muted-foreground">
                  ₹
                </span>
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-500">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Processing..." : "Confirm Withdrawal"}
            </button>
          </form>
        </motion.div>
      ) : (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-background/80 backdrop-blur-lg rounded-xl border p-8 shadow-sm max-w-md mx-auto text-center"
        >
          <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Withdrawal Requested!</h2>
          <p className="text-muted-foreground mb-4">
          ₹{amount} will be transferred to your registered bank account
          </p>
          <button
            onClick={() => {
              setAmount("");
              setIsSubmitted(false);
            }}
            className="text-primary hover:text-primary/80"
          >
            Make Another Withdrawal
          </button>
        </motion.div>
      )}
    </div>
  );
}