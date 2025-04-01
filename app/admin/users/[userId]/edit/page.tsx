"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { User } from "@prisma/client";

export default function EditUser() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/admin/users/${params.userId}`);
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.userId) {
      fetchUser();
    }
  }, [params.userId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const formData = new FormData(e.currentTarget);
      const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        gender: formData.get('gender'),
        bankName: formData.get('bankName'),
        accountNumber: formData.get('accountNumber'),
        accountHolder: formData.get('accountHolder'),
        ifscCode: formData.get('ifscCode'),
        nomineeName: formData.get('nomineeName'),
        nomineeRelation: formData.get('nomineeRelation'),
      };

      const response = await fetch(`/api/admin/users/${params.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        router.push(`/admin/users/${params.userId}`);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center gap-4">
        <Link href={`/admin/users/${params.userId}`} className="hover:opacity-80">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-3xl font-bold">Edit User</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-background/80 backdrop-blur-lg rounded-xl border p-6">
          <h2 className="text-2xl font-semibold mb-6">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={user.name}
                  className="w-full p-2 rounded-md border"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={user.email}
                  className="w-full p-2 rounded-md border"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={user.phone}
                  className="w-full p-2 rounded-md border"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Gender</label>
                <select
                  name="gender"
                  defaultValue={user.gender}
                  className="w-full p-2 rounded-md border"
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  defaultValue={user.bankName}
                  className="w-full p-2 rounded-md border"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Account Number</label>
                <input
                  type="text"
                  name="accountNumber"
                  defaultValue={user.accountNumber}
                  className="w-full p-2 rounded-md border"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Account Holder</label>
                <input
                  type="text"
                  name="accountHolder"
                  defaultValue={user.accountHolder}
                  className="w-full p-2 rounded-md border"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">IFSC Code</label>
                <input
                  type="text"
                  name="ifscCode"
                  defaultValue={user.ifscCode}
                  className="w-full p-2 rounded-md border"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-background/80 backdrop-blur-lg rounded-xl border p-6">
          <h2 className="text-2xl font-semibold mb-6">Nominee Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Nominee Name</label>
              <input
                type="text"
                name="nomineeName"
                defaultValue={user.nomineeName}
                className="w-full p-2 rounded-md border"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Nominee Relation</label>
              <input
                type="text"
                name="nomineeRelation"
                defaultValue={user.nomineeRelation}
                className="w-full p-2 rounded-md border"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link href={`/admin/users/${params.userId}`}>
            <button
              type="button"
              className="px-4 py-2 rounded-md border hover:bg-accent/80 transition-colors"
            >
              Cancel
            </button>
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
} 