import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { OrderHistory } from "@prisma/client";

// Define type for update data
type OrderUpdateData = Omit<OrderHistory, "id" | "createdAt" | "updatedAt"> & {
  tradeDate: string;
};

export async function DELETE(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const deletedOrder = await prisma.orderHistory.delete({
      where: { id: orderId },
    });

    if (!deletedOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const data = await request.json() as OrderUpdateData;

    // Validate required fields
    const requiredFields = ['symbol', 'quantity', 'type', 'status', 'userId'];
    const missingFields = requiredFields.filter(field => !(field in data));
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Update the order
    const updatedOrder = await prisma.orderHistory.update({
      where: { id: orderId },
      data: {
        symbol: data.symbol,
        quantity: data.quantity,
        buyPrice: data.buyPrice,
        sellPrice: data.sellPrice,
        tradeAmount: data.tradeAmount,
        type: data.type,
        status: data.status,
        tradeDate: new Date(data.tradeDate),
        profitLoss: data.profitLoss,
        userId: data.userId,
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}