import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import initSocketIO from '@/lib/socketio';

// This handler initializes and runs our Socket.IO server for App Router
export async function GET(request: NextRequest) {
  try {
    // Access the response object from the environment
    const responseServerField = (process as any).res?.socket?.server;
    
    if (responseServerField) {
      initSocketIO(responseServerField);
      
      // Return a success response
      return NextResponse.json({ 
        success: true, 
        message: 'Socket.IO server is running with App Router', 
        timestamp: new Date().toISOString() 
      });
    } else {
      console.error('Server field not found in process');
      return NextResponse.json(
        { success: false, message: 'Socket.IO initialization failed - server not found' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error initializing socket-io server:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to initialize Socket.IO server', error: String(error) },
      { status: 500 }
    );
  }
} 