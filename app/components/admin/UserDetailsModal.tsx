import { Modal } from "@/app/components/ui/Modal";
import { format } from "date-fns";
import { Transaction, OrderHistory, LoanRequest, User } from "@prisma/client";

interface UserDetailsModalProps {
  user: User & {
    transactions: Transaction[];
    orders: OrderHistory[];
    loanRequest: LoanRequest | null;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  user,
  isOpen,
  onClose,
}) => {
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">User Details - {user.name}</h2>
        
        <div className="space-y-6">
          {/* Profile Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Profile</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {user.phone}</p>
                <p><strong>Gender:</strong> {user.gender}</p>
                <p><strong>DOB:</strong> {format(new Date(user.dob), 'PP')}</p>
                <p><strong>Verified:</strong> {user.isVerified ? 'Yes' : 'No'}</p>
              </div>
              <div className="space-y-2">
                <p><strong>PAN:</strong> {user.pan}</p>
                <p><strong>Aadhar:</strong> {user.aadharNo}</p>
                <p><strong>Bank:</strong> {user.bankName}</p>
                <p><strong>Account Number:</strong> {user.accountNumber}</p>
                <p><strong>IFSC:</strong> {user.ifscCode}</p>
              </div>
            </div>
          </div>

          {/* Transactions Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Transactions</h3>
            <div className="space-y-4">
              {user.transactions.length > 0 ? (
                user.transactions.map((transaction) => (
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
          <div>
            <h3 className="text-xl font-semibold mb-4">Orders</h3>
            <div className="space-y-4">
              {user.orders.length > 0 ? (
                user.orders.map((order) => (
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
          <div>
            <h3 className="text-xl font-semibold mb-4">Loan Details</h3>
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
      </div>
    </Modal>
  );
};