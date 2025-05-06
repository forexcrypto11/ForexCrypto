import { NextResponse } from 'next/server';
import { getSocketIOServer } from '@/lib/socket-service';

export async function GET(req: Request) {
  try {
    // Initialize the Socket.IO server (will reuse existing instance if already created)
    const io = getSocketIOServer();
    
    // Return a success response
    return NextResponse.json({ 
      success: true, 
      message: 'Socket.IO server is running',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error initializing socket server:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to initialize Socket.IO server', error: String(error) },
      { status: 500 }
    );
  }
} 
