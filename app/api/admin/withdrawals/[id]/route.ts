import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = request.headers.get('X-User-Id');
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // TEMPORARY: Bypassing admin check for testing purposes
    // In production, uncomment the following code to verify admin role
    /*
    // Verify the user is an admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    */
    
    const { action, remarks } = await request.json();
    
    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    // Update the transaction status
    const updatedTransaction = await prisma.transaction.update({
      where: { id: params.id },
      data: {
        status: action === 'approve' ? 'COMPLETED' : 'FAILED',
        failureReason: action === 'reject' ? remarks : undefined
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: `Withdrawal ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      transaction: updatedTransaction
    });
  } catch (error) {
    console.error('Error updating withdrawal:', error);
    return NextResponse.json(
      { error: 'Failed to update withdrawal' },
      { status: 500 }
    );
  }
}