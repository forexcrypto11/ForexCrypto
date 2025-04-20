import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // This endpoint doesn't need to do anything except return success
    // The existence of this endpoint allows us to trigger cache invalidation
    return NextResponse.json({ 
      success: true,
      message: "User dashboard refresh triggered"
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to refresh dashboard" },
      { status: 500 }
    );
  }
} 