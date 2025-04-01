import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      amount,
      paymentMethod = "CARD",
      userId
    } = await req.json();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // Update transaction with more details
      await prisma.transaction.update({
        where: {
          transactionId: razorpay_order_id,
        },
        data: {
          status: "COMPLETED",
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          paymentMethod,
          metadata: {
            verificationTimestamp: new Date().toISOString(),
            verificationSuccess: true
          }
        },
      });

      return NextResponse.json({ success: true });
    } else {
      // Update transaction as failed
      await prisma.transaction.update({
        where: {
          transactionId: razorpay_order_id,
        },
        data: {
          status: "FAILED",
          failureReason: "Signature verification failed",
          metadata: {
            verificationTimestamp: new Date().toISOString(),
            verificationSuccess: false,
            expectedSignature,
            receivedSignature: razorpay_signature
          }
        },
      });

      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Error verifying payment" },
      { status: 500 }
    );
  }
}