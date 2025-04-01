// "use client";

// import { motion } from "framer-motion";
// import { useState, useEffect } from "react";
// import { User, Mail, Clock, CheckCircle2, UserCheck, Trash2, MessageSquare, UserPlus as UserPlusIcon, Pencil as Edit } from "lucide-react";
// import { Dialog } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { toast } from "sonner";
// import { ViewUserModal } from "@/components/modals/ViewUserModal";
// import { EditUserModal } from "@/components/modals/EditUserModal";
// import LoadingOverlay from "@/components/ui/loading-overlay";

// interface UserRequest { 
//   id: string;
//   name: string;
//   email: string;
//   phone: string;
//   isVerified: boolean;
//   createdAt: string;
//   aadharNo: string;
//   pan: string;
//   gender: string;
//   dob: string;
//   nomineeName: string;
//   nomineeRelation: string;
//   bankName: string;
//   accountNumber: string;
//   accountHolder: string;
//   ifscCode: string;
//   address: string;
// }

// export default function NewUserRequests() {
//   const [users, setUsers] = useState<UserRequest[]>([]);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
  
//   // Separate user state for each modal
//   const [viewUser, setViewUser] = useState<UserRequest | null>(null);
//   const [editUser, setEditUser] = useState<UserRequest | null>(null);
//   const [deleteUser, setDeleteUser] = useState<UserRequest | null>(null);
  
//   const [editedUser, setEditedUser] = useState<Partial<UserRequest>>({});

//   const stats = [
//     { title: "Total Users", value: users.length, icon: <UserPlusIcon className="h-5 w-5" /> },
//     { title: "Pending Verification", value: users.filter(r => !r.isVerified).length, icon: <Clock className="h-5 w-5" /> },
//     { title: "Verified", value: users.filter(r => r.isVerified).length, icon: <UserCheck className="h-5 w-5" /> }
//   ];

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const fetchUsers = async () => {
//     try {
//       const response = await fetch('/api/admin/users');
//       const data = await response.json();
//       setUsers(data.users);
//     } catch (error) {
//       toast.error("Failed to fetch users");
//     }
//   };

//   const handleVerifyUser = async (userId: string) => {
//     try {
//       setIsLoading(true);
//       const response = await fetch(`/api/admin/users/${userId}`, {
//         method: 'PATCH',
//       });
//       if (!response.ok) throw new Error();
//       toast.success('User successfully verified');
//       await fetchUsers();
//     } catch (error) {
//       toast.error('Failed to verify user');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleUpdateUser = async (userId: string) => {
//     try {
//       setIsLoading(true);
//       const response = await fetch(`/api/admin/users/${userId}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(editedUser),
//       });
//       if (!response.ok) throw new Error();
//       toast.success('User successfully updated');
//       await fetchUsers();
//       setIsEditModalOpen(false);
//       setEditUser(null);
//       setEditedUser({});
//     } catch (error) {
//       toast.error('Failed to update user');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleDeleteUser = async (userId: string) => {
//     try {
//       setIsLoading(true);
//       const response = await fetch(`/api/admin/users/${userId}`, {
//         method: 'DELETE',
//       });
      
//       const data = await response.json();
      
//       if (!response.ok || !data.success) {
//         throw new Error(data.error || "Failed to delete user");
//       }
      
//       toast.success('User successfully deleted');
//       await fetchUsers();
//       setIsDeleteModalOpen(false);
//       setDeleteUser(null);
//     } catch (error) {
//       const message = error instanceof Error ? error.message : 'Failed to delete user';
//       toast.error(message);
//       console.error('Delete user error:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-6 p-4 md:p-6">
//       {isLoading && <LoadingOverlay message="Processing user data..." />}
      
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 0.5 }}
//       >
//         <h1 className="text-3xl font-bold text-primary mb-6">User Management</h1>
//       </motion.div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

