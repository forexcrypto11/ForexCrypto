"use client";

import { motion } from "framer-motion";
import { useState, FormEvent } from "react";
import { Lock, CheckCircle, X } from "lucide-react";

export default function ChangePassword() {
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handlePasswordChange = (e: FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setPasswordError("Passwords do not match");
      return;
    }
    if (passwords.new.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    // Add password change logic here
    setPasswordError("");
    setIsSubmitted(true);
    setPasswords({ current: "", new: "", confirm: "" });
  };

  return (
    <div className="space-y-8 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-primary mb-6">Change Password</h1>
      </motion.div>

      {!isSubmitted ? (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-background/80 backdrop-blur-lg rounded-xl border p-6 shadow-sm max-w-2xl mx-auto"
        >
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Current Password</label>
                <input
                  type="password"
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  className="w-full bg-background border rounded-lg p-3"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">New Password</label>
                <input
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  className="w-full bg-background border rounded-lg p-3"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Confirm Password</label>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  className="w-full bg-background border rounded-lg p-3"
                  required
                />
              </div>
            </div>

            {passwordError && (
              <div className="text-red-400 text-sm flex items-center gap-2">
                <X className="h-4 w-4" />
                {passwordError}
              </div>
            )}

            <div className="flex justify-end gap-4 pt-6">
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90"
              >
                Change Password
              </button>
            </div>
          </form>
        </motion.div>
      ) : (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-background/80 backdrop-blur-lg rounded-xl border p-8 shadow-sm max-w-md mx-auto text-center"
        >
          <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Password Changed</h2>
          <p className="text-muted-foreground mb-4">
            Your password has been updated successfully.
          </p>
        </motion.div>
      )}
    </div>
  );
}