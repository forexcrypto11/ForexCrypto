import { NextResponse } from 'next/server';

export async function POST() {
  try {
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
} 