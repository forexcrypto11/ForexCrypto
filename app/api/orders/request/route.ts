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
    
    const {
      symbol,
      quantity,
      buyPrice,
      tradeAmount,
      type,
    } = await req.json();

    // Basic validation
    if (!symbol || !quantity || !buyPrice || !tradeAmount || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create a new order with PENDING status
    const order = await prisma.orderHistory.create({
      data: {
        userId,
        symbol,
        quantity,
        buyPrice,
        tradeAmount,
        type,
        status: TradeStatus.PENDING as any,
        tradeDate: new Date(),
      },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Error creating order request:", error);
    return NextResponse.json(
      { error: "Failed to create order request" },
      { status: 500 }
    );
  }
} 