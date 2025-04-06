// "use client";

// import { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import { useAuth } from "@/app/auth-context";
// import { Order, TradeStatus } from "@/app/types/orders";
// import { TrendingUp, TrendingDown, IndianRupee , Calendar } from "lucide-react";

// export default function SellRequestPage() {
//   const { user, isLoading } = useAuth();
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);

//   useEffect(() => {
//     if (user) {
//       fetchOrders();
//     }
//   }, [user]);

//   const fetchOrders = async () => {
//     try {
//       const response = await fetch("/api/orders/open");
//       if (!response.ok) throw new Error("Failed to fetch orders");
//       const data = await response.json();
//       setOrders(data.orders);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Failed to fetch orders");
//     }
//   };

//   const handleSellRequest = async (orderId: string) => {
//     setIsSubmitting(orderId);
//     setError(null);
//     setSuccess(null);

//     try {
//       const response = await fetch("/api/orders/sell-request", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           orderId
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || "Failed to submit sell request");
//       }

//       const data = await response.json();
//       setSuccess("Sell request submitted successfully. Admin will review and set the sell price.");
      
//       // Update the orders list with the new sell price
//       setOrders(prevOrders => 
//         prevOrders.map(order => 
//           order.id === orderId 
//             ? { ...order, sellPrice: data.order.sellPrice } 
//             : order
//         )
//       );
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "An unexpected error occurred");
//     } finally {
//       setIsSubmitting(null);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="text-center text-muted-foreground">Loading...</div>
//       </div>
//     );
//   }

//   if (!user) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="text-center text-muted-foreground">
//           Please log in to view orders
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 p-4 md:p-6">
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 0.5 }}
//       >
//         <h1 className="text-3xl font-bold text-primary mb-6">Request to Sell</h1>
//       </motion.div>

//       {success && (
//         <motion.div
//           initial={{ opacity: 0, y: -10 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="p-4 bg-green-500/10 text-green-500 rounded-lg"
//         >
//           {success}
//         </motion.div>
//       )}

//       {error && (
//         <motion.div
//           initial={{ opacity: 0, y: -10 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="p-4 bg-red-500/10 text-red-500 rounded-lg"
//         >
//           {error}
//         </motion.div>
//       )}

//       <motion.div
//         initial={{ y: 20, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         transition={{ delay: 0.1 }}
//         className="bg-background/80 backdrop-blur-lg rounded-xl border p-4 md:p-6 shadow-sm"
//       >
//         {orders.length === 0 ? (
//           <div className="text-center text-muted-foreground py-8">
//             No open orders available for selling
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {orders.map((order) => (
//               <motion.div
//                 key={order.id}
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 className="border rounded-lg p-4 space-y-4 hover:border-primary/50 transition-colors"
//               >
//                 <div className="flex justify-between items-center">
//                   <div className="flex items-center gap-2">
//                     <Calendar className="h-4 w-4 text-muted-foreground" />
//                     <span className="text-sm text-muted-foreground">
//                       {new Date(order.tradeDate).toLocaleDateString()}
//                     </span>
//                   </div>
//                   <span
//                     className={`px-2 py-1 rounded-full text-xs ${
//                       order.type === "LONG"
//                         ? "bg-green-400/10 text-green-400"
//                         : "bg-red-400/10 text-red-400"
//                     } flex items-center gap-1`}
//                   >
//                     {order.type === "LONG" ? 
//                       <TrendingUp className="h-3 w-3" /> : 
//                       <TrendingDown className="h-3 w-3" />
//                     }
//                     {order.type}
//                   </span>
//                 </div>
                
//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <p className="text-xs text-muted-foreground">Symbol</p>
//                     <p className="font-medium">{order.symbol}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-muted-foreground">Quantity</p>
//                     <p className="font-medium">{order.quantity}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-muted-foreground">Buy Price</p>
//                     <p className="font-medium flex items-center">
//                      <IndianRupee  className="h-3 w-3 text-muted-foreground" />
//                       {order.buyPrice}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-muted-foreground">Sell Price</p>
//                     <p className="font-medium flex items-center">
//                      <IndianRupee  className="h-3 w-3 text-muted-foreground" />
//                       {order.sellPrice ? order.sellPrice : '-'}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="flex justify-end pt-2">
//                   <button
//                     onClick={() => handleSellRequest(order.id)}
//                     disabled={isSubmitting === order.id}
//                     className="w-full sm:w-auto px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
//                   >
//                     {isSubmitting === order.id ? "Submitting..." : "Request to Sell"}
//                   </button>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         )}
//       </motion.div>
//     </div>
//   );
// }


"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/app/auth-context";
import { Order, TradeStatus } from "@/app/types/orders";
import { TrendingUp, TrendingDown, IndianRupee, Calendar } from "lucide-react";

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

export default function SellRequestPage() {
  const { user, isLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isFetchingOrders, setIsFetchingOrders] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setIsFetchingOrders(true);
      const response = await fetch("/api/orders/open");
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      setOrders(data.orders);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch orders");
    } finally {
      setIsFetchingOrders(false);
    }
  };

  const handleSellRequest = async (orderId: string) => {
    setIsSubmitting(orderId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/orders/sell-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit sell request");
      }

      const data = await response.json();
      setSuccess("Sell request submitted successfully. Admin will review and set the sell price.");
      
      // Update the orders list with the new sell price
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, sellPrice: data.order.sellPrice } 
            : order
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingBar />
        <div className="text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-muted-foreground">
          Please log in to view orders
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {isFetchingOrders && <LoadingBar />}
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-primary mb-6">Request to Sell</h1>
      </motion.div>

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-500/10 text-green-500 rounded-lg"
        >
          {success}
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/10 text-red-500 rounded-lg"
        >
          {error}
        </motion.div>
      )}

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-background/80 backdrop-blur-lg rounded-xl border p-4 md:p-6 shadow-sm"
      >
        {isFetchingOrders ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border rounded-lg p-4 space-y-4"
              >
                {/* Date and Type Skeleton */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
                
                {/* Card Content Skeleton */}
                <div className="grid grid-cols-2 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i}>
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-1"></div>
                      <div className="h-6 w-full bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>

                {/* Button Skeleton */}
                <div className="flex justify-end pt-2">
                  <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse"></div>
                </div>
              </motion.div>
            ))}
            <p className="col-span-full text-center text-green-600 font-medium mt-4">
              Loading sell requests...
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No open orders available for selling
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border rounded-lg p-4 space-y-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {new Date(order.tradeDate).toLocaleDateString()}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      order.type === "LONG"
                        ? "bg-green-400/10 text-green-400"
                        : "bg-red-400/10 text-red-400"
                    } flex items-center gap-1`}
                  >
                    {order.type === "LONG" ? 
                      <TrendingUp className="h-3 w-3" /> : 
                      <TrendingDown className="h-3 w-3" />
                    }
                    {order.type}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Symbol</p>
                    <p className="font-medium">{order.symbol}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Quantity</p>
                    <p className="font-medium">{order.quantity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Buy Price</p>
                    <p className="font-medium flex items-center">
                     <IndianRupee className="h-3 w-3 text-muted-foreground" />
                      {order.buyPrice}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Sell Price</p>
                    <p className="font-medium flex items-center">
                     <IndianRupee className="h-3 w-3 text-muted-foreground" />
                      {order.sellPrice ? order.sellPrice : '-'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => handleSellRequest(order.id)}
                    disabled={isSubmitting === order.id}
                    className="w-full sm:w-auto px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting === order.id ? "Submitting..." : "Request to Sell"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}