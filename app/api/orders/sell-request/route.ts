import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { TradeStatus } from "@/app/types/orders";

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the order and verify ownership
    const order = await prisma.orderHistory.findFirst({
      where: {
        id: orderId,
        userId,
        status: TradeStatus.OPEN as any,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found or not available for selling" },
        { status: 404 }
      );
    }

    // Update the order to PENDING_SELL status
    const updatedOrder = await prisma.orderHistory.update({
      where: {
        id: orderId,
      },
      data: {
        status: TradeStatus.PENDING_SELL as any,
      },
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Error processing sell request:", error);
    return NextResponse.json(
      { error: "Failed to process sell request" },
      { status: 500 }
    );
  }
} 