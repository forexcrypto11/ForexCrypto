// "use client";

// import { useState, useEffect } from "react";
// import { CheckCircle, XCircle, RefreshCw, ExternalLink } from "lucide-react";
// import { motion } from "framer-motion";
// import { useAuth } from "@/app/auth-context";
// import { useRouter } from "next/navigation";
// import LoadingOverlay from "@/components/ui/loading-overlay";

// type Transaction = {
//   id: string;
//   transactionId: string;
//   userId: string;
//   userName?: string;
//   amount: number;
//   timestamp: string;
//   status: string;
//   verified: boolean;
//   paymentMethod: string | null;
//   user?: {
//     name: string;
//     email: string;
//     phone: string;
//   };
// };

// type User = {
//   id: string;
//   name: string;
//   email: string;
// };

// export default function DepositVerificationPage() {
//   const [transactions, setTransactions] = useState<Transaction[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isVerifying, setIsVerifying] = useState(false);
//   const [verifyingMessage, setVerifyingMessage] = useState("");
//   const [selectedTab, setSelectedTab] = useState<'pending' | 'verified'>('pending');
//   const { userId, role } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     // Redirect if not admin
//     if (role && role !== 'admin') {
//       router.push('/dashboard');
//     }
//   }, [role, router]);

//   const fetchTransactions = async () => {
//     if (!userId || role !== 'admin') return;

//     setIsLoading(true);
//     try {
//       const response = await fetch('/api/admin/transactions?type=DEPOSIT', {
//         headers: {
//           'X-User-Id': userId,
//           'X-User-Role': role || '',
//         }
//       });
//       const data = await response.json();
      
//       if (data.success) {
//         // Set transactions directly from the API response
//         setTransactions(data.transactions);
//       } else {
//         console.error('Error fetching transactions:', data.message);
//       }
//     } catch (error) {
//       console.error('Error fetching transactions:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (userId && role === 'admin') {
//       fetchTransactions();
//     }
//   }, [userId, role]);

//   const handleVerify = async (transactionId: string, verified: boolean) => {
//     if (!userId || role !== 'admin') return;
    
//     setIsVerifying(true);
//     setVerifyingMessage(verified ? "Approving deposit..." : "Rejecting deposit...");

//     try {
//       const response = await fetch('/api/admin/verify-deposit', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'X-User-Id': userId,
//           'X-User-Role': role || '',
//         },
//         body: JSON.stringify({
//           transactionId,
//           verified,
//         }),
//       });

//       const data = await response.json();
      
//       if (data.success) {
//         // Update the local state to reflect the change
//         setTransactions(prev => 
//           prev.map(transaction => 
//             transaction.id === data.transaction.id 
//               ? { ...transaction, verified: data.transaction.verified, status: data.transaction.status } 
//               : transaction
//           )
//         );
//       } else {
//         alert(data.message || 'Failed to update transaction.');
//       }
//     } catch (error) {
//       console.error('Error verifying transaction:', error);
//       alert('An error occurred while updating the transaction.');
//     } finally {
//       setIsVerifying(false);
//     }
//   };

//   const filteredTransactions = transactions.filter(transaction => {
//     if (selectedTab === 'pending') {
//       return !transaction.verified;
//     } else {
//       return transaction.verified;
//     }
//   });

//   if (role !== 'admin') {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <p className="text-red-500">You don&apos;t have permission to access this page.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 p-4 md:p-6">
//       {isVerifying && <LoadingOverlay message={verifyingMessage} />}
      
//       <div className="flex justify-between items-center">
//         <motion.h1
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           className="text-3xl font-bold text-primary"
//         >
//           Deposit Verification
//         </motion.h1>
//         <button
//           onClick={fetchTransactions}
//           className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted/50 transition-colors"
//         >
//           <RefreshCw className="h-4 w-4" />
//           <span>Refresh</span>
//         </button>
//       </div>

