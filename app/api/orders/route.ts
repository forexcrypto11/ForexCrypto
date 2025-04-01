import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function GET() {
  try {
    const headersList = headers();
    const userId = headersList.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID not provided" },
        { status: 401 }
      );
    }

    const orders = await prisma.orderHistory.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Calculate total profit/loss from closed orders
    const totalProfitLoss = orders
      .filter(order => order.status === "CLOSED")
      .reduce((sum, order) => sum + (order.profitLoss || 0), 0);
    
    return NextResponse.json({ 
      success: true,
      orders,
      totalProfitLoss
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}