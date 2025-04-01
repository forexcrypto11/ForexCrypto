"use client";

import { motion } from "framer-motion";
import { useState, FormEvent } from "react";
import { Banknote, CheckCircle, User, Wallet } from "lucide-react";

export default function WithdrawPage() {
  const [amount, setAmount] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Prefilled bank details
  const bankDetails = {
    bankName: "Global International Bank",
    accountNumber: "**** **** 1234",
    accountHolder: "John Doe",
    ifscCode: "GLOBUS000123"
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitted(true);
    // Add withdrawal processing logic here
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
          className="bg-background/80 backdrop-blur-lg rounded-xl border p-6 shadow-sm max-w-3xl mx-auto"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bank Details Section */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Banknote className="h-5 w-5 text-primary" />
                Bank Account Details
              </h2>
              <div className="space-y-3 bg-accent/10 rounded-lg p-4">
                <div>
                  <label className="text-sm text-muted-foreground">Bank Name</label>
                  <div className="font-medium break-words">{bankDetails.bankName}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Account Number</label>
                    <div className="font-medium break-all">{bankDetails.accountNumber}</div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">IFSC Code</label>
                    <div className="font-medium break-all">{bankDetails.ifscCode}</div>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Account Holder Name</label>
                  <div className="font-medium break-words">{bankDetails.accountHolder}</div>
                </div>
              </div>
            </div>

            {/* Withdrawal Details Section */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Your Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-background border rounded-lg py-2 px-4 focus:ring-2 focus:ring-primary"
                    placeholder="Enter name as per bank account"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Withdrawal Amount
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-background border rounded-lg py-2 px-4 pr-12 focus:ring-2 focus:ring-primary"
                      placeholder="Enter amount to withdraw"
                      min="100"
                      required
                    />
                    <span className="absolute right-4 top-2.5 text-muted-foreground">USD</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors w-full sm:w-auto"
              >
                Submit Request
              </button>
            </div>
          </form>
        </motion.div>
      ) : (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-background/80 backdrop-blur-lg rounded-xl border p-8 shadow-sm max-w-md mx-auto text-center"
        >
          <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Withdrawal Request Received</h2>
          <p className="text-muted-foreground mb-4">
            Your withdrawal of ${amount} has been successfully submitted.
            Funds will be transferred within 3-5 business days.
          </p>
          <button
            onClick={() => {
              setName("");
              setAmount("");
              setIsSubmitted(false);
            }}
            className="text-primary hover:text-primary/80 font-medium"
          >
            New Withdrawal
          </button>
        </motion.div>
      )}
    </div>
  );
}