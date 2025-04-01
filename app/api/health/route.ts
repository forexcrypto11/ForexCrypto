import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

async function checkConnectivity(host: string): Promise<string> {
    try {
        const { stdout, stderr } = await execPromise(`ping -c 1 ${host}`);
        return stdout || 'Ping successful but no output';
    } catch (error) {
        return `Ping failed: ${error instanceof Error ? error.message : 'unknown error'}`;
    }
}

export async function GET() {
    try {
        // Extract host from database URL for diagnostics
        const dbUrl = process.env.DATABASE_URL || '';
        let host = '';
        try {
            host = new URL(dbUrl.replace(/^postgresql:/, 'http:')).hostname;
        } catch (error) {
            console.error('Failed to parse database URL:', error);
        }

        // Try to connect to the database with a timeout
        const connectPromise = prisma.$queryRaw`SELECT NOW() as current_time`;
        
        // Set a timeout for the connection attempt
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error('Database connection timeout after 10 seconds'));
            }, 10000);
        });
        
        // Race the connection against the timeout
        const result = await Promise.race([connectPromise, timeoutPromise]);
        
        return NextResponse.json({
            status: 'healthy',
            database: 'connected',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            poolerInfo: dbUrl ? dbUrl.split('@')[1]?.split('/')[0] : 'not set',
            result
        });
    } catch (error) {
        console.error('Health check failed:', error);
        
        // Attempt to diagnose connectivity issues
        let connectivity = 'unknown';
        const dbUrl = process.env.DATABASE_URL || '';
        let host = '';
        
        try {
            const url = new URL(dbUrl.replace(/^postgresql:/, 'http:'));
            host = url.hostname;
            if (host) {
                connectivity = await checkConnectivity(host);
            }
        } catch (parseError) {
            console.error('Failed to parse database URL for diagnostics:', parseError);
            connectivity = 'Failed to parse database URL';
        }
        
        // Provide more detailed error diagnostics
        let errorDetails = 'Unknown error';
        if (error instanceof Error) {
            errorDetails = error.message;
            if (error.stack) {
                console.error('Stack trace:', error.stack);
            }
        }
        
        return NextResponse.json({
            status: 'unhealthy',
            database: 'disconnected',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            host: host || 'unknown',
            error: errorDetails,
            connectivity,
            databaseUrl: dbUrl ? `${dbUrl.split('@')[1]?.split('/')[0]}` : 'not set'
        }, { status: 500 });
    }
} 