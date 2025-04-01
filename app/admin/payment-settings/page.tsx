"use client";

import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

type PaymentInfo = {
  id: string;
  type: string;
  upiId: string;
  merchantName: string;
};

export default function PaymentSettingsPage() {
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [upiId, setUpiId] = useState("");
  const [merchantName, setMerchantName] = useState("");

  // Fetch current payment info
  const fetchPaymentInfo = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/admin/payment-info");
      const data = await response.json();
      
      if (data.success && data.paymentInfo) {
        setPaymentInfo(data.paymentInfo);
        setUpiId(data.paymentInfo.upiId);
        setMerchantName(data.paymentInfo.merchantName);
      }
    } catch (err) {
      setError("An error occurred while fetching payment information");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentInfo();
  }, []);

  // Update payment info
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch("/api/admin/payment-info", {
        method: paymentInfo ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: paymentInfo?.id,
          upiId,
          merchantName,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess("UPI payment information updated successfully");
        fetchPaymentInfo();
      } else {
        setError(data.message || "Failed to update UPI payment information");
      }
    } catch (err) {
      setError("An error occurred while updating UPI payment information");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">UPI Payment Settings</h1>
      
      {/* Alert messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          <span>{success}</span>
        </div>
      )}

   
      {/* UPI Settings Form */}
      <div className="bg-background/80 backdrop-blur-lg rounded-xl border p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display Current ID */}
          {paymentInfo && (
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Current ID
              </label>
              <input
                type="text"
                value={paymentInfo.id}
                readOnly
                className="w-full bg-muted/50 border rounded-lg py-2 px-3 text-muted-foreground cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground mt-1">This is your unique payment settings identifier</p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              UPI ID
            </label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="w-full bg-background border rounded-lg py-2 px-3 focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="e.g. example@upi"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Merchant Name
            </label>
            <input
              type="text"
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              className="w-full bg-background border rounded-lg py-2 px-3 focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="e.g. Company Name"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              "Update UPI Settings"
            )}
          </button>
        </form>
      </div>
    </div>
  );
} 