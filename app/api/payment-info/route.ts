import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Get active UPI payment information
export async function GET() {
  try {
    // Find active UPI payment info
    let paymentInfo = await prisma.paymentInfo.findFirst({
      where: { 
        type: 'UPI',
        isActive: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // If no active UPI payment info is found
    if (!paymentInfo) {
      // Find any existing UPI payment info
      const existingUPI = await prisma.paymentInfo.findFirst({
        where: { type: 'UPI' },
        orderBy: { updatedAt: 'desc' }
      });

      if (existingUPI) {
        // Activate the most recent UPI
        paymentInfo = await prisma.paymentInfo.update({
          where: { id: existingUPI.id },
          data: { isActive: true }
        });
      } else {
        // Create a default one if none exists
        paymentInfo = await prisma.paymentInfo.create({
          data: {
            type: 'UPI',
            upiId: 'developer.aditya09@oksbi',
            merchantName: 'Astex',
            isActive: true,
          }
        });
      }
    }

    // Set cache control headers
    const headers = {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    };

    return NextResponse.json({
      success: true,
      paymentInfo
    }, { headers });
  } catch (error) {
    console.error('Error fetching payment info:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch payment information' },
      { status: 500 }
    );
  }
}