//       <div className="flex border-b">
//         <button
//           className={`px-4 py-2 font-medium ${
//             selectedTab === 'pending'
//               ? 'border-b-2 border-primary text-primary'
//               : 'text-muted-foreground hover:text-foreground'
//           }`}
//           onClick={() => setSelectedTab('pending')}
//         >
//           Pending Verification
//         </button>
//         <button
//           className={`px-4 py-2 font-medium ${
//             selectedTab === 'verified'
//               ? 'border-b-2 border-primary text-primary'
//               : 'text-muted-foreground hover:text-foreground'
//           }`}
//           onClick={() => setSelectedTab('verified')}
//         >
//           Verified Deposits
//         </button>
//       </div>

//       {isLoading ? (
//         <div className="flex justify-center items-center h-64">
//           <div className="animate-spin">
//             <RefreshCw className="h-8 w-8 text-muted-foreground" />
//           </div>
//         </div>
//       ) : filteredTransactions.length === 0 ? (
//         <div className="flex flex-col items-center justify-center h-64 text-center space-y-2">
//           <p className="text-muted-foreground">
//             No {selectedTab === 'pending' ? 'pending' : 'verified'} deposits found.
//           </p>
//         </div>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="w-full border-collapse">
//             <thead>
//               <tr className="bg-muted/50">
//                 <th className="text-left p-3">Transaction ID</th>
//                 <th className="text-left p-3">User</th>
//                 <th className="text-left p-3">Amount</th>
//                 <th className="text-left p-3">Date</th>
//                 <th className="text-left p-3">Method</th>
//                 <th className="text-left p-3">Status</th>
//                 <th className="text-left p-3">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredTransactions.map((transaction) => (
//                 <tr key={transaction.id} className="border-b hover:bg-muted/30">
//                   <td className="p-3 text-sm">
//                     <span className="font-mono">{transaction.transactionId}</span>
//                   </td>
//                   <td className="p-3">
//                     <div className="flex items-center gap-2">
//                       <span>{transaction.user?.name || 'Unknown User'}</span>
//                       <a href={`/admin/users/${transaction.userId}`} className="text-primary hover:underline">
//                         <ExternalLink className="h-3 w-3" />
//                       </a>
//                     </div>
//                   </td>
//                   <td className="p-3 font-medium">₹{transaction.amount.toFixed(2)}</td>
//                   <td className="p-3 text-muted-foreground">
//                     {new Date(transaction.timestamp).toLocaleString()}
//                   </td>
//                   <td className="p-3">{transaction.paymentMethod || "UPI"}</td>
//                   <td className="p-3">
//                     <span
//                       className={`px-2 py-1 rounded-full text-xs font-medium ${
//                         transaction.status === "COMPLETED"
//                           ? "bg-green-100 text-green-700"
//                           : transaction.status === "PENDING"
//                           ? "bg-yellow-100 text-yellow-700"
//                           : "bg-red-100 text-red-700"
//                       }`}
//                     >
//                       {transaction.status}
//                     </span>
//                   </td>
//                   <td className="p-3">
//                     {!transaction.verified ? (
//                       <div className="flex gap-2">
//                         <button
//                           onClick={() => handleVerify(transaction.id, true)}
//                           className="p-1 text-green-600 hover:bg-green-50 rounded"
//                           title="Approve Deposit"
//                           disabled={isVerifying}
//                         >
//                           <CheckCircle className="h-5 w-5" />
//                         </button>
//                         <button
//                           onClick={() => handleVerify(transaction.id, false)}
//                           className="p-1 text-red-600 hover:bg-red-50 rounded"
//                           title="Reject Deposit"
//                           disabled={isVerifying}
//                         >
//                           <XCircle className="h-5 w-5" />
//                         </button>
//                       </div>
//                     ) : (
//                       <span className="text-sm text-muted-foreground">
//                         {transaction.status === "COMPLETED" ? "Verified" : "Rejected"}
//                       </span>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// } 


"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, RefreshCw, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/app/auth-context";
import { useRouter } from "next/navigation";

type Transaction = {
  id: string;
  transactionId: string;
  userId: string;
  userName?: string;
  amount: number;
  timestamp: string;
  status: string;
  verified: boolean;
  paymentMethod: string | null;
  user?: {
    name: string;
    email: string;
    phone: string;
  };
};

// Loading Bar Component
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

