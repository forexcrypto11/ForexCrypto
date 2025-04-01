import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { TransactionStatus, TransactionType } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const { amount, userId } = await request.json();

    // Validate input
    if (!amount || typeof amount !== 'number' || amount < 10) {
      return NextResponse.json(
        { success: false, message: "Invalid withdrawal amount" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { success: false, message: "Account not verified" },
        { status: 403 }
      );
    }

    // Create a withdrawal transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        type: TransactionType.WITHDRAW,
        status: TransactionStatus.PENDING,
        amount,
        transactionId: `WD${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
        description: `Withdrawal request of ₹${amount}`,
        currency: "INR",
        metadata: {
          bankName: user.bankName,
          accountNumber: user.accountNumber,
          ifscCode: user.ifscCode,
          accountHolder: user.accountHolder,
        },
      },
    });

    return NextResponse.json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error("Withdrawal creation failed:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to process withdrawal" 
      },
      { status: 500 }
    );
  }
}