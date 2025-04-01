import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Create the new order
    const newOrder = await prisma.orderHistory.create({
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

    return NextResponse.json(newOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}