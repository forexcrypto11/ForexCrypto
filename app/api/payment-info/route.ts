import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Get active UPI payment information
// export async function GET() {
//   try {
//     // Find active UPI payment info
//     let paymentInfo = await prisma.paymentInfo.findFirst({
//       where: { 
//         type: 'UPI',
//         isActive: true
//       },
//       orderBy: {
//         updatedAt: 'desc'
//       }
//     });

//     // If no active UPI payment info is found
//     if (!paymentInfo) {
//       // Find any existing UPI payment info
//       const existingUPI = await prisma.paymentInfo.findFirst({
//         where: { type: 'UPI' },
//         orderBy: { updatedAt: 'desc' }
//       });

//       if (existingUPI) {
//         // Activate the most recent UPI
//         paymentInfo = await prisma.paymentInfo.update({
//           where: { id: existingUPI.id },
//           data: { isActive: true }
//         });
//       } else {
//         // Create a default one if none exists
//         paymentInfo = await prisma.paymentInfo.create({
//           data: {
//             type: 'UPI',
//             upiId: 'developer.aditya09@oksbi',
//             merchantName: 'Astex',
//             isActive: true,
//           }
//         });
//       }
//     }

//     // Set cache control headers
//     const headers = {
//       'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
//       'Pragma': 'no-cache',
//       'Expires': '0',
//     };

//     return NextResponse.json({
//       success: true,
//       paymentInfo
//     }, { headers });
//   } catch (error) {
//     console.error('Error fetching payment info:', error);
//     return NextResponse.json(
//       { success: false, message: 'Failed to fetch payment information' },
//       { status: 500 }
//     );
//   }
// }



export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get('refresh') === 'true';
    
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

    // If no active UPI or forced refresh
    if (!paymentInfo || forceRefresh) {
      // Find any existing UPI payment info
      const existingUPI = await prisma.paymentInfo.findFirst({
        where: { type: 'UPI' },
        orderBy: { updatedAt: 'desc' }
      });

      if (existingUPI) {
        // Update all records to ensure only one is active
        await prisma.$transaction([
          prisma.paymentInfo.updateMany({
            where: { type: 'UPI' },
            data: { isActive: false }
          }),
          prisma.paymentInfo.update({
            where: { id: existingUPI.id },
            data: { isActive: true }
          })
        ]);
        
        paymentInfo = await prisma.paymentInfo.findUnique({
          where: { id: existingUPI.id }
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

    return NextResponse.json({
      success: true,
      paymentInfo
    }, { 
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error fetching payment info:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch payment information' },
      { status: 500 }
    );
  }
}