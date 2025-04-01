import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { TransactionStatus, TransactionType } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    if (!userId) {
      return NextResponse.json({ 
        success: false,
        error: 'User ID is required' 
      }, { status: 400 });
    }

    // Build query
    const where: any = {};
    
    if (userId) {
      where.userId = userId;
    }
    
    if (type) {
      where.type = type;

      // For deposits, only include verified ones unless explicitly requested
      if (type === TransactionType.DEPOSIT) {
        const includeUnverified = searchParams.get('includeUnverified') === 'true';
        if (!includeUnverified) {
          where.verified = true;
        }
      }
    }
    
    if (status) {
      where.status = status;
    }

    // Add a connection timeout handler
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Database connection timeout after 10 seconds'));
      }, 10000);
    });

    // Query with timeout and pagination
    const [transactions, total] = await Promise.race([
      Promise.all([
        prisma.transaction.findMany({
          where,
          orderBy: {
            timestamp: 'desc'
          },
          skip,
          take: limit
        }),
        prisma.transaction.count({ where })
      ]),
      timeoutPromise
    ]) as [any[], number];

    return NextResponse.json({
      success: true,
      data: {
        transactions,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Transactions fetch error:', error);
    
    // Categorize errors for better client handling
    let statusCode = 500;
    let errorMessage = 'Failed to fetch transactions';
    
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        statusCode = 504;
        errorMessage = 'Request timeout';
      } else if (error.message.includes('connection')) {
        statusCode = 503;
        errorMessage = 'Service temporarily unavailable';
      }
    }
    
    return NextResponse.json({ 
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'production' ? null : (error instanceof Error ? error.stack : null)
    }, { status: statusCode });
  }
}