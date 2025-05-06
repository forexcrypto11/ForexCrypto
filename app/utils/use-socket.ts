import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/app/auth-context';

// Define the socket URL based on environment
const getSocketURL = () => {
  return process.env.NODE_ENV === 'production' 
    ? window.location.origin
    : 'http://localhost:3000';
};

// Set up types for our data
export type DashboardData = {
  accountBalance: number;
  baseAccountBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  openPositionsProfitLoss: number;
  closedPositionsProfitLoss: number;
  totalProfitLoss: number;
  totalTrades: number;
  totalVolume: number;
  approvedLoanAmount: number;
  totalOpenOrdersAmount: number;
  totalClosedOrdersAmount: number;
  totalOrdersAmount: number;
  approvedLoanDetails?: {
    amount: number;
    duration: number;
    updatedAt: string;
  } | null;
  recentTransactions: Array<{
    id: string;
    type: 'DEPOSIT' | 'WITHDRAW';
    amount: number;
    timestamp: string;
    status: string;
    verified: boolean;
  }>;
  openPositions: Array<{
    id: string;
    symbol: string;
    type: string;
    profitLoss: number;
    tradeDate: string;
    quantity: number;
    buyPrice: number;
  }>;
  closedPositions: Array<{
    id: string;
    symbol: string;
    type: string;
    profitLoss: number;
    tradeDate: string;
    quantity: number;
    buyPrice: number;
    sellPrice: number;
  }>;
};

export type Order = {
  id: string;
  status: 'OPEN' | 'CLOSED';
  quantity: number;
  buyPrice: number;
  symbol: string;
  type: string;
  profitLoss: number;
  tradeDate: string;
  tradeAmount?: number;
};

export type OrdersResponse = {
  success: boolean;
  orders: Order[];
  totalProfitLoss: number;
  closedPositionsProfitLoss: number;
  openPositionsProfitLoss: number;
};

/**
 * Custom hook to use Socket.IO for dashboard and orders data
 */
export function useSocket() {
  const { userId } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Data states
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [ordersData, setOrdersData] = useState<OrdersResponse | null>(null);
  
  // Connection handler with retry logic
  useEffect(() => {
    if (!userId) return;
    
    // Maximum retry attempts
    const MAX_RETRIES = 5;
    let retryCount = 0;
    let connectionTimeout: NodeJS.Timeout | null = null;
    
    // Cleanup function
    const cleanup = () => {
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
    
    // Connect function with retry logic
    const connect = () => {
      cleanup(); // Clear previous connection
      
      try {
        console.log('Initializing socket connection...');
        
        // Initialize socket connection with updated path
        const socket = io(getSocketURL(), {
          path: '/api/socket-io',
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 30000,
          transports: ['websocket', 'polling'],
          forceNew: true,
          autoConnect: true
        });
        
        socketRef.current = socket;
        
        // Send a ping to verify connection works
        socket.on('connect', () => {
          console.log('Socket connected, sending ping to verify connection');
          socket.emit('ping', { message: 'Hello from client', timestamp: Date.now() });
          
          setIsConnected(true);
          setError(null);
          retryCount = 0; // Reset retry count on successful connection
        });
        
        // Handle pong response
        socket.on('pong', (data) => {
          console.log('Received pong from server:', data);
          // After pong verified, request actual data
          getDashboardData();
          getOrdersData();
        });
        
        // Handle connection errors
        socket.on('connect_error', (err) => {
          console.error('Socket connection error:', err);
          setError(new Error(`Connection error: ${err.message}`));
          setIsConnected(false);
          
          // Retry logic
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            console.log(`Retrying connection (${retryCount}/${MAX_RETRIES})...`);
            
            // Exponential backoff
            const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
            connectionTimeout = setTimeout(connect, delay);
          } else {
            console.error('Maximum retry attempts reached');
          }
        });
        
        // Handle disconnection
        socket.on('disconnect', (reason) => {
          console.log(`Socket disconnected: ${reason}`);
          setIsConnected(false);
          
          // Auto reconnect for certain disconnect reasons
          if (reason === 'io server disconnect' || reason === 'transport close') {
            // The disconnection was initiated by the server, reconnect manually
            console.log('Reconnecting...');
            socket.connect();
          }
        });
        
        // Dashboard data handlers
        socket.on('dashboardData', (data) => {
          console.log("Received dashboard data:", data);
          if (data && data.dashboardData) {
            setDashboardData(data.dashboardData);
            setIsLoading(false);
            setLastUpdated(new Date());
          } else {
            console.error("Received malformed dashboard data:", data);
            setError(new Error("Received invalid dashboard data format"));
          }
        });
        
        socket.on('dashboardError', (error) => {
          console.error('Dashboard data error:', error);
          setError(new Error(error.error || "Unknown dashboard error"));
          setIsLoading(false);
        });
        
        // Orders data handlers
        socket.on('ordersData', (data) => {
          console.log("Received orders data:", data);
          setOrdersData(data);
          setIsLoading(false);
          setLastUpdated(new Date());
        });
        
        socket.on('ordersError', (error) => {
          console.error('Orders data error:', error);
          setError(new Error(error.error || "Unknown orders error"));
          setIsLoading(false);
        });
      } catch (err) {
        console.error('Error initializing socket:', err);
        setError(new Error(`Failed to initialize socket connection: ${err instanceof Error ? err.message : String(err)}`));
        setIsConnected(false);
        
        // Also retry on initialization errors
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
          connectionTimeout = setTimeout(connect, delay);
        }
      }
    };
    
    // Start initial connection
    connect();
    
    // Cleanup on unmount
    return cleanup;
  }, [userId]);
  
  // Function to request dashboard data
  const getDashboardData = useCallback(() => {
    if (!socketRef.current || !userId || !isConnected) return;
    
    console.log("Requesting dashboard data for userId:", userId);
    setIsLoading(true);
    socketRef.current.emit('getDashboardData', userId);
  }, [userId, isConnected]);
  
  // Function to request orders data
  const getOrdersData = useCallback(() => {
    if (!socketRef.current || !userId || !isConnected) return;
    
    console.log("Requesting orders data for userId:", userId);
    setIsLoading(true);
    socketRef.current.emit('getOrdersData', userId);
  }, [userId, isConnected]);
  
  // Function to refresh all data
  const refreshData = useCallback(() => {
    if (!isConnected) {
      console.log("Cannot refresh, not connected");
      return;
    }
    
    console.log("Refreshing all data");
    getDashboardData();
    getOrdersData();
  }, [getDashboardData, getOrdersData, isConnected]);
  
  // Set up periodic refresh with exponential backoff on errors
  useEffect(() => {
    if (!isConnected) return;
    
    let refreshInterval = 30000; // 30 seconds default
    
    // If there was an error, use a shorter interval for the next attempt
    if (error) {
      refreshInterval = 5000; // 5 seconds on error
    }
    
    const interval = setInterval(() => {
      refreshData();
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshData, isConnected, error]);
  
  return {
    isConnected,
    isLoading,
    error,
    dashboardData,
    ordersData,
    refreshData,
    lastUpdated,
  };
}

export default useSocket; 