//       {/* Users List */}
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         className="bg-background/80 backdrop-blur-lg rounded-xl border shadow-sm"
//       >
//         <div className="p-6">
//           <div className="space-y-4">
//             {users.map((user) => (
//               <motion.div
//                 key={user.id}
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center p-4 border rounded-lg hover:bg-accent/10 transition-colors"
//               >
//                 <div className="col-span-2">
//                   <p className="font-medium">{user.name}</p>
//                   <p className="text-sm text-muted-foreground flex items-center gap-1">
//                     <Mail className="h-4 w-4" />
//                     {user.email}
//                   </p>
//                 </div>
                
//                 <div>
//                   <p className="text-sm text-muted-foreground">Phone</p>
//                   <p className="font-medium">{user.phone}</p>
//                 </div>

//                 <div>
//                   <p className="text-sm text-muted-foreground">Status</p>
//                   <p className={`font-medium ${user.isVerified ? 'text-green-500' : 'text-yellow-500'}`}>
//                     {user.isVerified ? 'Verified' : 'Pending Verification'}
//                   </p>
//                 </div>

//                 <div>
//                   <p className="text-sm text-muted-foreground">Joined</p>
//                   <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
//                 </div>

//                 <div className="flex items-center gap-2 justify-end">
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     title="View User"
//                     onClick={() => {
//                       setViewUser(user);
//                       setIsViewModalOpen(true);
//                     }}
//                   >
//                     <User className="h-5 w-5" />
//                   </Button>
//                   {!user.isVerified && (
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       title="Verify User"
//                       onClick={() => handleVerifyUser(user.id)}
//                       className="text-green-500 hover:text-green-600"
//                     >
//                       <CheckCircle2 className="h-5 w-5" />
//                     </Button>
//                   )}
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     title="Edit User"
//                     onClick={() => {
//                       setEditUser(user);
//                       setEditedUser(user);
//                       setIsEditModalOpen(true);
//                     }}
//                   >
//                     <Edit className="h-5 w-5" />
//                   </Button>
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     title="Delete User"
//                     className="text-red-500 hover:text-red-600"
//                     onClick={() => {
//                       setDeleteUser(user);
//                       setIsDeleteModalOpen(true);
//                     }}
//                   >
//                     <Trash2 className="h-5 w-5" />
//                   </Button>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </motion.div>

//       {/* View User Modal */}
//       {viewUser && (
//         <ViewUserModal 
//           open={isViewModalOpen}
//           onOpenChange={(open) => {
//             setIsViewModalOpen(open);
//             if (!open) setViewUser(null);
//           }}
//           user={viewUser}
//         />
//       )}

//       {/* Edit User Modal */}
//       {editUser && (
//         <EditUserModal 
//           open={isEditModalOpen}
//           onOpenChange={(open) => {
//             setIsEditModalOpen(open);
//             if (!open) {
//               setEditUser(null);
//               setEditedUser({});
//             }
//           }}
//           user={editedUser}
//           onUserChange={setEditedUser}
//           onSave={() => handleUpdateUser(editUser.id)}
//         />
//       )}

//       {/* Delete Confirmation Modal */}
//       <Dialog 
//         open={isDeleteModalOpen} 
//         onOpenChange={(open) => {
//           setIsDeleteModalOpen(open);
//           if (!open) setDeleteUser(null);
//         }}
//       >
//         {deleteUser && (
//           <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
//             <div className="bg-background rounded-lg p-6 w-full max-w-md">
//               <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
//               <p className="mb-4">Are you sure you want to delete this user? This action cannot be undone.</p>
//               <div className="flex justify-end gap-2">
//                 <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
//                   Cancel
//                 </Button>
//                 <Button
//                   variant="destructive"
//                   onClick={() => handleDeleteUser(deleteUser.id)}
//                 >
//                   Delete User
//                 </Button>
//               </div>
//             </div>
//           </div>
//         )}
//       </Dialog>
//     </div>
//   );
// }


"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { User, Mail, Clock, CheckCircle2, UserCheck, Trash2, MessageSquare, UserPlus as UserPlusIcon, Pencil as Edit } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ViewUserModal } from "@/components/modals/ViewUserModal";
import { EditUserModal } from "@/components/modals/EditUserModal";

