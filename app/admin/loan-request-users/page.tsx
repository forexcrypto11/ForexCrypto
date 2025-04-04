// "use client";

// import { motion } from "framer-motion";
// import { useState, useEffect } from "react";
// import { Coins, User, CheckCircle2, XCircle, Clock } from "lucide-react";

// interface LoanRequest {
//   id: string;
//   amount: number;
//   duration: number;
//   status: 'PENDING' | 'APPROVED' | 'REJECTED';
//   createdAt: string;
//   user: {
//     name: string;
//     email: string;
//   };
// }

// interface EditModalProps {
//   request: LoanRequest | null;
//   onClose: () => void;
//   onUpdate: (id: string, status: 'APPROVED' | 'REJECTED') => void;
// }

// const EditModal: React.FC<EditModalProps> = ({ request, onClose, onUpdate }) => {
//   if (!request) return null;

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//       <motion.div
//         initial={{ scale: 0.95, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         className="bg-background rounded-xl p-6 max-w-md w-full mx-4"
//       >
//         <h3 className="text-xl font-semibold mb-4">Review Loan Request</h3>
        
//         <div className="space-y-4 mb-6">
//           <div>
//             <p className="text-sm text-muted-foreground">Applicant</p>
//             <p className="font-medium">{request.user.name}</p>
//             <p className="text-sm text-muted-foreground">{request.user.email}</p>
//           </div>
          
//           <div>
//             <p className="text-sm text-muted-foreground">Loan Details</p>
//             <p className="font-medium">₹{request.amount.toLocaleString()}</p>
//             <p className="text-sm text-muted-foreground">{request.duration} months</p>
//           </div>
          
//           <div>
//             <p className="text-sm text-muted-foreground">Request Date</p>
//             <p className="font-medium">
//               {new Date(request.createdAt).toLocaleDateString()}
//             </p>
//           </div>
//         </div>

//         <div className="flex gap-3 justify-end">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 rounded-lg hover:bg-accent/50"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={() => onUpdate(request.id, 'REJECTED')}
//             className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20"
//           >
//             Reject
//           </button>
//           <button
//             onClick={() => onUpdate(request.id, 'APPROVED')}
//             className="px-4 py-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20"
//           >
//             Approve
//           </button>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default function LoanRequestUsers() {
//   const [requests, setRequests] = useState<LoanRequest[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string>("");
//   const [selectedRequest, setSelectedRequest] = useState<LoanRequest | null>(null);

//   useEffect(() => {
//     fetchLoanRequests();
//   }, []);

//   const fetchLoanRequests = async () => {
//     try {
//       const response = await fetch('/api/admin/loan-requests');
//       if (!response.ok) throw new Error('Failed to fetch loan requests');
//       const data = await response.json();
//       setRequests(data);
//     } catch (err) {
//       setError("Failed to load loan requests");
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUpdateStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
//     try {
//       const response = await fetch(`/api/admin/loan-requests/${id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ status }),
//       });

//       if (!response.ok) throw new Error('Failed to update status');

//       // Update local state
//       setRequests(requests.map(req => 
//         req.id === id ? { ...req, status } : req
//       ));
//       setSelectedRequest(null);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to update loan request status");
//     }
//   };

//   const stats = [
//     { 
//       title: "Total Requests", 
//       value: requests.length, 
//       icon: <Coins className="h-5 w-5" /> 
//     },
//     { 
//       title: "Pending", 
//       value: requests.filter(r => r.status === 'PENDING').length, 
//       icon: <Clock className="h-5 w-5" /> 
//     },
//     { 
//       title: "Approved", 
//       value: requests.filter(r => r.status === 'APPROVED').length, 
//       icon: <CheckCircle2 className="h-5 w-5" /> 
//     },
//     { 
//       title: "Total Amount", 
//       value: `₹${requests.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}`, 
//       icon: <Coins className="h-5 w-5" /> 
//     }
//   ];

//   if (loading) {
//     return <div className="p-4">Loading...</div>;
//   }

//   return (
//     <div className="space-y-6 p-4 md:p-6">
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 0.5 }}
//       >
//         <h1 className="text-3xl font-bold text-primary mb-6">Loan Requests Management</h1>
//       </motion.div>

