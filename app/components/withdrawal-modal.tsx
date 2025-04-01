"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { WithdrawalRequest } from "@/app/types/transaction";
import { TransactionStatus } from "@prisma/client";
import LoadingButton from "@/app/components/ui/loading-button";

interface WithdrawalModalProps {
  request: WithdrawalRequest;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (id: string, status: TransactionStatus, remarks?: string) => Promise<void>;
  userId: string;
}

export function WithdrawalModal({ request, isOpen, onClose, onStatusUpdate, userId }: WithdrawalModalProps) {
  const [remarks, setRemarks] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStatusUpdate = async (status: TransactionStatus) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/withdrawals/${request.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
        body: JSON.stringify({ 
          action: status === 'COMPLETED' ? 'approve' : 'reject',
          remarks,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      onStatusUpdate(request.id, status, remarks);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-background rounded-xl shadow-lg max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Withdrawal Request Details</h2>
                <button onClick={onClose} className="p-2 hover:bg-accent rounded-full">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">User</p>
                  <p className="font-medium">{request.user.name}</p>
                  <p className="text-sm text-muted-foreground">{request.user.email}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium text-xl">₹{request.amount.toLocaleString()}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Transaction ID</p>
                  <p className="font-medium">{request.transactionId}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className={`font-medium ${
                    request.status === "COMPLETED" ? "text-green-500" :
                    request.status === "FAILED" ? "text-red-500" :
                    "text-yellow-500"
                  }`}>
                    {request.status}
                  </p>
                </div>

                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground mb-1">Bank Details</p>
                  <div className="bg-accent/20 p-3 rounded-lg space-y-1">
                    <p>Account Holder: {request.metadata?.accountHolder}</p>
                    <p>Account Number: {request.metadata?.accountNumber}</p>
                    <p>Bank Name: {request.metadata?.bankName}</p>
                    <p>IFSC Code: {request.metadata?.ifscCode}</p>
                  </div>
                </div>

                {request.status === "PENDING" && (
                  <>
                    <div className="col-span-2">
                      <label className="block text-sm text-muted-foreground mb-1">
                        Remarks (optional)
                      </label>
                      <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        rows={3}
                        placeholder="Add any notes or remarks..."
                      />
                    </div>

                    {error && (
                      <div className="col-span-2 text-red-500 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                      </div>
                    )}

                    <div className="col-span-2 flex justify-end gap-3">
                      <LoadingButton
                        onClick={() => handleStatusUpdate("FAILED")}
                        isLoading={isLoading}
                        variant="destructive"
                        className="flex items-center gap-2"
                        loadingMessage="Rejecting withdrawal..."
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </LoadingButton>
                      <LoadingButton
                        onClick={() => handleStatusUpdate("COMPLETED")}
                        isLoading={isLoading}
                        variant="default"
                        className="bg-green-500 hover:bg-green-600 flex items-center gap-2"
                        loadingMessage="Approving withdrawal..."
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Approve
                      </LoadingButton>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}