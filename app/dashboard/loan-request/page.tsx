// "use client";

// import { motion } from "framer-motion";
// import { useState, FormEvent, useEffect } from "react";
// import { Coins, Clock, CheckCircle, Calendar, FileText, History } from "lucide-react";
// import { useAuth } from "@/app/auth-context";
// import { useRouter } from "next/navigation";
// import { format } from "date-fns";

// type LoanRequest = {
//   id: string;
//   amount: number;
//   duration: number;
//   status: 'PENDING' | 'APPROVED' | 'REJECTED';
//   createdAt: string;
//   updatedAt?: string;
// };

// export default function LoanRequestPage() {
//   const { userId, isLoading } = useAuth();
//   const router = useRouter();
  
//   const [amount, setAmount] = useState<string>("");
//   const [duration, setDuration] = useState<string>("3");
//   const [loanRequests, setLoanRequests] = useState<LoanRequest[]>([]);
//   const [error, setError] = useState<string>("");
//   const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

//   useEffect(() => {
//     if (!isLoading && !userId) {
//       router.push('/login');
//       return;
//     }

//     fetchLoanRequests();
//   }, [userId, isLoading, router]);

//   const fetchLoanRequests = async () => {
//     try {
//       const response = await fetch('/api/loan-request');
//       if (response.ok) {
//         const data = await response.json();
//         if (Array.isArray(data)) {
//           setLoanRequests(data);
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching loan requests:', error);
//     }
//   };

//   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setError("");
//     setIsSubmitting(true);

//     try {
//       const response = await fetch('/api/loan-request', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           amount,
//           duration: parseInt(duration),
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || 'Failed to submit loan request');
//       }

//       // Reset form
//       setAmount("");
//       setDuration("3");
      
//       // Refresh loan requests
//       await fetchLoanRequests();
//     } catch (error) {
//       setError(error instanceof Error ? error.message : 'Failed to submit loan request');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const formatDate = (dateString: string) => {
//     try {
//       return format(new Date(dateString), 'dd MMM yyyy');
//     } catch (e) {
//       return 'Invalid date';
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'APPROVED': return 'text-green-500 bg-green-100';
//       case 'REJECTED': return 'text-red-500 bg-red-100';
//       default: return 'text-yellow-500 bg-yellow-100';
//     }
//   };

//   const hasPendingLoan = loanRequests.some(loan => loan.status === 'PENDING');

//   return (
//     <div className="space-y-8 p-4 md:p-6">
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 0.5 }}
//       >
//         <h1 className="text-2xl md:text-3xl font-bold text-primary mb-4">Loan Request</h1>
//       </motion.div>

//       {error && (
//         <div className="bg-red-500/10 text-red-500 p-4 rounded-lg text-sm mb-4">
//           {error}
//         </div>
//       )}

//       {!hasPendingLoan && (
//         <motion.div
//           initial={{ y: 20, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           className="bg-background/80 backdrop-blur-lg rounded-xl border p-6 shadow-sm max-w-xl mx-auto mb-8"
//         >
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div>
//               <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
//                 <Coins className="h-5 w-5 text-primary" />
//                 Loan Details
//               </h2>
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm text-muted-foreground mb-2">
//                     Loan Amount (₹)
//                   </label>
//                   <div className="relative">
//                     <span className="absolute left-4 top-2.5 text-muted-foreground">₹</span>
//                     <input
//                       type="number"
//                       value={amount}
//                       onChange={(e) => setAmount(e.target.value)}
//                       className="w-full bg-background border rounded-lg py-2 pl-8 pr-4 focus:ring-2 focus:ring-primary"
//                       placeholder="Enter amount"
//                       min="1000"
//                       required
//                     />
//                   </div>
//                 </div>
                
//                 <div>
//                   <label className="block text-sm text-muted-foreground mb-2">
//                     <Clock className="h-4 w-4 inline mr-1" />
//                     Loan Duration (Months)
//                   </label>
//                   <select
//                     value={duration}
//                     onChange={(e) => setDuration(e.target.value)}
//                     className="w-full bg-background border rounded-lg py-2 px-4 focus:ring-2 focus:ring-primary"
//                   >
//                     {[3, 6, 9, 12].map((months) => (
//                       <option key={months} value={months}>{months} Months</option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-amber-400/10 p-4 rounded-lg text-sm text-amber-800 dark:text-amber-300">
//               <p>⚠️ Please review the loan terms carefully before submitting.</p>
//             </div>

//             <div className="flex justify-center pt-6">
//               <button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors w-full sm:w-auto disabled:opacity-70"
//               >
//                 {isSubmitting ? "Submitting..." : "Submit Loan Request"}
//               </button>
//             </div>
//           </form>
//         </motion.div>
//       )}

//       {/* Loan History Section */}
//       <div className="mt-8">
//         <div className="flex items-center gap-2 mb-4">
//           <History className="h-5 w-5 text-primary" />
//           <h2 className="text-xl font-semibold">Loan Request History</h2>
//         </div>

