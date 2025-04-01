"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Wallet, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Banknote, 
  Eye,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { WithdrawalRequest } from "@/app/types/transaction";
import { WithdrawalModal } from "@/app/components/withdrawal-modal";
import { ViewWithdrawalModal } from "@/app/components/modals/ViewWithdrawalModal";
import { Button } from "@/components/ui/button";
import { TransactionStatus } from "@prisma/client";
import { toast } from "sonner";

export default function WithdrawalRequests() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const requestsPerPage = 6;

  useEffect(() => {
    fetchWithdrawalRequests();
  }, []);

  const fetchWithdrawalRequests = async () => {
    try {
      const response = await fetch("/api/admin/withdrawals");
      const data = await response.json();
      
      if (data.success) {
        setRequests(data.withdrawals);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch withdrawal requests");
      toast.error("Failed to fetch withdrawal requests");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: TransactionStatus, remarks?: string, userId?: string) => {
    try {
      const response = await fetch(`/api/admin/withdrawals/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(userId && { "X-User-Id": userId }),
        },
        body: JSON.stringify({ action: status === 'COMPLETED' ? 'approve' : 'reject', remarks }),
      });

      const data = await response.json();

      if (data.success) {
        setRequests(requests.map(req => 
          req.id === id ? { ...req, status } : req
        ));
        toast.success(`Withdrawal ${status === 'COMPLETED' ? 'approved' : 'rejected'} successfully`);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast.error(`Failed to update withdrawal: ${(error as Error).message}`);
      throw error;
    }
  };

  // Calculate pagination values
  const totalPages = Math.ceil(requests.length / requestsPerPage);
  const indexOfLastRequest = currentPage * requestsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
  const currentRequests = requests.slice(indexOfFirstRequest, indexOfLastRequest);

  // Pagination controls
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const stats = [
    { 
      title: "Total Requests", 
      value: requests.length, 
      icon: <Wallet className="h-5 w-5" /> 
    },
    { 
      title: "Pending", 
      value: requests.filter(r => r.status === "PENDING").length, 
      icon: <Clock className="h-5 w-5" /> 
    },
    { 
      title: "Total Amount", 
      value: `₹${requests.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}`, 
      icon: <Banknote className="h-5 w-5" /> 
    },
    { 
      title: "Completed", 
      value: requests.filter(r => r.status === "COMPLETED").length, 
      icon: <CheckCircle2 className="h-5 w-5" /> 
    }
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-primary mb-6">Withdrawal Requests</h1>
      </motion.div>

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
                <p className="text-2xl font-semibold">{stat.value}</p>
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
            <ArrowUpRight className="h-5 w-5 text-primary" />
            Withdrawal Requests
          </h2>

          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No withdrawal requests found
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {currentRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center p-4 border rounded-lg hover:bg-accent/10 transition-colors"
                  >
                    <div className="col-span-2">
                      <p className="font-medium">{request.user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(request.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-lg font-semibold">₹{request.amount.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{request.transactionId}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Bank</p>
                      <p className="font-medium">{request.metadata?.bankName}</p>
                    </div>

                    <div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        request.status === "COMPLETED" ? "bg-green-500/10 text-green-500" :
                        request.status === "FAILED" ? "bg-red-500/10 text-red-500" :
                        "bg-yellow-500/10 text-yellow-500"
                      }`}>
                        {request.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedRequest(request);
                          setIsViewModalOpen(true);
                        }}
                      >
                        <Eye className="h-5 w-5" />
                      </Button>
                      {request.status === "PENDING" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-500 hover:text-green-600"
                            onClick={() => {
                              setSelectedRequest(request);
                              setIsActionModalOpen(true);
                            }}
                          >
                            <CheckCircle2 className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => {
                              setSelectedRequest(request);
                              setIsActionModalOpen(true);
                            }}
                          >
                            <XCircle className="h-5 w-5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {indexOfFirstRequest + 1}-{Math.min(indexOfLastRequest, requests.length)} of {requests.length} requests
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>

      {/* View Modal */}
      {selectedRequest && isViewModalOpen && (
        <ViewWithdrawalModal
          withdrawal={selectedRequest}
          open={isViewModalOpen}
          onOpenChange={(open) => {
            setIsViewModalOpen(open);
            if (!open) setSelectedRequest(null);
          }}
        />
      )}

      {/* Action Modal */}
      {selectedRequest && isActionModalOpen && (
        <WithdrawalModal
          request={selectedRequest}
          isOpen={isActionModalOpen}
          onClose={() => {
            setIsActionModalOpen(false);
            setSelectedRequest(null);
          }}
          onStatusUpdate={(id, status, remarks) => handleStatusUpdate(id, status, remarks, "hardcoded-user-id")}
          userId="admin-user-id"
        />
      )}
    </div>
  );
}