import { NextResponse } from 'next/server';

/**
 * Wraps API handlers to provide consistent timeout and error handling
 * @param handler The API handler function to wrap
 * @param timeoutMs Timeout in milliseconds (default: 10000ms)
 */
export const withTimeoutHandler = <T extends Response>(
  handler: () => Promise<T>,
  timeoutMs = 10000
): () => Promise<Response> => {
  return async () => {
    try {
      // Create a promise that times out
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('API request timed out'));
        }, timeoutMs);
      });
      
      // Race the handler against the timeout
      const result = await Promise.race([
        handler(),
        timeoutPromise
      ]);
      
      return result;
    } catch (error) {
      // Log the error
      console.error('API Error:', error);
      
      // Determine if it's a timeout error
      const isTimeout = 
        error instanceof Error && 
        (error.message === 'API request timed out' || error.name === 'AbortError');
      
      // Return appropriate error response
      if (isTimeout) {
        return NextResponse.json(
          { error: 'The request timed out. Please try again later.' },
          { status: 504 }
        );
      }
      
      // General error response
      return NextResponse.json(
        { error: 'An error occurred processing your request' },
        { status: 500 }
      );
    }
  };
};

export default withTimeoutHandler; 