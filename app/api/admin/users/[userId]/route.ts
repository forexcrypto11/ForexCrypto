import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import prisma from "@/lib/prisma";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// For verifying users
export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isVerified: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}

// For updating user details
export async function PUT(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const userData = await request.json();

    // Filter out relationship fields which can't be directly updated
    const { transactions, orders, loanRequests, ...updateData } = userData;

    // Parse date fields as Date objects
    if (updateData.dob) {
      updateData.dob = new Date(updateData.dob);
    }
    
    if (updateData.nomineeDob) {
      updateData.nomineeDob = new Date(updateData.nomineeDob);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Update failed", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}

// For deleting users
export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    
    // Delete related records first to handle foreign key constraints
    await prisma.$transaction([
      // Delete related transactions
      prisma.transaction.deleteMany({
        where: { userId }
      }),
      
      // Delete related orders
      prisma.orderHistory.deleteMany({
        where: { userId }
      }),
      
      // Delete related loan requests
      prisma.loanRequest.deleteMany({
        where: { userId }
      }),
      
      // Finally delete the user
      prisma.user.delete({
        where: { id: userId }
      })
    ]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to delete user", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}

export async function GET(
  request: Request, 
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        transactions: true,
        orders: true,
        loanRequests: true,
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch user details' },
      { status: 500 }
    );
  }
}