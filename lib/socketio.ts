import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import prisma from '@/lib/prisma';

// Define types for better integration with Next.js
type NextServerWithIO = NetServer & {
  io?: SocketIOServer;
};

// Socket server instance (singleton)
let io: SocketIOServer | null = null;

/**
 * Initialize and configure the Socket.IO server
 */
export const initSocketIO = (httpServer: NextServerWithIO) => {
  if (!io) {
    if (!httpServer.io) {
      console.log('Initializing Socket.IO server...');
      
      // Create new Socket.IO server
      io = new SocketIOServer(httpServer, {
        path: '/api/socket-io',
        addTrailingSlash: false,
        cors: {
          origin: '*',
          methods: ['GET', 'POST'],
        },
        connectTimeout: 30000,
        pingTimeout: 30000,
        pingInterval: 10000,
        transports: ['websocket', 'polling'],
      });
      
      // Store the Socket.IO server instance for reuse
      httpServer.io = io;
      
      // Set up connection handler
      io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);
        
        // Echo test event for connection verification
        socket.on('ping', (data) => {
          console.log('Received ping', data);
          socket.emit('pong', { message: 'Server received ping', timestamp: Date.now() });
        });
        
        // Handle dashboard data requests
        socket.on('getDashboardData', async (userId: string) => {
          console.log(`Received dashboard data request for user ${userId}`);
          
          if (!userId) {
            socket.emit('dashboardError', { error: 'User ID not provided' });
            return;
          }
          
          try {
            const startTime = Date.now();
            
            // Set up a timeout for the database queries
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => {
                reject(new Error('Dashboard data query timed out after 15 seconds'));
              }, 15000);
            });
            
            // Race the actual data fetch against the timeout
            const dashboardData = await Promise.race([
              fetchDashboardData(userId),
              timeoutPromise
            ]) as Awaited<ReturnType<typeof fetchDashboardData>>;
            
            const elapsedTime = Date.now() - startTime;
            console.log(`Dashboard data fetched in ${elapsedTime}ms for user ${userId}`);
            
            socket.emit('dashboardData', { dashboardData });
          } catch (error) {
            console.error('Error fetching dashboard data:', error);
            socket.emit('dashboardError', { 
              error: 'Failed to fetch dashboard data',
              details: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        });
        
        // Handle orders data requests
        socket.on('getOrdersData', async (userId: string) => {
          console.log(`Received orders data request for user ${userId}`);
          
          if (!userId) {
            socket.emit('ordersError', { error: 'User ID not provided' });
            return;
          }
          
          try {
            const startTime = Date.now();
            
            // Set up a timeout for the database queries
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => {
                reject(new Error('Orders data query timed out after 15 seconds'));
              }, 15000);
            });
            
            // Race the actual data fetch against the timeout
            const ordersData = await Promise.race([
              fetchOrdersData(userId),
              timeoutPromise
            ]) as Awaited<ReturnType<typeof fetchOrdersData>>;
            
            const elapsedTime = Date.now() - startTime;
            console.log(`Orders data fetched in ${elapsedTime}ms for user ${userId}`);
            
            socket.emit('ordersData', ordersData);
          } catch (error) {
            console.error('Error fetching orders data:', error);
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
    } else {
      io = httpServer.io;
    }
  }
  
  return io;
};

/**
 * Fetch dashboard data for a specific user
 */
