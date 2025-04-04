// "use client";

// import { motion } from "framer-motion";
// import { useState, useEffect } from "react";
// import { CheckCircle, QrCode, Loader2, CreditCard } from "lucide-react";
// import { useAuth } from "@/app/auth-context";
// import Image from "next/image";
// import LoadingOverlay from "@/components/ui/loading-overlay";

// type PaymentInfo = {
//   id: string;
//   type: string;
//   upiId: string;
//   merchantName: string;
// };

// export default function DepositPage() {
//   const [amount, setAmount] = useState("");
//   const [isSubmitted, setIsSubmitted] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [transactionId, setTransactionId] = useState("");
//   const [qrCodeUrl, setQrCodeUrl] = useState("");
//   const [upiLink, setUpiLink] = useState("");
//   const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
//   const [isLoadingPaymentInfo, setIsLoadingPaymentInfo] = useState(true);
//   const { userId} = useAuth();

//   // Fetch active UPI payment info
//   useEffect(() => {
//     const fetchPaymentInfo = async () => {
//       setIsLoadingPaymentInfo(true);
//       try {
//         const response = await fetch("/api/payment-info", {
//           cache: 'no-store',
//           headers: {
//             'Cache-Control': 'no-cache'
//           }
//         });
//         const data = await response.json();
        
//         if (data.success && data.paymentInfo) {
//           setPaymentInfo(data.paymentInfo);
//         }
//       } catch (error) {
//         console.error("Failed to fetch payment info:", error);
//       } finally {
//         setIsLoadingPaymentInfo(false);
//       }
//     };
    
//     fetchPaymentInfo();
//   }, []);

//   const generateQRCode = () => {
//     if (!amount || parseFloat(amount) <= 0 || !paymentInfo) {
//       return;
//     }

//     const upiID = paymentInfo.upiId;
//     const businessName = paymentInfo.merchantName;
//     const upiLinkData = `upi://pay?pa=${upiID}&pn=${encodeURIComponent(businessName)}&am=${amount}&cu=INR`;
    
//     setUpiLink(upiLinkData);
//     const qrAPI = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLinkData)}`;
//     setQrCodeUrl(qrAPI);
//   };

//   // Generate QR code when amount changes or payment info is loaded
//   useEffect(() => {
//     if (amount && parseFloat(amount) > 0 && paymentInfo) {
//       generateQRCode();
//     }
//   }, [amount, paymentInfo]);

//   const handleOpenUpiApp = () => {
//     if (upiLink) {
//       window.location.href = upiLink;
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setIsLoading(true);

//     try {
//       // Create deposit request
//       const response = await fetch("/api/create-deposit", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({ 
//           amount: parseFloat(amount),
//           userId,
//           paymentMethod: "UPI"
//         }),
//       });

//       const data = await response.json();
      
//       if (data.success) {
//         setTransactionId(data.transactionId);
//         setIsSubmitted(true);
//       } else {
//         throw new Error(data.message || "Failed to submit deposit request");
//       }
//     } catch (error) {
//       console.error("Deposit request failed:", error);
//       alert("Failed to submit deposit request. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-6 p-4 md:p-6">
//       {isLoading && <LoadingOverlay message="Processing deposit request..." />}
      
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 0.5 }}
//       >
//         <h1 className="text-3xl font-bold text-primary mb-6">Deposit Funds</h1>
//       </motion.div>

//       {!isSubmitted ? (
//         <motion.div
//           initial={{ y: 20, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           className="bg-background/80 backdrop-blur-lg rounded-xl border p-6 shadow-sm max-w-2xl mx-auto"
//         >
//           <form onSubmit={handleSubmit} className="space-y-6">
//             {/* Amount Input */}
//             <div>
//               <label className="block text-sm font-medium text-muted-foreground mb-2">
//                 Deposit Amount
//               </label>
//               <div className="relative">
//                 <input
//                   type="number"
//                   value={amount}
//                   onChange={(e) => setAmount(e.target.value)}
//                   className="w-full bg-background border rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary focus:border-transparent"
//                   placeholder="Enter amount"
//                   min="10"
//                   required
//                 />
//                 <span className="absolute right-4 top-3.5 text-muted-foreground">INR</span>
//               </div>
//             </div>

