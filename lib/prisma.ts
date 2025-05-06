import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

// Configure Prisma Client with special handling for serverless environments
const prismaClientSingleton = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "production" ? ["error"] : ["query", "error", "warn"],
    // Configure better connection handling for serverless
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

  // Add custom middleware for better connection handling in serverless
  client.$use(async (params, next) => {
    const startTime = Date.now();
    
    try {
      // Create a promise that will timeout after 12 seconds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Query timeout: ${params.model}.${params.action} exceeded 12 seconds`));
        }, 12000);
      });
      
      // Race between the actual query and the timeout
      const result = await Promise.race([
        next(params),
        timeoutPromise
      ]);
      
      const duration = Date.now() - startTime;
      
      // Log slow queries in production
      if (duration > 5000) {
        console.warn(`Slow query detected (${duration}ms): ${params.model}.${params.action}`);
      }
      
      return result;
    } catch (error) {
      // Log connection errors in development
      if (process.env.NODE_ENV !== "production") {
        console.error(`Prisma Query Error (${params.model}.${params.action}):`, error);
      } else {
        // In production, log basic error information without sensitive details
        console.error(`Database error in ${params.model}.${params.action}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      // Rethrow for handling in the API route
      throw error;
    }
  });

  return client;
};

// Use the singleton pattern to prevent multiple instances
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

// Important for Next.js in development mode - prevent multiple instances
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Don't connect in the singleton to avoid issues during build
// Let each API route handle connection errors individually

export default prisma;
