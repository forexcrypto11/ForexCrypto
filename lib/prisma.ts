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
    try {
      return await next(params);
    } catch (error) {
      // Log connection errors in development
      if (process.env.NODE_ENV !== "production") {
        console.error(`Prisma Query Error (${params.model}.${params.action}):`, error);
      }
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