//         {loanRequests.length === 0 ? (
//           <div className="bg-background/80 backdrop-blur-lg rounded-xl border p-8 shadow-sm text-center">
//             <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
//             <p className="text-muted-foreground">No loan requests found</p>
//           </div>
//         ) : (
//           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//             {loanRequests.map((loan) => (
//               <motion.div 
//                 key={loan.id} 
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.3 }}
//                 className="bg-background/80 backdrop-blur-lg border rounded-lg p-4 hover:shadow-md transition-shadow"
//               >
//                 <div className="flex justify-between items-center mb-3">
//                   <div className="font-semibold text-lg">₹{loan.amount.toLocaleString('en-IN')}</div>
//                   <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
//                     {loan.status}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <div className="text-sm text-muted-foreground flex items-center gap-2">
//                     <Calendar className="h-3 w-3" />
//                     {formatDate(loan.createdAt)}
//                   </div>
//                   <div className="text-sm text-muted-foreground flex items-center gap-1">
//                     <Clock className="h-3 w-3" />
//                     {loan.duration} Months
//                   </div>
//                 </div>
                
//                 {loan.status === 'PENDING' && (
//                   <div className="mt-2 text-xs text-yellow-600">
//                     Your request is being processed
//                   </div>
//                 )}
                
//                 {loan.status === 'APPROVED' && (
//                   <div className="mt-2 text-xs text-green-600">
//                     Loan approved - funds will be transferred shortly
//                   </div>
//                 )}
                
//                 {loan.status === 'REJECTED' && (
//                   <div className="mt-2 text-xs text-red-600">
//                     Application rejected
//                   </div>
//                 )}
//               </motion.div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


"use client";

import { motion } from "framer-motion";
import { useState, FormEvent, useEffect } from "react";
import { Coins, Clock, CheckCircle, Calendar, FileText, History } from "lucide-react";
import { useAuth } from "@/app/auth-context";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

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

type LoanRequest = {
  id: string;
  amount: number;
  duration: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt?: string;
};

export default function LoanRequestPage() {
  const { userId, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [amount, setAmount] = useState<string>("");
  const [duration, setDuration] = useState<string>("3");
  const [loanRequests, setLoanRequests] = useState<LoanRequest[]>([]);
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!authLoading && !userId) {
      router.push('/login');
      return;
    }

    fetchLoanRequests();
  }, [userId, authLoading, router]);

  const fetchLoanRequests = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/loan-request');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setLoanRequests(data);
        }
      }
    } catch (error) {
      console.error('Error fetching loan requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/loan-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          duration: parseInt(duration),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit loan request');
      }

      // Reset form
      setAmount("");
      setDuration("3");
      
      // Refresh loan requests
      await fetchLoanRequests();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to submit loan request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'text-green-500 bg-green-100';
      case 'REJECTED': return 'text-red-500 bg-red-100';
      default: return 'text-yellow-500 bg-yellow-100';
    }
  };

  const hasPendingLoan = loanRequests.some(loan => loan.status === 'PENDING');

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-full max-w-md p-6 space-y-4">
          <LoadingBar />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6 animate-pulse"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-green-600 font-medium">Loading authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-4">Loan Request</h1>
      </motion.div>

      {error && (
        <div className="bg-red-500/10 text-red-500 p-4 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {!hasPendingLoan && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-background/80 backdrop-blur-lg rounded-xl border p-6 shadow-sm max-w-xl mx-auto mb-8"
        >
          {isSubmitting && <LoadingBar />}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" />
                Loan Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Loan Amount (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-2.5 text-muted-foreground">₹</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-background border rounded-lg py-2 pl-8 pr-4 focus:ring-2 focus:ring-primary"
                      placeholder="Enter amount"
                      min="1000"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Loan Duration (Months)
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-background border rounded-lg py-2 px-4 focus:ring-2 focus:ring-primary"
                    disabled={isSubmitting}
                  >
                    {[3, 6, 9, 12].map((months) => (
                      <option key={months} value={months}>{months} Months</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-amber-400/10 p-4 rounded-lg text-sm text-amber-800 dark:text-amber-300">
              <p>⚠️ Please review the loan terms carefully before submitting.</p>
            </div>

            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors w-full sm:w-auto disabled:opacity-70"
              >
                {isSubmitting ? "Submitting..." : "Submit Loan Request"}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Loan History Section */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Loan Request History</h2>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-background/80 backdrop-blur-lg border rounded-lg p-4">
                <LoadingBar />
                <div className="space-y-4 mt-4">
                  <div className="flex justify-between">
                    <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : loanRequests.length === 0 ? (
          <div className="bg-background/80 backdrop-blur-lg rounded-xl border p-8 shadow-sm text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No loan requests found</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loanRequests.map((loan) => (
              <motion.div 
                key={loan.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-background/80 backdrop-blur-lg border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="font-semibold text-lg">₹{loan.amount.toLocaleString('en-IN')}</div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                    {loan.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    {formatDate(loan.createdAt)}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {loan.duration} Months
                  </div>
                </div>
                
                {loan.status === 'PENDING' && (
                  <div className="mt-2 text-xs text-yellow-600">
                    Your request is being processed
                  </div>
                )}
                
                {loan.status === 'APPROVED' && (
                  <div className="mt-2 text-xs text-green-600">
                    Loan approved - funds will be transferred shortly
                  </div>
                )}
                
                {loan.status === 'REJECTED' && (
                  <div className="mt-2 text-xs text-red-600">
                    Application rejected
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}