//             {/* UPI QR Code */}
//             <div className="flex flex-col items-center space-y-4 p-4 border rounded-lg bg-muted/50">
//               <div className="flex items-center gap-2 mb-2">
//                 <QrCode className="h-5 w-5 text-primary" />
//                 <h3 className="font-medium text-center">Scan QR Code to Pay</h3>
//               </div>
//               <p className="text-sm text-muted-foreground text-center mb-4">
//                 Use any UPI app to scan this code and make payment
//               </p>
              
//               {isLoadingPaymentInfo ? (
//                 <div className="flex items-center justify-center p-8">
//                   <Loader2 className="h-8 w-8 text-primary animate-spin" />
//                 </div>
//               ) : !paymentInfo ? (
//                 <div className="text-sm text-red-500 p-4 text-center">
//                   Payment information is not available. Please try again later or contact support.
//                 </div>
//               ) : qrCodeUrl ? (
//                 <div className="space-y-6">
//                   <div className="bg-white p-4 rounded-lg mx-auto">
//                     <Image 
//                       src={qrCodeUrl} 
//                       alt="UPI QR Code" 
//                       width={200} 
//                       height={200} 
//                       className="mx-auto"
//                     />
//                   </div>
                  
//                   <button
//                     type="button"
//                     onClick={handleOpenUpiApp}
//                     className="flex items-center justify-center gap-2 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
//                   >
//                     <CreditCard className="h-5 w-5" />
//                     Pay Now
//                   </button>
//                 </div>
//               ) : (
//                 <div className="text-sm text-muted-foreground">
//                   Enter a valid amount to generate QR code
//                 </div>
//               )}
              
//               {paymentInfo && (
//                 <div className="text-sm space-y-1 w-full">
//                   <p><span className="font-medium">UPI ID:</span> {paymentInfo.upiId}</p>
//                   <p><span className="font-medium">Merchant:</span> {paymentInfo.merchantName}</p>
//                   <p><span className="font-medium">Amount:</span> ₹{amount || "0"}</p>
//                 </div>
//               )}
              
//               <p className="text-xs text-muted-foreground mt-4">
//                 After payment, click &quot;Submit Deposit Request&quot; to record your transaction.
//               </p>
//             </div>

//             <button
//               type="submit"
//               disabled={isLoading}
//               className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isLoading ? "Processing..." : "Submit Deposit Request"}
//             </button>
//           </form>
//         </motion.div>
//       ) : (
//         <motion.div
//           initial={{ scale: 0.95, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           className="bg-background/80 backdrop-blur-lg rounded-xl border p-8 shadow-sm max-w-md mx-auto text-center"
//         >
//           <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
//           <h2 className="text-2xl font-bold mb-2">Deposit Request Submitted!</h2>
//           <p className="text-muted-foreground mb-4">
//             Your deposit request for ₹{amount} has been submitted successfully.
//           </p>
//           <p className="text-sm text-muted-foreground mb-6">
//             Transaction ID: {transactionId}<br />
//             Your deposit will be processed after verification by admin, which usually takes 1-24 hours.
//           </p>
//           <button
//             onClick={() => {
//               setAmount("");
//               setIsSubmitted(false);
//               setQrCodeUrl("");
//             }}
//             className="text-primary hover:text-primary/80"
//           >
//             Make Another Deposit
//           </button>
//         </motion.div>
//       )}
//     </div>
//   );
// }


"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { CheckCircle, QrCode, Loader2, CreditCard, RefreshCw } from "lucide-react";
import { useAuth } from "@/app/auth-context";
import Image from "next/image";
import LoadingOverlay from "@/components/ui/loading-overlay";

type PaymentInfo = {
  id: string;
  type: string;
  upiId: string;
  merchantName: string;
};

