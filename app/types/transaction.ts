import { TransactionStatus, TransactionType } from "@prisma/client";

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  timestamp: Date;
  user: {
    name: string;
    email: string;
    phone: string;
    address: string;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    ifscCode: string;
  };
  transactionId: string;
  description?: string;
  metadata?: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    accountHolder: string;
    remarks?: string;
  };
}