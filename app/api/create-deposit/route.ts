import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, userId, paymentMethod } = body;
    
    if (!amount || !userId) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }
    
    if (amount < 10) {
      return NextResponse.json({ success: false, message: 'Minimum deposit amount is 10' }, { status: 400 });
    }

    // Generate a unique transaction ID
    const transactionId = `DEP${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        type: 'DEPOSIT',
        transactionId,
        status: 'PENDING',
        amount: parseFloat(amount.toString()),
        paymentMethod: paymentMethod?.toUpperCase() || 'BANK',
        description: 'Deposit request - pending verification',
        verified: false, // Default is false, but setting explicitly for clarity
      },
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Deposit request submitted successfully',
      transactionId: transaction.transactionId
    });
    
  } catch (error) {
    console.error('Error creating deposit:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process deposit request' },
      { status: 500 }
    );
  }
} 