export default function DepositPage() {
  const [amount, setAmount] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [upiLink, setUpiLink] = useState("");
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [isLoadingPaymentInfo, setIsLoadingPaymentInfo] = useState(true);
  const { userId} = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch active UPI payment info
  const fetchPaymentInfo = useCallback(async () => {
    setIsLoadingPaymentInfo(true);
    try {
      const timestamp = new Date().getTime(); // Add timestamp to prevent caching
      const response = await fetch(`/api/payment-info?t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        next: { revalidate: 0 }
      });
      const data = await response.json();
      
      if (data.success && data.paymentInfo) {
        setPaymentInfo(data.paymentInfo);
      }
    } catch (error) {
      console.error("Failed to fetch payment info:", error);
    } finally {
      setIsLoadingPaymentInfo(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPaymentInfo();
  }, [fetchPaymentInfo]);

  const handleRefreshPaymentInfo = () => {
    setIsRefreshing(true);
    fetchPaymentInfo();
  };

  const generateQRCode = () => {
    if (!amount || parseFloat(amount) <= 0 || !paymentInfo) {
      return;
    }

    const upiID = paymentInfo.upiId;
    const businessName = paymentInfo.merchantName;
    const upiLinkData = `upi://pay?pa=${upiID}&pn=${encodeURIComponent(businessName)}&am=${amount}&cu=INR`;
    
    setUpiLink(upiLinkData);
    const qrAPI = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLinkData)}`;
    setQrCodeUrl(qrAPI);
  };

  // Generate QR code when amount changes or payment info is loaded
  useEffect(() => {
    if (amount && parseFloat(amount) > 0 && paymentInfo) {
      generateQRCode();
    }
  }, [amount, paymentInfo]);

  const handleOpenUpiApp = () => {
    if (upiLink) {
      window.location.href = upiLink;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create deposit request
      const response = await fetch("/api/create-deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          amount: parseFloat(amount),
          userId,
          paymentMethod: "UPI"
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setTransactionId(data.transactionId);
        setIsSubmitted(true);
      } else {
        throw new Error(data.message || "Failed to submit deposit request");
      }
    } catch (error) {
      console.error("Deposit request failed:", error);
      alert("Failed to submit deposit request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {isLoading && <LoadingOverlay message="Processing deposit request..." />}
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center"
      >
        <h1 className="text-3xl font-bold text-primary mb-6">Deposit Funds</h1>
        
        <button
          onClick={handleRefreshPaymentInfo}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh Payment Info'}</span>
        </button>
      </motion.div>

      {!isSubmitted ? (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-background/80 backdrop-blur-lg rounded-xl border p-6 shadow-sm max-w-2xl mx-auto"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Deposit Amount
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
                <span className="absolute right-4 top-3.5 text-muted-foreground">INR</span>
              </div>
            </div>

            {/* UPI QR Code */}
            <div className="flex flex-col items-center space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <QrCode className="h-5 w-5 text-primary" />
                <h3 className="font-medium text-center">Scan QR Code to Pay</h3>
              </div>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Use any UPI app to scan this code and make payment
              </p>
              
              {isLoadingPaymentInfo ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
              ) : !paymentInfo ? (
                <div className="text-sm text-red-500 p-4 text-center">
                  Payment information is not available. Please try again later or contact support.
                </div>
              ) : qrCodeUrl ? (
                <div className="space-y-6">
                  <div className="bg-white p-4 rounded-lg mx-auto">
                    <Image 
                      src={qrCodeUrl} 
                      alt="UPI QR Code" 
                      width={200} 
                      height={200} 
                      className="mx-auto"
                    />
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleOpenUpiApp}
                    className="flex items-center justify-center gap-2 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CreditCard className="h-5 w-5" />
                    Pay Now
                  </button>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Enter a valid amount to generate QR code
                </div>
              )}
              
              {paymentInfo && (
                <div className="text-sm space-y-1 w-full">
                  <p><span className="font-medium">UPI ID:</span> {paymentInfo.upiId}</p>
                  <p><span className="font-medium">Merchant:</span> {paymentInfo.merchantName}</p>
                  <p><span className="font-medium">Amount:</span> ₹{amount || "0"}</p>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground mt-4">
                After payment, click &quot;Submit Deposit Request&quot; to record your transaction.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Processing..." : "Submit Deposit Request"}
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
          <h2 className="text-2xl font-bold mb-2">Deposit Request Submitted!</h2>
          <p className="text-muted-foreground mb-4">
            Your deposit request for ₹{amount} has been submitted successfully.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Transaction ID: {transactionId}<br />
            Your deposit will be processed after verification by admin, which usually takes 1-24 hours.
          </p>
          <button
            onClick={() => {
              setAmount("");
              setIsSubmitted(false);
              setQrCodeUrl("");
            }}
            className="text-primary hover:text-primary/80"
          >
            Make Another Deposit
          </button>
        </motion.div>
      )}
    </div>
  );
}