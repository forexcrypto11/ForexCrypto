import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { TransactionStatus } from '@prisma/client';

export async function POST(request: Request) {
    try {
        const { transactionId, verified } = await request.json();

        if (!transactionId && verified === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const status = verified ? TransactionStatus.COMPLETED : TransactionStatus.FAILED;

        const transaction = await prisma.transaction.update({
            where: { id: transactionId },
            data: {
                status,
                verified
            }
        });

        return NextResponse.json({ 
            success: true, 
            message: 'Transaction status updated successfully', 
            transaction 
        });
    } catch (error) {
        console.error('Error verifying deposit:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to verify deposit' 
        }, { status: 500 });
    }
} 