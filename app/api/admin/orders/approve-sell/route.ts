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

    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { orderId, sellPrice } = await req.json();

    if (!orderId || !sellPrice) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (sellPrice <= 0) {
      return NextResponse.json(
        { error: "Sell price must be greater than 0" },
        { status: 400 }
      );
    }

    // Find the order and verify it's in PENDING_SELL status
    const order = await prisma.orderHistory.findFirst({
      where: {
        id: orderId,
        status: TradeStatus.PENDING_SELL as any,
      },
      include: {
        user: true // Include user data to update their totals
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found or not in pending sell status" },
        { status: 404 }
      );
    }

    // Calculate profit/loss
    const profitLoss = (sellPrice - order.buyPrice) * order.quantity;

    // Update both the order AND user's profit totals in a transaction
    const [updatedOrder, updatedUser] = await prisma.$transaction([
      prisma.orderHistory.update({
        where: { id: orderId },
        data: {
          status: TradeStatus.CLOSED as any,
          sellPrice: sellPrice,
          profitLoss,
          updatedAt: new Date()
        },
      }),
      prisma.user.update({
        where: { id: order.userId },
        data: {
          updatedAt: new Date()
        }
      })
    ]);

    return NextResponse.json({ 
      success: true, 
      order: updatedOrder,
      user: updatedUser
    });
  } catch (error) {
    console.error("Error approving sell request:", error);
    return NextResponse.json(
      { error: "Failed to approve sell request" },
      { status: 500 }
    );
  }
} 