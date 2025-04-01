import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    // Check if user is admin
    const cookieStore = cookies();
    const userRole = cookieStore.get('userRole')?.value;
    
    if (!userRole || userRole !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all orders with PENDING or PENDING_SELL status
    const pendingOrders = await prisma.orderHistory.findMany({
      where: {
        OR: [
          { status: "PENDING" as any },
          { status: "PENDING_SELL" as any }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
    });

    return NextResponse.json({ orders: pendingOrders });
  } catch (error) {
    console.error("Error fetching pending orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending orders" },
      { status: 500 }
    );
  }
} 