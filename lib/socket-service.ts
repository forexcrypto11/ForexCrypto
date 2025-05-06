import { Server } from 'socket.io';

// Define a global variable to maintain the socket.io server instance
declare global {
  var socketIOServer: Server | undefined;
}

// Initialize the Socket.IO server as a singleton
export function getSocketIOServer() {
  if (!global.socketIOServer) {
    global.socketIOServer = new Server({
      path: '/api/socket-io',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
      connectTimeout: 20000,
      pingTimeout: 25000,
      pingInterval: 10000,
      transports: ['websocket', 'polling'],
    });

    console.log('Socket.IO server initialized');

    // Set up Socket.IO event listeners
    setupSocketIOEvents(global.socketIOServer);
  }

  return global.socketIOServer;
}

// Configure Socket.IO event handlers
function setupSocketIOEvents(io: Server) {
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    
    // Echo test event for connection verification
    socket.on('ping', (data) => {
      console.log('Received ping', data);
      socket.emit('pong', { message: 'Server received ping', timestamp: Date.now() });
    });
    
    // Handle dashboard data requests
    socket.on('getDashboardData', async (userId: string) => {
      if (!userId) {
        socket.emit('dashboardError', { error: 'User ID not provided' });
        return;
      }
      
      try {
        socket.emit('dashboardData', { dashboardData: { 
          message: 'Sample dashboard data',
          userId,
          timestamp: new Date().toISOString()
        }});
        console.log(`Dashboard data response sent for user ${userId}`);
      } catch (error) {
        console.error('Error handling dashboard data request:', error);
        socket.emit('dashboardError', { 
          error: 'Failed to fetch dashboard data',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });
    
    // Handle orders data requests
    socket.on('getOrdersData', async (userId: string) => {
      if (!userId) {
        socket.emit('ordersError', { error: 'User ID not provided' });
        return;
      }
      
      try {
        socket.emit('ordersData', { 
          success: true,
          message: 'Sample orders data',
          userId,
          timestamp: new Date().toISOString() 
        });
        console.log(`Orders data response sent for user ${userId}`);
      } catch (error) {
        console.error('Error handling orders data request:', error);
        socket.emit('ordersError', { 
          error: 'Failed to fetch orders data',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });
    
    // Handle client disconnections
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
} 