interface UserRequest { 
  id: string;
  name: string;
  email: string;
  phone: string;
  isVerified: boolean;
  createdAt: string;
  aadharNo: string;
  pan: string;
  gender: string;
  dob: string;
  nomineeName: string;
  nomineeRelation: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  ifscCode: string;
  address: string;
}

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

export default function NewUserRequests() {
  const [users, setUsers] = useState<UserRequest[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(true);
  
  const [viewUser, setViewUser] = useState<UserRequest | null>(null);
  const [editUser, setEditUser] = useState<UserRequest | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserRequest | null>(null);
  const [editedUser, setEditedUser] = useState<Partial<UserRequest>>({});

  const stats = [
    { title: "Total Users", value: users.length, icon: <UserPlusIcon className="h-5 w-5" /> },
    { title: "Pending Verification", value: users.filter(r => !r.isVerified).length, icon: <Clock className="h-5 w-5" /> },
    { title: "Verified", value: users.filter(r => r.isVerified).length, icon: <UserCheck className="h-5 w-5" /> }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsTableLoading(true);
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setIsTableLoading(false);
    }
  };

  const handleVerifyUser = async (userId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error();
      toast.success('User successfully verified');
      await fetchUsers();
    } catch (error) {
      toast.error('Failed to verify user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async (userId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedUser),
      });
      if (!response.ok) throw new Error();
      toast.success('User successfully updated');
      await fetchUsers();
      setIsEditModalOpen(false);
      setEditUser(null);
      setEditedUser({});
    } catch (error) {
      toast.error('Failed to update user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to delete user");
      }
      
      toast.success('User successfully deleted');
      await fetchUsers();
      setIsDeleteModalOpen(false);
      setDeleteUser(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete user';
      toast.error(message);
      console.error('Delete user error:', error);
    } finally {
      setIsLoading(false);
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* Users List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-background/80 backdrop-blur-lg rounded-xl border shadow-sm"
      >
        <div className="p-6">
          {isTableLoading ? (
            <div className="space-y-4">
              {/* Loading Skeleton */}
              <div className="relative">
                <LoadingBar />
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center p-4 border rounded-lg">
                  <div className="col-span-2 space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-center text-green-600 font-medium">Loading user data...</p>
            </div>
          ) : (
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
                      {user.isVerified ? 'Verified' : 'Pending Verification'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Joined</p>
                    <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div className="flex items-center gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="View User"
                      onClick={() => {
                        setViewUser(user);
                        setIsViewModalOpen(true);
                      }}
                    >
                      <User className="h-5 w-5" />
                    </Button>
                    {!user.isVerified && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Verify User"
                        onClick={() => handleVerifyUser(user.id)}
                        className="text-green-500 hover:text-green-600"
                        disabled={isLoading}
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Edit User"
                      onClick={() => {
                        setEditUser(user);
                        setEditedUser(user);
                        setIsEditModalOpen(true);
                      }}
                      disabled={isLoading}
                    >
                      <Edit className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Delete User"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => {
                        setDeleteUser(user);
                        setIsDeleteModalOpen(true);
                      }}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* View User Modal */}
      {viewUser && (
        <ViewUserModal 
          open={isViewModalOpen}
          onOpenChange={(open) => {
            setIsViewModalOpen(open);
            if (!open) setViewUser(null);
          }}
          user={viewUser}
        />
      )}

      {/* Edit User Modal */}
      {editUser && (
        <EditUserModal 
          open={isEditModalOpen}
          onOpenChange={(open) => {
            setIsEditModalOpen(open);
            if (!open) {
              setEditUser(null);
              setEditedUser({});
            }
          }}
          user={editedUser}
          onUserChange={setEditedUser}
          onSave={() => handleUpdateUser(editUser.id)}
          isLoading={isLoading}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Dialog 
        open={isDeleteModalOpen} 
        onOpenChange={(open) => {
          setIsDeleteModalOpen(open);
          if (!open) setDeleteUser(null);
        }}
      >
        {deleteUser && (
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
                  onClick={() => handleDeleteUser(deleteUser.id)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Deleting...' : 'Delete User'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}