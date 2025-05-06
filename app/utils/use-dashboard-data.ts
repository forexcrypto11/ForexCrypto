import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/auth-context';
import { DashboardData, OrdersResponse } from './use-socket';

// Helper function to get cached data from localStorage
const getCachedData = <T>(key: string): T | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      
      // Check if data is still fresh (less than 5 minutes old)
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        return data;
      }
    }
    return null;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
};

// Helper function to set cached data in localStorage
const setCachedData = <T>(key: string, data: T): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Error writing to cache:', error);
  }
};

/**
 * A hook to fetch real dashboard data from the database via REST API
 * with caching to prevent unnecessary reloads
 */
export function useDashboardData() {
  const { userId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Initialize with cached data if available
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(() => {
    return getCachedData<DashboardData>('dashboardData');
  });
  
  const [ordersData, setOrdersData] = useState<OrdersResponse | null>(() => {
    return getCachedData<OrdersResponse>('ordersData');
  });
  
  // Fetch dashboard data with efficient error handling
  const fetchDashboardData = useCallback(async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Use Promise.all to fetch both endpoints in parallel
      const [dashboardResponse, ordersResponse] = await Promise.all([
        fetch('/api/dashboard-data'),
        fetch('/api/orders-data')
      ]);
      
      // Check for response errors
      if (!dashboardResponse.ok) {
        throw new Error(`Dashboard data request failed with status: ${dashboardResponse.status}`);
      }
      
      if (!ordersResponse.ok) {
        throw new Error(`Orders data request failed with status: ${ordersResponse.status}`);
      }
      
      // Parse JSON responses in parallel
      const [dashboardResult, ordersResult] = await Promise.all([
        dashboardResponse.json(),
        ordersResponse.json()
      ]);
      
      // Update state with fetched data
      if (dashboardResult.success && dashboardResult.dashboardData) {
        setDashboardData(dashboardResult.dashboardData);
        setCachedData('dashboardData', dashboardResult.dashboardData);
      } else {
        throw new Error(dashboardResult.message || 'Failed to fetch dashboard data');
      }
      
      if (ordersResult.success) {
        setOrdersData(ordersResult);
        setCachedData('ordersData', ordersResult);
      } else {
        throw new Error(ordersResult.message || 'Failed to fetch orders data');
      }
      
      // Update timestamp
      const now = new Date();
      setLastUpdated(now);
      setCachedData('lastUpdated', now.toISOString());
    } catch (err) {
      console.error("Data fetch error:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [userId]);
  
  // Function to refresh all data
  const refreshData = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);
  
  // Initial data fetch on component mount - only if we don't have cached data
  useEffect(() => {
    if (userId && (!dashboardData || !ordersData)) {
      refreshData();
    }
  }, [userId, refreshData, dashboardData, ordersData]);
  
  // Periodic refresh every 30 seconds - still maintain this for fresh data
  useEffect(() => {
    if (!userId) return;
    
    const intervalId = setInterval(() => {
      refreshData();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [userId, refreshData]);
  
  return {
    isLoading,
    error,
    dashboardData,
    ordersData,
    refreshData,
    lastUpdated,
    isConnected: !error
  };
} 