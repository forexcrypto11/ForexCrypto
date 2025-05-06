import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { withTimeoutHandler } from '@/app/api/utils/timeout-wrapper';

export const GET = async () => {
  const headersList = headers();
  const userId = headersList.get("x-user-id");

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "User ID not provided" },
      { status: 401 }
    );
  }

  // Use our wrapper to handle timeouts consistently
  return withTimeoutHandler(async () => {
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
  }, 15000)(); // 15 second timeout and immediately invoke
}