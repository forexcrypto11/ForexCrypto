import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, duration } = body;

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has a pending loan request
    const pendingLoan = await prisma.loanRequest.findFirst({
      where: {
        userId: user.id,
        status: 'PENDING'
      }
    });

    if (pendingLoan) {
      return NextResponse.json(
        { error: 'You already have a pending loan request. Please wait for it to be processed before submitting another one.' },
        { status: 400 }
      );
    }

    // Create new loan request
    const loanRequest = await prisma.loanRequest.create({
      data: {
        userId: user.id,
        amount: parseFloat(amount),
        duration: parseInt(duration),
      },
    });

    return NextResponse.json(loanRequest);
  } catch (error) {
    console.error('Loan request error:', error);
    return NextResponse.json(
      { error: 'Failed to create loan request' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch all loan requests for the user, ordered by creation date
    const loanRequests = await prisma.loanRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(loanRequests);
  } catch (error) {
    console.error('Fetch loan requests error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loan requests' },
      { status: 500 }
    );
  }
} 