export default function DepositVerificationPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyingMessage, setVerifyingMessage] = useState("");
  const [selectedTab, setSelectedTab] = useState<'pending' | 'verified'>('pending');
  const { userId, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (role && role !== 'admin') {
      router.push('/dashboard');
    }
  }, [role, router]);

  const fetchTransactions = async () => {
    if (!userId || role !== 'admin') return;

    setIsLoading(true);
    setIsTableLoading(true);
    try {
      const response = await fetch('/api/admin/transactions?type=DEPOSIT', {
        headers: {
          'X-User-Id': userId,
          'X-User-Role': role || '',
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setTransactions(data.transactions);
      } else {
        console.error('Error fetching transactions:', data.message);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
      setIsTableLoading(false);
    }
  };

  useEffect(() => {
    if (userId && role === 'admin') {
      fetchTransactions();
    }
  }, [userId, role]);

  const handleVerify = async (transactionId: string, verified: boolean) => {
    if (!userId || role !== 'admin') return;
    
    setIsVerifying(true);
    setVerifyingMessage(verified ? "Approving deposit..." : "Rejecting deposit...");

    try {
      const response = await fetch('/api/admin/verify-deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
          'X-User-Role': role || '',
        },
        body: JSON.stringify({
          transactionId,
          verified,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setTransactions(prev => 
          prev.map(transaction => 
            transaction.id === data.transaction.id 
              ? { ...transaction, verified: data.transaction.verified, status: data.transaction.status } 
              : transaction
          )
        );
      } else {
        alert(data.message || 'Failed to update transaction.');
      }
    } catch (error) {
      console.error('Error verifying transaction:', error);
      alert('An error occurred while updating the transaction.');
    } finally {
      setIsVerifying(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (selectedTab === 'pending') {
      return !transaction.verified;
    } else {
      return transaction.verified;
    }
  });

  if (role !== 'admin') {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">You don&apos;t have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex justify-between items-center">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-3xl font-bold text-primary"
        >
          Deposit Verification
        </motion.h1>
        <button
          onClick={fetchTransactions}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted/50 transition-colors"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="flex border-b">
        <button
          className={`px-4 py-2 font-medium ${
            selectedTab === 'pending'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setSelectedTab('pending')}
          disabled={isLoading}
        >
          Pending Verification
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            selectedTab === 'verified'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setSelectedTab('verified')}
          disabled={isLoading}
        >
          Verified Deposits
        </button>
      </div>

      {isTableLoading ? (
        <div className="space-y-4">
          {/* Loading Skeleton */}
          <div className="relative">
            <LoadingBar />
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    {[...Array(7)].map((_, i) => (
                      <th key={i} className="text-left p-3">
                        <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, rowIndex) => (
                    <tr key={rowIndex} className="border-b">
                      {[...Array(7)].map((_, cellIndex) => (
                        <td key={cellIndex} className="p-3">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-center text-green-600 font-medium">Loading deposit transactions...</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center space-y-2">
          <p className="text-muted-foreground">
            No {selectedTab === 'pending' ? 'pending' : 'verified'} deposits found.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-3">Transaction ID</th>
                <th className="text-left p-3">User</th>
                <th className="text-left p-3">Amount</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Method</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b hover:bg-muted/30">
                  <td className="p-3 text-sm">
                    <span className="font-mono">{transaction.transactionId}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span>{transaction.user?.name || 'Unknown User'}</span>
                      <a 
                        href={`/admin/users/${transaction.userId}`} 
                        className="text-primary hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </td>
                  <td className="p-3 font-medium">₹{transaction.amount.toFixed(2)}</td>
                  <td className="p-3 text-muted-foreground">
                    {new Date(transaction.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3">{transaction.paymentMethod || "UPI"}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.status === "COMPLETED"
                          ? "bg-green-100 text-green-700"
                          : transaction.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {!transaction.verified ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVerify(transaction.id, true)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Approve Deposit"
                          disabled={isVerifying}
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleVerify(transaction.id, false)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Reject Deposit"
                          disabled={isVerifying}
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {transaction.status === "COMPLETED" ? "Verified" : "Rejected"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Verification Loading Overlay */}
      {isVerifying && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full text-center">
            <div className="animate-spin mb-4">
              <RefreshCw className="h-8 w-8 text-primary mx-auto" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              {verifyingMessage}
            </h3>
            <p className="text-muted-foreground text-sm">
              Please wait while we process your request...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}