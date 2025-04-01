import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { TransactionType } from "@prisma/client";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // TODO: Add admin authentication check here
    
    const withdrawals = await prisma.transaction.findMany({
      where: {
        type: TransactionType.WITHDRAW,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            bankName: true,
            accountNumber: true,
            accountHolder: true,
            ifscCode: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      withdrawals,
    });
  } catch (error) {
    console.error("Failed to fetch withdrawals:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to fetch withdrawals"
      },
      { status: 500 }
    );
  }
}