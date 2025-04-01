"use client";

import { motion } from "framer-motion";
import { useState, FormEvent, useEffect } from "react";
import { User, Mail, Phone, MapPin, Calendar, Briefcase, Edit, X, Lock, Banknote, Users } from "lucide-react";
import { useAuth } from "@/app/auth-context";

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  gender: string;
  mobile: string;
  aadhar: string;
  dob: string;
  address: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  pan: string;
  nomineeName: string;
  nomineeRelation: string;
  nomineeDob: string;
}

export default function AccountSetting() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useAuth();
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [formData, setFormData] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/user', {
          headers: {
            'X-User-Id': userId || ''
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch user data');
        }
        
        const data = await response.json();
        
        // Transform API response to match the interface
        const transformedData: UserData = {
          firstName: data.name?.split(' ')[0] || '',
          lastName: data.name?.split(' ').slice(1).join(' ') || '',
          email: data.email || '',
          username: data.email?.split('@')[0] || '',
          gender: data.gender || '',
          mobile: data.phone || '',
          aadhar: data.aadharNo || '',
          dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : '',
          address: data.address || '',
          bankName: data.bankName || '',
          accountHolder: data.accountHolder || '',
          accountNumber: data.accountNumber || '',
          ifsc: data.ifscCode || '',
          pan: data.pan || '',
          nomineeName: data.nomineeName || '',
          nomineeRelation: data.nomineeRelation || '',
          nomineeDob: data.nomineeDob ? new Date(data.nomineeDob).toISOString().split('T')[0] : '',
        };
        
        setUserData(transformedData);
        setFormData(transformedData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    } else {
      setIsLoading(false);
    }
  }, [userId]);

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel edit - restore the original data
      setFormData(userData ? { ...userData } : null);
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (key: keyof UserData, value: string) => {
    if (!formData) return;
    setFormData({ ...formData, [key]: value });
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData || !userId) return;

    try {
      setSaveLoading(true);
      setError(null);
      
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user data');
      }

      const data = await response.json();
      
      // Transform API response to match our interface
      const transformedData: UserData = {
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        username: data.username || '',
        gender: data.gender || '',
        mobile: data.mobile || '',
        aadhar: data.aadhar || '',
        dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : '',
        address: data.address || '',
        bankName: data.bankName || '',
        accountHolder: data.accountHolder || '',
        accountNumber: data.accountNumber || '',
        ifsc: data.ifsc || '',
        pan: data.pan || '',
        nomineeName: data.nomineeName || '',
        nomineeRelation: data.nomineeRelation || '',
        nomineeDob: data.nomineeDob ? new Date(data.nomineeDob).toISOString().split('T')[0] : '',
      };
      
      setUserData(transformedData);
      setFormData(transformedData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating user data:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setSaveLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!userId) {
    return <div className="p-4">Please log in to view account settings</div>;
  }

  if (!userData || !formData) {
    return <div className="p-4">Error loading user data</div>;
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-primary mb-6">Account Settings</h1>
      </motion.div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      {/* Profile Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-background/80 backdrop-blur-lg rounded-xl border p-6 shadow-sm"
      >
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Profile Information
          </h2>
          <button
            onClick={handleEditToggle}
            className="flex items-center gap-2 text-primary hover:text-primary/80"
            disabled={saveLoading}
          >
            {isEditing ? <X className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full bg-background border rounded-lg p-3"
                  disabled={!isEditing || saveLoading}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full bg-background border rounded-lg p-3"
                  disabled={!isEditing || saveLoading}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  className="w-full bg-background border rounded-lg p-3"
                  disabled
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  className="w-full bg-background border rounded-lg p-3"
                  disabled
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full bg-background border rounded-lg p-3"
                  disabled={!isEditing || saveLoading}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Mobile Number</label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  className="w-full bg-background border rounded-lg p-3"
                  disabled={!isEditing || saveLoading}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Aadhar Number</label>
                <input
                  type="text"
                  value={formData.aadhar}
                  onChange={(e) => handleInputChange('aadhar', e.target.value)}
                  className="w-full bg-background border rounded-lg p-3"
                  disabled={!isEditing || saveLoading}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleInputChange('dob', e.target.value)}
                  className="w-full bg-background border rounded-lg p-3"
                  disabled={!isEditing || saveLoading}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full bg-background border rounded-lg p-3"
                  disabled={!isEditing || saveLoading}
                />
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Banknote className="h-4 w-4" />
              Bank Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Bank Name</label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => handleInputChange('bankName', e.target.value)}
                  className="w-full bg-background border rounded-lg p-3"
                  disabled={!isEditing || saveLoading}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Account Holder</label>
                <input
                  type="text"
                  value={formData.accountHolder}
                  onChange={(e) => handleInputChange('accountHolder', e.target.value)}
                  className="w-full bg-background border rounded-lg p-3"
                  disabled={!isEditing || saveLoading}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Account Number</label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  className="w-full bg-background border rounded-lg p-3"
                  disabled={!isEditing || saveLoading}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">IFSC Code</label>
                <input
                  type="text"
                  value={formData.ifsc}
                  onChange={(e) => handleInputChange('ifsc', e.target.value)}
                  className="w-full bg-background border rounded-lg p-3"
                  disabled={!isEditing || saveLoading}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">PAN Number</label>
                <input
                  type="text"
                  value={formData.pan}
                  onChange={(e) => handleInputChange('pan', e.target.value)}
                  className="w-full bg-background border rounded-lg p-3"
                  disabled={!isEditing || saveLoading}
                />
              </div>
            </div>
          </div>

          {/* Nominee Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Nominee Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Nominee Name</label>
                <input
                  type="text"
                  value={formData.nomineeName}
                  onChange={(e) => handleInputChange('nomineeName', e.target.value)}
                  className="w-full bg-background border rounded-lg p-3"
                  disabled={!isEditing || saveLoading}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Relation</label>
                <input
                  type="text"
                  value={formData.nomineeRelation}
                  onChange={(e) => handleInputChange('nomineeRelation', e.target.value)}
                  className="w-full bg-background border rounded-lg p-3"
                  disabled={!isEditing || saveLoading}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Nominee DOB</label>
                <input
                  type="date"
                  value={formData.nomineeDob}
                  onChange={(e) => handleInputChange('nomineeDob', e.target.value)}
                  className="w-full bg-background border rounded-lg p-3"
                  disabled={!isEditing || saveLoading}
                />
              </div>
            </div>
          </div>

          {isEditing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-end gap-4 pt-6"
            >
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
                disabled={saveLoading}
              >
                {saveLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </motion.div>
          )}
        </form>
      </motion.div>
    </div>
  );
}