"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Edit, Trash2, MessageSquare, CheckCircle } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  isVerified: boolean;
  createdAt: string;
  // ... other user fields from your schema
}

export default function UsersManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [editedUser, setEditedUser] = useState<Partial<UserData>>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast.error("Failed to fetch users");
    }
  };

  const handleAction = async (userId: string, action: 'verify' | 'update' | 'delete', data?: any) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action,
          ...data
        }),
      });

      if (!response.ok) throw new Error();

      toast.success(`User successfully ${action}ed`);
      fetchUsers();
      setIsEditModalOpen(false);
      setIsMessageModalOpen(false);
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error(`Failed to ${action} user`);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-primary mb-6">User Management</h1>
      </motion.div>

      <div className="bg-background/80 backdrop-blur-lg rounded-xl border shadow-sm">
        <div className="p-6">
          <div className="space-y-4">
            {users.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center p-4 border rounded-lg hover:bg-accent/10 transition-colors"
              >
                <div className="col-span-2">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{user.phone}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className={`font-medium ${user.isVerified ? 'text-green-500' : 'text-yellow-500'}`}>
                    {user.isVerified ? 'Verified' : 'Unverified'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Joined</p>
                  <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="flex items-center gap-2 justify-end">
                  {!user.isVerified && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleAction(user.id, 'verify')}
                      className="text-green-500 hover:text-green-600"
                    >
                      <CheckCircle className="h-5 w-5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedUser(user);
                      setEditedUser(user);
                      setIsEditModalOpen(true);
                    }}
                  >
                    <Edit className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedUser(user);
                      setIsMessageModalOpen(true);
                    }}
                  >
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => {
                      setSelectedUser(user);
                      setIsDeleteModalOpen(true);
                    }}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit User</h2>
            <div className="space-y-4">
              <Input
                placeholder="Name"
                value={editedUser.name || ''}
                onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
              />
              <Input
                placeholder="Phone"
                value={editedUser.phone || ''}
                onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
              />
              {/* Add other fields as needed */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => selectedUser && handleAction(selectedUser.id, 'update', { userData: editedUser })}>
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Message Modal */}
      <Dialog open={isMessageModalOpen} onOpenChange={setIsMessageModalOpen}>
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Send Message</h2>
            <Textarea
              placeholder="Enter your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px] mb-4"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsMessageModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => selectedUser && handleAction(selectedUser.id, 'update', { message })}>
                Send Message
              </Button>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
            <p className="mb-4">Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedUser && handleAction(selectedUser.id, 'delete')}
              >
                Delete User
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
} 