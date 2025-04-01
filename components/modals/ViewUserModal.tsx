import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserRequest } from "@/types/user-request";

interface ViewUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserRequest | null;
}

export function ViewUserModal({ open, onOpenChange, user }: ViewUserModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-background rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4">User Details</h2>
          {user && (
            <div className="space-y-2">
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {user.phone}</p>
              <p><strong>Aadhar No:</strong> {user.aadharNo}</p>
              <p><strong>PAN:</strong> {user.pan}</p>
              <p><strong>Gender:</strong> {user.gender}</p>
              <p><strong>Date of Birth:</strong> {user.dob}</p>
              <p><strong>Nominee Name:</strong> {user.nomineeName}</p>
              <p><strong>Nominee Relation:</strong> {user.nomineeRelation}</p>
              <p><strong>Bank Name:</strong> {user.bankName}</p>
              <p><strong>Account Number:</strong> {user.accountNumber}</p>
              <p><strong>Account Holder:</strong> {user.accountHolder}</p>
              <p><strong>IFSC Code:</strong> {user.ifscCode}</p>
              <p><strong>Address:</strong> {user.address}</p>
            </div>
          )}
          <div className="flex justify-end mt-4">
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
} 