import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find approved loan for the user
    const approvedLoan = await prisma.loanRequest.findFirst({
      where: {
        userId,
        status: 'APPROVED'
      },
      orderBy: {
        updatedAt: 'desc'
      },
      select: {
        id: true,
        amount: true,
        duration: true,
        updatedAt: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      hasApprovedLoan: !!approvedLoan,
      loanDetails: approvedLoan
    });
  } catch (error) {
    console.error('Loan status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check loan status' },
      { status: 500 }
    );
  }
} 