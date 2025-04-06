import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Get all UPI payment info entries
// export async function GET() {
//   try {
//     const paymentInfoList = await prisma.paymentInfo.findMany({
//       orderBy: {
//         updatedAt: 'desc'
//       }
//     });

//     return NextResponse.json({
//       success: true,
//       paymentInfoList
//     });
//   } catch (error) {
//     console.error('Error fetching payment info list:', error);
//     return NextResponse.json(
//       { success: false, message: 'Failed to fetch payment information' },
//       { status: 500 }
//     );
//   }
// }
// Change the GET endpoint to only return active payment info by default
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const all = url.searchParams.get('all');
    
    const paymentInfoList = await prisma.paymentInfo.findMany({
      where: all ? {} : { isActive: true },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      paymentInfoList
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Pragma': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Error fetching payment info list:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch payment information' },
      { status: 500 }
    );
  }
}




// Create new UPI payment info
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { upiId, merchantName } = body;
    
    if (!upiId || !merchantName) {
      return NextResponse.json(
        { success: false, message: 'UPI ID and Merchant Name are required' },
        { status: 400 }
      );
    }

    // Create new payment info
    const newPaymentInfo = await prisma.paymentInfo.create({
      data: {
        type: 'UPI',
        upiId,
        merchantName,
        isActive: true,
      }
    });

    // Set all other payment info as inactive
    await prisma.paymentInfo.updateMany({
      where: {
        id: {
          not: newPaymentInfo.id
        },
        type: 'UPI'
      },
      data: {
        isActive: false
      }
    });

    return NextResponse.json({
      success: true,
      paymentInfo: newPaymentInfo,
      message: 'UPI payment information created successfully'
    });
  } catch (error) {
    console.error('Error creating payment info:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create payment information' },
      { status: 500 }
    );
  }
}

// Update existing UPI payment info
// export async function PUT(request: Request) {
//   try {
//     const body = await request.json();
//     const { id, upiId, merchantName, isActive } = body;
    
//     if (!id) {
//       return NextResponse.json(
//         { success: false, message: 'Payment info ID is required' },
//         { status: 400 }
//       );
//     }

//     // Check if the payment info exists
//     const existingPaymentInfo = await prisma.paymentInfo.findUnique({
//       where: { id }
//     });

//     if (!existingPaymentInfo) {
//       return NextResponse.json(
//         { success: false, message: 'Payment information not found' },
//         { status: 404 }
//       );
//     }

//     // If trying to deactivate, check if there's at least one other active UPI
//     if (existingPaymentInfo.isActive && isActive === false) {
//       const activeCount = await prisma.paymentInfo.count({
//         where: {
//           type: 'UPI',
//           isActive: true
//         }
//       });

//       if (activeCount <= 1) {
//         return NextResponse.json(
//           { success: false, message: 'Cannot deactivate the only active UPI account' },
//           { status: 400 }
//         );
//       }
//     }

//     // Update the payment info
//     const updatedPaymentInfo = await prisma.paymentInfo.update({
//       where: { id },
//       data: {
//         upiId: upiId || existingPaymentInfo.upiId,
//         merchantName: merchantName || existingPaymentInfo.merchantName,
//         isActive: isActive ?? existingPaymentInfo.isActive,
//         updatedAt: new Date()
//       }
//     });

//     // If this payment info is now active, deactivate all others
//     if (updatedPaymentInfo.isActive) {
//       await prisma.paymentInfo.updateMany({
//         where: {
//           id: {
//             not: updatedPaymentInfo.id
//           },
//           type: 'UPI'
//         },
//         data: {
//           isActive: false
//         }
//       });
//     } else {
//       // If we're deactivating this one, ensure there's at least one active UPI
//       const activeExists = await prisma.paymentInfo.findFirst({
//         where: {
//           type: 'UPI',
//           isActive: true
//         }
//       });

