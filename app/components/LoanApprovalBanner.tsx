'use client';

import { motion } from 'framer-motion';
import { Coins, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/app/auth-context';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

type LoanApproval = {
  id: string;
  amount: number;
  duration: number;
  updatedAt: string;
  createdAt: string;
};

export const LoanApprovalBanner = () => {
  const { userId } = useAuth();
  const router = useRouter();
  const [loanApproval, setLoanApproval] = useState<LoanApproval | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoanApproval = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/loan-status');
        if (response.ok) {
          const data = await response.json();
          if (data.hasApprovedLoan && data.loanDetails) {
            setLoanApproval(data.loanDetails);
          }
        }
      } catch (error) {
        console.error('Error fetching loan approval:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLoanApproval();
  }, [userId]);

  if (loading || !loanApproval) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 p-4 rounded-lg"
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 bg-green-500/20 p-2 rounded-full">
          <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Loan Approved
          </h3>
          <p className="text-sm mb-3">
            Congratulations! Your loan request for ₹{loanApproval.amount.toLocaleString()} has been approved. 
            The amount has been added to your account balance.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => router.push('/dashboard')}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              View Dashboard
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LoanApprovalBanner; 