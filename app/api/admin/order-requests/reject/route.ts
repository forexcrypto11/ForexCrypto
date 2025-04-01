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
        { error: "Only pending orders can be rejected" },
        { status: 400 }
      );
    }

    // Delete the order
    await prisma.orderHistory.delete({
      where: { id: orderId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error rejecting order:", error);
    return NextResponse.json(
      { error: "Failed to reject order" },
      { status: 500 }
    );
  }
}