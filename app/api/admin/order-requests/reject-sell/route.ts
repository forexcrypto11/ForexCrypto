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

    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // First check if order exists and is in PENDING_SELL status
    const existingOrder = await prisma.orderHistory.findUnique({
      where: { id: orderId }
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    if (existingOrder.status.toString() !== "PENDING_SELL") {
      return NextResponse.json(
        { error: "Only pending sell orders can be rejected" },
        { status: 400 }
      );
    }

    // Update the order status back to OPEN and remove the sell price
    const updatedOrder = await prisma.orderHistory.update({
      where: { id: orderId },
      data: {
        status: "OPEN" as any,
        sellPrice: null,
      },
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Error rejecting sell request:", error);
    return NextResponse.json(
      { error: "Failed to reject sell request" },
      { status: 500 }
    );
  }
} 