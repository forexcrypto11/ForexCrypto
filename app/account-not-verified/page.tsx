 "use client";

import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const AccountNotVerifiedPage = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="container px-4 mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md mx-auto text-center"
        >
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Account Not Verified</h1>
          <p className="text-muted-foreground mb-8">
            Your account has not been verified yet. Please wait for admin approval 
            before attempting to log in. This process typically takes 24-48 hours.
          </p>
          <Link href="/login">
            <Button variant="outline" className="w-full">
              Return to Login
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-red-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-blue-500/10 blur-[120px] rounded-full" />
      </div>
    </div>
  );
};

export default AccountNotVerifiedPage;