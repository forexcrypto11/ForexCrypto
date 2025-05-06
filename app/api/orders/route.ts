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
    
    // Calculate profit/loss from both closed and open positions (matching dashboard calculation)
    const closedOrders = orders.filter(order => order.status === "CLOSED");
    
    const closedPositionsProfitLoss = closedOrders
      .reduce((sum, order) => {
        const orderPL = order.profitLoss || 0;
        return sum + orderPL;
      }, 0);
    

    const openOrders = orders.filter(order => order.status === "OPEN");
  
    const openPositionsProfitLoss = openOrders
      .reduce((sum, order) => {
        const orderPL = order.profitLoss || 0;
        return sum + orderPL;
      }, 0);
    
   
    const totalProfitLoss = closedPositionsProfitLoss + openPositionsProfitLoss;
   
    return NextResponse.json({ 
      success: true,
      orders,
      totalProfitLoss,
      closedPositionsProfitLoss,
      openPositionsProfitLoss
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}