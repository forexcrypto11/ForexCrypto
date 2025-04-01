import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { UserRequest } from "@/types/user-request";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: Partial<UserRequest>;
  onUserChange: (user: Partial<UserRequest>) => void;
  onSave: () => void;
}

export function EditUserModal({ open, onOpenChange, user, onUserChange, onSave }: EditUserModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-background rounded-lg p-6 w-full max-w-2xl">
          <h2 className="text-xl font-semibold mb-4">Edit User</h2>
          <ScrollArea className="h-[70vh] pr-4">
            <div className="space-y-4">
              {/* Personal Information */}
              <h3 className="text-lg font-medium">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Name"
                  value={user.name || ''}
                  onChange={(e) => onUserChange({ ...user, name: e.target.value })}
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={user.email || ''}
                  onChange={(e) => onUserChange({ ...user, email: e.target.value })}
                />
                <Input
                  placeholder="Phone"
                  value={user.phone || ''}
                  onChange={(e) => onUserChange({ ...user, phone: e.target.value })}
                />
                <Input
                  placeholder="Date of Birth"
                  type="date"
                  value={user.dob?.split('T')[0] || ''}
                  onChange={(e) => onUserChange({ ...user, dob: e.target.value })}
                />
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                  value={user.gender || ''}
                  onChange={(e) => onUserChange({ ...user, gender: e.target.value })}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Identity Documents */}
              <h3 className="text-lg font-medium mt-6">Identity Documents</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Aadhar Number"
                  value={user.aadharNo || ''}
                  onChange={(e) => onUserChange({ ...user, aadharNo: e.target.value })}
                />
                <Input
                  placeholder="PAN Number"
                  value={user.pan || ''}
                  onChange={(e) => onUserChange({ ...user, pan: e.target.value })}
                />
              </div>

              {/* Nominee Details */}
              <h3 className="text-lg font-medium mt-6">Nominee Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Nominee Name"
                  value={user.nomineeName || ''}
                  onChange={(e) => onUserChange({ ...user, nomineeName: e.target.value })}
                />
                <Input
                  placeholder="Nominee Relation"
                  value={user.nomineeRelation || ''}
                  onChange={(e) => onUserChange({ ...user, nomineeRelation: e.target.value })}
                />
              </div>

              {/* Bank Details */}
              <h3 className="text-lg font-medium mt-6">Bank Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Bank Name"
                  value={user.bankName || ''}
                  onChange={(e) => onUserChange({ ...user, bankName: e.target.value })}
                />
                <Input
                  placeholder="Account Number"
                  value={user.accountNumber || ''}
                  onChange={(e) => onUserChange({ ...user, accountNumber: e.target.value })}
                />
                <Input
                  placeholder="Account Holder Name"
                  value={user.accountHolder || ''}
                  onChange={(e) => onUserChange({ ...user, accountHolder: e.target.value })}
                />
                <Input
                  placeholder="IFSC Code"
                  value={user.ifscCode || ''}
                  onChange={(e) => onUserChange({ ...user, ifscCode: e.target.value })}
                />
              </div>

              {/* Address */}
              <h3 className="text-lg font-medium mt-6">Address</h3>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2"
                placeholder="Address"
                value={user.address || ''}
                onChange={(e) => onUserChange({ ...user, address: e.target.value })}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={onSave}>
                  Save Changes
                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </Dialog>
  );
}