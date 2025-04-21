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

    console.log("[API:ORDERS] Fetching orders for user:", userId);
    const orders = await prisma.orderHistory.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`[API:ORDERS] Found ${orders.length} orders`);
    
    // Calculate profit/loss from both closed and open positions (matching dashboard calculation)
    const closedOrders = orders.filter(order => order.status === "CLOSED");
    console.log(`[API:ORDERS] Closed orders: ${closedOrders.length}`);
    
    const closedPositionsProfitLoss = closedOrders
      .reduce((sum, order) => {
        const orderPL = order.profitLoss || 0;
        console.log(`[API:ORDERS] Closed order ${order.id}: PL = ${orderPL}`);
        return sum + orderPL;
      }, 0);
    
    console.log(`[API:ORDERS] Total closed positions P/L: ${closedPositionsProfitLoss}`);
    
    const openOrders = orders.filter(order => order.status === "OPEN");
    console.log(`[API:ORDERS] Open orders: ${openOrders.length}`);
    
    const openPositionsProfitLoss = openOrders
      .reduce((sum, order) => {
        const orderPL = order.profitLoss || 0;
        console.log(`[API:ORDERS] Open order ${order.id}: PL = ${orderPL}`);
        return sum + orderPL;
      }, 0);
    
    console.log(`[API:ORDERS] Total open positions P/L: ${openPositionsProfitLoss}`);
    
    const totalProfitLoss = closedPositionsProfitLoss + openPositionsProfitLoss;
    console.log(`[API:ORDERS] Total P/L (closed + open): ${totalProfitLoss}`);
    
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