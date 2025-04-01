import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";
import { cookies } from 'next/headers';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function GET() {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the user is an admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      include: {
        transactions: true,
        orders: true,
      },
    });

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { userId, action, message, userData } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'verify':
        await prisma.user.update({
          where: { id: userId },
          data: { isVerified: true }
        });
        break;
      
      case 'update':
        if (!userData) {
          return NextResponse.json(
            { success: false, error: 'User data is required for update action' },
            { status: 400 }
          );
        }
        await prisma.user.update({
          where: { id: userId },
          data: userData
        });
        break;
      
      case 'delete':
        await prisma.user.delete({
          where: { id: userId }
        });
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    if (message) {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (user) {
        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: user.email,
          subject: "Update from Trading Platform",
          text: message,
          html: `<div>${message}</div>`,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing user action:', error);
    return NextResponse.json(
      { success: false, error: 'Operation failed' }, 
      { status: 500 }
    );
  }
}