//       {error && (
//         <div className="bg-red-500/10 text-red-500 p-4 rounded-lg">
//           {error}
//         </div>
//       )}

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         {stats.map((stat, index) => (
//           <motion.div
//             key={stat.title}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: index * 0.1 }}
//             className="bg-background/80 backdrop-blur-lg rounded-xl border p-6 shadow-sm"
//           >
//             <div className="flex justify-between items-center">
//               <div>
//                 <h3 className="text-sm text-muted-foreground mb-2">{stat.title}</h3>
//                 <p className="text-2xl font-semibold">{stat.value}</p>
//               </div>
//               <div className="p-2 rounded-lg bg-primary/10">
//                 {stat.icon}
//               </div>
//             </div>
//           </motion.div>
//         ))}
//       </div>

//       {/* Requests List */}
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         className="bg-background/80 backdrop-blur-lg rounded-xl border shadow-sm"
//       >
//         <div className="p-6">
//           <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
//             <User className="h-5 w-5 text-primary" />
//             Loan Requests
//           </h2>

//           <div className="space-y-4">
//             {requests.map((request) => (
//               <motion.div
//                 key={request.id}
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center p-4 border rounded-lg hover:bg-accent/10 transition-colors"
//               >
//                 <div>
//                   <p className="font-medium">{request.user.name}</p>
//                   <p className="text-sm text-muted-foreground">{request.user.email}</p>
//                 </div>
                
//                 <div>
//                   <p className="text-lg font-semibold">₹{request.amount.toLocaleString()}</p>
//                   <p className="text-sm text-muted-foreground">{request.duration} months</p>
//                 </div>

//                 <div className={`text-sm ${
//                   request.status === 'APPROVED' ? 'text-green-400' :
//                   request.status === 'REJECTED' ? 'text-red-400' : 'text-yellow-400'
//                 }`}>
//                   {request.status.charAt(0) + request.status.slice(1).toLowerCase()}
//                 </div>

//                 <div className="flex justify-end">
//                   <button
//                     onClick={() => setSelectedRequest(request)}
//                     className="px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20"
//                   >
//                     Review
//                   </button>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </motion.div>

//       {/* Edit Modal */}
//       <EditModal
//         request={selectedRequest}
//         onClose={() => setSelectedRequest(null)}
//         onUpdate={handleUpdateStatus}
//       />
//     </div>
//   );
// }


"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Coins, User, CheckCircle2, XCircle, Clock } from "lucide-react";

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

interface LoanRequest {
  id: string;
  amount: number;
  duration: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

interface EditModalProps {
  request: LoanRequest | null;
  onClose: () => void;
  onUpdate: (id: string, status: 'APPROVED' | 'REJECTED') => void;
  isLoading: boolean;
}

const EditModal: React.FC<EditModalProps> = ({ request, onClose, onUpdate, isLoading }) => {
  if (!request) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-background rounded-xl p-6 max-w-md w-full mx-4"
      >
        <h3 className="text-xl font-semibold mb-4">Review Loan Request</h3>
        
        <div className="space-y-4 mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Applicant</p>
            <p className="font-medium">{request.user.name}</p>
            <p className="text-sm text-muted-foreground">{request.user.email}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Loan Details</p>
            <p className="font-medium">₹{request.amount.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">{request.duration} months</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Request Date</p>
            <p className="font-medium">
              {new Date(request.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg hover:bg-accent/50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={() => onUpdate(request.id, 'REJECTED')}
            className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Reject'}
          </button>
          <button
            onClick={() => onUpdate(request.id, 'APPROVED')}
            className="px-4 py-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Approve'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default function LoanRequestUsers() {
  const [requests, setRequests] = useState<LoanRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string>("");
  const [selectedRequest, setSelectedRequest] = useState<LoanRequest | null>(null);

  useEffect(() => {
    fetchLoanRequests();
  }, []);

  const fetchLoanRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/loan-requests');
      if (!response.ok) throw new Error('Failed to fetch loan requests');
      const data = await response.json();
      setRequests(data);
    } catch (err) {
      setError("Failed to load loan requests");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/admin/loan-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      // Update local state
      setRequests(requests.map(req => 
        req.id === id ? { ...req, status } : req
      ));
      setSelectedRequest(null);
    } catch (err) {
      console.error(err);
      setError("Failed to update loan request status");
    } finally {
      setIsUpdating(false);
    }
  };

  const stats = [
    { 
      title: "Total Requests", 
      value: requests.length, 
      icon: <Coins className="h-5 w-5" /> 
    },
    { 
      title: "Pending", 
      value: requests.filter(r => r.status === 'PENDING').length, 
      icon: <Clock className="h-5 w-5" /> 
    },
    { 
      title: "Approved", 
      value: requests.filter(r => r.status === 'APPROVED').length, 
      icon: <CheckCircle2 className="h-5 w-5" /> 
    },
    { 
      title: "Total Amount", 
      value: `₹${requests.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}`, 
      icon: <Coins className="h-5 w-5" /> 
    }
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-primary mb-6">Loan Requests Management</h1>
      </motion.div>

      {error && (
        <div className="bg-red-500/10 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-background/80 backdrop-blur-lg rounded-xl border p-6 shadow-sm"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm text-muted-foreground mb-2">{stat.title}</h3>
                {loading ? (
                  <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <p className="text-2xl font-semibold">{stat.value}</p>
                )}
              </div>
              <div className="p-2 rounded-lg bg-primary/10">
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Requests List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-background/80 backdrop-blur-lg rounded-xl border shadow-sm"
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Loan Requests
          </h2>

          {loading ? (
            <div className="space-y-4">
              <LoadingBar />
              {[...Array(2)].map((_, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center p-4 border rounded-lg">
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                  </div>
                  <div className="h-5 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                  <div className="flex justify-end">
                    <div className="h-9 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                </div>
              ))}
              <p className="text-center text-green-600 font-medium">Loading loan requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No loan requests found
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center p-4 border rounded-lg hover:bg-accent/10 transition-colors"
                >
                  <div>
                    <p className="font-medium">{request.user.name}</p>
                    <p className="text-sm text-muted-foreground">{request.user.email}</p>
                  </div>
                  
                  <div>
                    <p className="text-lg font-semibold">₹{request.amount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{request.duration} months</p>
                  </div>

                  <div className={`text-sm ${
                    request.status === 'APPROVED' ? 'text-green-400' :
                    request.status === 'REJECTED' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {request.status.charAt(0) + request.status.slice(1).toLowerCase()}
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20"
                    >
                      Review
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Edit Modal */}
      <EditModal
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onUpdate={handleUpdateStatus}
        isLoading={isUpdating}
      />
    </div>
  );
}