async function fetchDashboardData(userId: string) {
  try {
    // Fetch all data in parallel for better performance
    const [
      totalDeposits,
      totalWithdrawals,
      recentTransactions,
      openPositions,
      closedPositions,
      approvedLoan,
      verifiedOrdersAmount,
      totalVolumeData,
      totalTradesCount
    ] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          userId,
          type: 'DEPOSIT',
          status: 'COMPLETED',
          verified: true
        },
        _sum: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: {
          userId,
          type: 'WITHDRAW',
          status: 'COMPLETED'
        },
        _sum: { amount: true }
      }),
      prisma.transaction.findMany({
        where: { 
          userId,
          OR: [
            { 
              type: 'WITHDRAW',
              status: 'COMPLETED'
            },
            { 
              type: 'DEPOSIT',
              status: 'COMPLETED',
              verified: true
            }
          ]
        },
        orderBy: { timestamp: 'desc' },
        take: 5,
        select: {
          id: true,
          type: true,
          amount: true,
          timestamp: true,
          status: true,
          verified: true
        }
      }),
      prisma.orderHistory.findMany({
        where: { 
          userId,
          status: 'OPEN'
        },
        orderBy: { tradeDate: 'desc' },
        select: {
          id: true,
          symbol: true,
          type: true,
          profitLoss: true,
          tradeDate: true,
          quantity: true,
          buyPrice: true,
          tradeAmount: true
        }
      }),
      prisma.orderHistory.findMany({
        where: { 
          userId,
          status: 'CLOSED'
        },
        orderBy: { tradeDate: 'desc' },
        take: 5,
        select: {
          id: true,
          symbol: true,
          type: true,
          profitLoss: true,
          tradeDate: true,
          quantity: true,
          buyPrice: true,
          sellPrice: true,
          tradeAmount: true
        }
      }),
      prisma.loanRequest.aggregate({
        where: {
          userId,
          status: 'APPROVED'
        },
        orderBy: {
          updatedAt: 'desc'
        },
        _sum: { amount: true }
      }),
      prisma.orderHistory.aggregate({
        where: {
          userId,
          OR: [
            { status: 'OPEN' },
            { status: 'CLOSED' }
          ]
        },
        _sum: { tradeAmount: true }
      }),
      prisma.orderHistory.aggregate({
        where: { userId },
        _sum: { tradeAmount: true }
      }),
      prisma.orderHistory.count({
        where: { userId }
      })
    ]);

    // Calculate values
    const baseAccountBalance = (totalDeposits._sum.amount || 0) - (totalWithdrawals._sum.amount || 0);
    const approvedLoanAmount = approvedLoan?._sum?.amount ?? 0;
    const totalOrdersAmount = verifiedOrdersAmount?._sum?.tradeAmount ?? 0;
    
    const closedPositionsProfitLoss = closedPositions.reduce((sum, position) => {
      return sum + (position.profitLoss || 0);
    }, 0);
    
    const openPositionsProfitLoss = openPositions.reduce((sum, position) => {
      return sum + (position.profitLoss || 0);
    }, 0);
    
    const totalProfitLoss = closedPositionsProfitLoss + openPositionsProfitLoss;

    // Calculate additional values for the response
    const totalOpenOrdersAmount = openPositions.reduce((sum, pos) => sum + (pos.tradeAmount || 0), 0);
    const totalClosedOrdersAmount = closedPositions.reduce((sum, pos) => sum + (pos.tradeAmount || 0), 0);
    
    return {
      accountBalance: baseAccountBalance + approvedLoanAmount - totalOpenOrdersAmount + totalProfitLoss,
      baseAccountBalance,
      totalDeposits: totalDeposits._sum.amount || 0,
      totalWithdrawals: totalWithdrawals._sum.amount || 0,
      openPositionsProfitLoss,
      closedPositionsProfitLoss,
      totalProfitLoss,
      totalTrades: totalTradesCount,
      totalVolume: totalVolumeData._sum.tradeAmount || 0,
      approvedLoanAmount,
      totalOrdersAmount,
      recentTransactions,
      openPositions,
      closedPositions,
      totalOpenOrdersAmount,
      totalClosedOrdersAmount,
      approvedLoanDetails: approvedLoan
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
}

/**
 * Fetch orders data for a specific user
 */
async function fetchOrdersData(userId: string) {
  try {
    const orders = await prisma.orderHistory.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Calculate profit/loss from both closed and open positions
    const closedOrders = orders.filter(order => order.status === "CLOSED");
    
    const closedPositionsProfitLoss = closedOrders
      .reduce((sum, order) => {
        const orderPL = order.profitLoss || 0;
        return sum + orderPL;
      }, 0);
    
    const openOrders = orders.filter(order => order.status === "OPEN");
  
    const openPositionsProfitLoss = openOrders
      .reduce((sum, order) => {
        const orderPL = order.profitLoss || 0;
        return sum + orderPL;
      }, 0);
    
    const totalProfitLoss = closedPositionsProfitLoss + openPositionsProfitLoss;
   
    return { 
      success: true,
      orders,
      totalProfitLoss,
      closedPositionsProfitLoss,
      openPositionsProfitLoss
    };
  } catch (error) {
    console.error('Error fetching orders data:', error);
    throw error;
  }
}

export default initSocketIO; 