//       if (!activeExists) {
//         // Activate the most recently updated UPI
//         const mostRecent = await prisma.paymentInfo.findFirst({
//           where: {
//             type: 'UPI',
//             id: {
//               not: id
//             }
//           },
//           orderBy: {
//             updatedAt: 'desc'
//           }
//         });

//         if (mostRecent) {
//           await prisma.paymentInfo.update({
//             where: { id: mostRecent.id },
//             data: { isActive: true }
//           });
//         }
//       }
//     }

//     // Fetch the final state after all updates
//     const finalPaymentInfo = await prisma.paymentInfo.findUnique({
//       where: { id }
//     });

//     return NextResponse.json({
//       success: true,
//       paymentInfo: finalPaymentInfo,
//       message: 'Payment information updated successfully'
//     });
//   } catch (error) {
//     console.error('Error updating payment info:', error);
//     return NextResponse.json(
//       { success: false, message: 'Failed to update payment information' },
//       { status: 500 }
//     );
//   }
// }
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, upiId, merchantName, isActive } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Payment info ID is required' },
        { status: 400 }
      );
    }

    return await prisma.$transaction(async (tx) => {
      // Check if the payment info exists
      const existingPaymentInfo = await tx.paymentInfo.findUnique({
        where: { id }
      });

      if (!existingPaymentInfo) {
        return NextResponse.json(
          { success: false, message: 'Payment information not found' },
          { status: 404 }
        );
      }

      // If trying to deactivate, check if there's at least one other active UPI
      if (existingPaymentInfo.isActive && isActive === false) {
        const activeCount = await tx.paymentInfo.count({
          where: {
            type: 'UPI',
            isActive: true
          }
        });

        if (activeCount <= 1) {
          return NextResponse.json(
            { success: false, message: 'Cannot deactivate the only active UPI account' },
            { status: 400 }
          );
        }
      }

      // Update the payment info
      const updatedPaymentInfo = await tx.paymentInfo.update({
        where: { id },
        data: {
          upiId: upiId || existingPaymentInfo.upiId,
          merchantName: merchantName || existingPaymentInfo.merchantName,
          isActive: isActive ?? existingPaymentInfo.isActive,
          updatedAt: new Date()
        }
      });

      // If this payment info is now active, deactivate all others
      if (updatedPaymentInfo.isActive) {
        await tx.paymentInfo.updateMany({
          where: {
            id: {
              not: updatedPaymentInfo.id
            },
            type: 'UPI'
          },
          data: {
            isActive: false
          }
        });
      }

      return NextResponse.json({
        success: true,
        paymentInfo: updatedPaymentInfo,
        message: 'Payment information updated successfully'
      });
    });
  } catch (error) {
    console.error('Error updating payment info:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update payment information' },
      { status: 500 }
    );
  }
}





// Delete UPI payment info
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Payment info ID is required' },
        { status: 400 }
      );
    }

    // Check if the payment info exists and if it's active
    const existingPaymentInfo = await prisma.paymentInfo.findUnique({
      where: { id }
    });

    if (!existingPaymentInfo) {
      return NextResponse.json(
        { success: false, message: 'Payment information not found' },
        { status: 404 }
      );
    }

    // If trying to delete an active UPI, ensure there's another one to activate
    if (existingPaymentInfo.isActive) {
      const alternativeUPI = await prisma.paymentInfo.findFirst({
        where: {
          type: 'UPI',
          id: { not: id }
        },
        orderBy: { updatedAt: 'desc' }
      });

      if (!alternativeUPI) {
        return NextResponse.json(
          { success: false, message: 'Cannot delete the only UPI account' },
          { status: 400 }
        );
      }

      // Activate the alternative UPI before deleting this one
      await prisma.paymentInfo.update({
        where: { id: alternativeUPI.id },
        data: { isActive: true }
      });
    }

    // Delete the payment info
    await prisma.paymentInfo.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Payment information deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting payment info:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete payment information' },
      { status: 500 }
    );
  }
} 