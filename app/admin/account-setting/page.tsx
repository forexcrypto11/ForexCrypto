"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { User, Mail, Lock, Shield, Save, X, Edit } from "lucide-react";

export default function AdminAccountSettings() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "Admin Patel",
    email: "admin@patel.com",
    role: "Super Admin",
    securityLevel: "Level 3",
    twoFactor: true,
    timezone: "Asia/Kolkata",
    darkMode: false
  });
  const [tempData, setTempData] = useState({ ...formData });

  const handleEdit = () => {
    setTempData({ ...formData });
    setIsEditing(true);
  };

  const handleSave = () => {
    setFormData({ ...tempData });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempData({ ...formData });
    setIsEditing(false);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setTempData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-8 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
          <Shield className="h-8 w-8" />
          Account Settings
        </h1>
      </motion.div>

      {/* Profile Section */}
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="bg-background/80 backdrop-blur-lg rounded-xl border p-6 shadow-sm"
      >
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </h2>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center gap-1 text-primary hover:text-primary/80"
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-1 bg-green-500/10 text-green-500 px-3 py-1 rounded-lg hover:bg-green-500/20"
              >
                <Save className="h-4 w-4" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1 bg-red-500/10 text-red-500 px-3 py-1 rounded-lg hover:bg-red-500/20"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Full Name</label>
            {isEditing ? (
              <input
                value={tempData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full p-2 rounded-lg border bg-background"
              />
            ) : (
              <p className="font-medium">{formData.name}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Email</label>
            {isEditing ? (
              <input
                value={tempData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full p-2 rounded-lg border bg-background"
              />
            ) : (
              <p className="font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {formData.email}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">User Role</label>
            <p className="font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-400" />
              {formData.role}
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Security Level</label>
            <p className="font-medium flex items-center gap-2">
              <Lock className="h-4 w-4 text-blue-400" />
              {formData.securityLevel}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Security Settings */}
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="bg-background/80 backdrop-blur-lg rounded-xl border p-6 shadow-sm"
      >
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
          <Lock className="h-5 w-5" />
          Security Settings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">
                {formData.twoFactor ? "Enabled" : "Disabled"}
              </p>
            </div>
            {isEditing && (
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={tempData.twoFactor}
                  onChange={(e) => handleChange("twoFactor", e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition-colors ${
                  tempData.twoFactor ? 'bg-green-400' : 'bg-gray-200'
                }`}>
                  <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    tempData.twoFactor ? 'translate-x-5' : ''
                  }`} />
                </div>
              </label>
            )}
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Password</p>
              <p className="text-sm text-muted-foreground">Last changed 15 days ago</p>
            </div>
            <button className="text-primary hover:text-primary/80">
              Change Password
            </button>
          </div>
        </div>
      </motion.div>

      {/* Preferences */}
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="bg-background/80 backdrop-blur-lg rounded-xl border p-6 shadow-sm"
      >
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
          <Shield className="h-5 w-5" />
          Preferences
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-muted-foreground">
                {formData.darkMode ? "Enabled" : "Disabled"}
              </p>
            </div>
            {isEditing && (
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={tempData.darkMode}
                  onChange={(e) => handleChange("darkMode", e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition-colors ${
                  tempData.darkMode ? 'bg-green-400' : 'bg-gray-200'
                }`}>
                  <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    tempData.darkMode ? 'translate-x-5' : ''
                  }`} />
                </div>
              </label>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Timezone</label>
            {isEditing ? (
              <select
                value={tempData.timezone}
                onChange={(e) => handleChange("timezone", e.target.value)}
                className="w-full p-2 rounded-lg border bg-background"
              >
                <option value="Asia/Kolkata">India (GMT+5:30)</option>
                <option value="America/New_York">New York (GMT-5)</option>
                <option value="Europe/London">London (GMT+0)</option>
              </select>
            ) : (
              <p className="font-medium">{formData.timezone}</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}