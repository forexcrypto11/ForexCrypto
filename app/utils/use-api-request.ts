import { useState, useCallback } from 'react';

/**
 * Custom hook for making API requests with timeout support
 */
export function useApiRequest() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  /**
   * Makes a fetch request with timeout support
   */
  const fetchWithTimeout = useCallback(async <T>(
    url: string, 
    options?: RequestInit & { timeoutMs?: number }
  ): Promise<T> => {
    const { timeoutMs = 15000, ...fetchOptions } = options || {};
    
    setIsLoading(true);
    setError(null);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          ...fetchOptions?.headers,
          'Cache-Control': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      return data as T;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      
      // Add a custom property to distinguish timeout errors
      if (error.name === 'AbortError') {
        Object.defineProperty(error, 'isTimeout', { value: true });
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return {
    fetchWithTimeout,
    isLoading,
    error,
    isTimeout: error?.name === 'AbortError'
  };
}

export default useApiRequest; 