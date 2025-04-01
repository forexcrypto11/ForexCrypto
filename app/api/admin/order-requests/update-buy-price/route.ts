import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    // Check if user is admin
    const cookieStore = cookies();
    const userRole = cookieStore.get('userRole')?.value;
    
    if (!userRole || userRole !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, buyPrice } = await req.json();
    
    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    if (buyPrice === undefined || buyPrice <= 0) {
      return NextResponse.json(
        { error: "Valid buy price is required" },
        { status: 400 }
      );
    }

    // First check if order exists and is in PENDING status
    const existingOrder = await prisma.orderHistory.findUnique({
      where: { id: orderId }
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    if (existingOrder.status.toString() !== "PENDING") {
      return NextResponse.json(
        { error: "Only pending orders can be updated" },
        { status: 400 }
      );
    }

    // Calculate new trade amount
    const newTradeAmount = buyPrice * existingOrder.quantity;

    // Update the order with new buy price and trade amount
    const updatedOrder = await prisma.orderHistory.update({
      where: { id: orderId },
      data: {
        buyPrice: buyPrice,
        tradeAmount: newTradeAmount
      },
    });

    return NextResponse.json({ 
      success: true, 
      order: updatedOrder 
    });
  } catch (error) {
    console.error("Error updating buy price:", error);
    return NextResponse.json(
      { error: "Failed to update buy price" },
      { status: 500 }
    );
  }
} 