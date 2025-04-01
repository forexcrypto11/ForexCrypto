"use client";

import { Dialog } from "@/components/ui/dialog";
import { WithdrawalRequest } from "@/app/types/transaction";
import { Clock, Banknote, Building, CreditCard, X, User, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ViewWithdrawalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  withdrawal: WithdrawalRequest;
}

export function ViewWithdrawalModal({ open, onOpenChange, withdrawal }: ViewWithdrawalModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-background rounded-lg p-6 w-full max-w-3xl space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-2xl font-bold">Withdrawal Details</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">User Details</h3>
                <div className="bg-accent/20 p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{withdrawal.user.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{withdrawal.user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{withdrawal.user.phone}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <p className="text-sm">{withdrawal.user.address}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Transaction Details</h3>
                <div className="bg-accent/20 p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                    <p className="text-lg font-semibold">₹{withdrawal.amount.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{new Date(withdrawal.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">Transaction ID</p>
                    <p className="text-sm font-mono">{withdrawal.transactionId}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Bank Details</h3>
                <div className="bg-accent/20 p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{withdrawal.user.bankName}</p>
                      <p className="text-xs text-muted-foreground">Bank Name</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{withdrawal.user.accountNumber}</p>
                      <p className="text-xs text-muted-foreground">Account Number</p>
                    </div>
                  </div>
                  <div className="space-y-2 pt-2 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Account Holder</p>
                      <p className="text-sm font-medium">{withdrawal.user.accountHolder}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">IFSC Code</p>
                      <p className="text-sm font-medium">{withdrawal.user.ifscCode}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Status Information</h3>
                <div className="bg-accent/20 p-4 rounded-lg space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Current Status</p>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      withdrawal.status === "COMPLETED" ? "bg-green-500/10 text-green-500" :
                      withdrawal.status === "FAILED" ? "bg-red-500/10 text-red-500" :
                      "bg-yellow-500/10 text-yellow-500"
                    }`}>
                      {withdrawal.status}
                    </span>
                  </div>
                  {withdrawal.metadata?.remarks && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">Remarks</p>
                      <p className="text-sm mt-1">{withdrawal.metadata.remarks}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
} 