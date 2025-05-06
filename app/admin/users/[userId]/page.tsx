"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { User, Transaction, OrderHistory, LoanRequest } from "@prisma/client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface UserDetails {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  isVerified: boolean;
  createdAt: Date;
  status: string | null;
  gender?: string | null;
  dob?: Date | null;
  pan?: string | null;
  aadharNo?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
  accountHolder?: string | null;
  ifscCode?: string | null;
  nomineeName?: string | null;
  nomineeRelation?: string | null;
  nomineeDob?: Date | null;
  transactions: Transaction[];
  orders: OrderHistory[];
  loanRequest: LoanRequest | null;
}

export default function UserDetails() {
  const params = useParams();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`/api/admin/users/${params?.userId}`);
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params?.userId) {
      fetchUserDetails();
    }
  }, [params?.userId]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <div className="flex items-center justify-center h-screen">User not found</div>;
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/total-users" className="hover:opacity-80">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-3xl font-bold">User Details</h1>
      </div>

      {/* Profile Section */}
      <div className="bg-background/80 backdrop-blur-lg rounded-xl border p-6">
        <h2 className="text-2xl font-semibold mb-6">Profile Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Personal Details</h3>
              <div className="mt-2 space-y-2">
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {user.phone}</p>
                <p><strong>Gender:</strong> {user.gender}</p>
                <p><strong>DOB:</strong> {user.dob ? format(new Date(user.dob), 'PP') : 'N/A'}</p>
                <p><strong>Verification Status:</strong> {user.isVerified ? 'Verified' : 'Pending'}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium">Identity Details</h3>
              <div className="mt-2 space-y-2">
                <p><strong>PAN:</strong> {user.pan}</p>
                <p><strong>Aadhar:</strong> {user.aadharNo}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Bank Details</h3>
              <div className="mt-2 space-y-2">
                <p><strong>Bank Name:</strong> {user.bankName}</p>
                <p><strong>Account Number:</strong> {user.accountNumber}</p>
                <p><strong>Account Holder:</strong> {user.accountHolder}</p>
                <p><strong>IFSC Code:</strong> {user.ifscCode}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium">Nominee Details</h3>
              <div className="mt-2 space-y-2">
                <p><strong>Name:</strong> {user.nomineeName}</p>
                <p><strong>Relation:</strong> {user.nomineeRelation}</p>
                <p><strong>DOB:</strong> {user.nomineeDob ? format(new Date(user.nomineeDob), 'PP') : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="bg-background/80 backdrop-blur-lg rounded-xl border p-6">
        <h2 className="text-2xl font-semibold mb-6">Transaction History</h2>
        <div className="space-y-4">
          {(user.transactions || []).length > 0 ? (
            (user.transactions || []).map((transaction) => (
              <div key={transaction.id} className="border p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="font-medium">₹{transaction.amount}</span>
                  <span className={`capitalize ${
                    transaction.status === 'COMPLETED' ? 'text-green-500' : 
                    transaction.status === 'FAILED' ? 'text-red-500' : 
                    'text-yellow-500'
                  }`}>
                    {transaction.status.toLowerCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {format(new Date(transaction.timestamp), 'PPp')}
                </p>
                <p className="text-sm">{transaction.description}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No transactions found</p>
          )}
        </div>
      </div>

      {/* Orders Section */}
      <div className="bg-background/80 backdrop-blur-lg rounded-xl border p-6">
        <h2 className="text-2xl font-semibold mb-6">Trading History</h2>
        <div className="space-y-4">
          {(user.orders || []).length > 0 ? (
            (user.orders || []).map((order) => (
              <div key={order.id} className="border p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="font-medium">{order.symbol}</span>
                  <span className={`${
                    order.status === 'CLOSED' && order.profitLoss && order.profitLoss > 0 
                      ? 'text-green-500' 
                      : 'text-red-500'
                  }`}>
                    {order.status === 'CLOSED' && order.profitLoss 
                      ? `₹${order.profitLoss.toFixed(2)}` 
                      : 'Open'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  <p>Quantity: {order.quantity}</p>
                  <p>Buy Price: ₹{order.buyPrice}</p>
                  {order.sellPrice && <p>Sell Price: ₹{order.sellPrice}</p>}
                  <p>Trade Amount: ₹{order.tradeAmount}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No orders found</p>
          )}
        </div>
      </div>

      {/* Loan Section */}
      <div className="bg-background/80 backdrop-blur-lg rounded-xl border p-6">
        <h2 className="text-2xl font-semibold mb-6">Loan Information</h2>
        {user.loanRequest ? (
          <div className="border p-4 rounded-lg">
            <p><strong>Amount:</strong> ₹{user.loanRequest.amount}</p>
            <p><strong>Duration:</strong> {user.loanRequest.duration} months</p>
            <p><strong>Status:</strong> 
              <span className={`ml-2 ${
                user.loanRequest.status === 'APPROVED' ? 'text-green-500' :
                user.loanRequest.status === 'REJECTED' ? 'text-red-500' :
                'text-yellow-500'
              }`}>
                {user.loanRequest.status}
              </span>
            </p>
            <p><strong>Requested on:</strong> {format(new Date(user.loanRequest.createdAt), 'PPp')}</p>
          </div>
        ) : (
          <p className="text-center text-gray-500">No loan requests found</p>
        )}
      </div>
    </div>
  );
}