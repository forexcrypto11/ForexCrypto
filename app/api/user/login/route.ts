import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ 
                success: false,
                error: 'Missing email or password' 
            }, { status: 400 });
        }

        // Add a connection timeout handler
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error('Database connection timeout after 10 seconds'));
            }, 10000);
        });

        // Query with timeout
        const userPromise = prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                password: true,
                isVerified: true,
                role: true,
                name: true,
                status: true
            }
        });

        // Race the query against the timeout
        const user = await Promise.race([userPromise, timeoutPromise]) as any;

        if (!user) {
            return NextResponse.json({ 
                success: false,
                error: 'Invalid credentials' 
            }, { status: 401 });
        }

        if (user.isVerified === 'FALSE') {
            return NextResponse.json({ 
                success: false,
                error: 'Account pending approval' 
            }, { status: 403 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json({ 
                success: false,
                error: 'Invalid credentials' 
            }, { status: 401 });
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                isVerified: user.isVerified,
                role: user.role,
                name: user.name
            }
        }, { status: 200 });
    } catch (error) {
        console.error('Login error:', error);
        
        // Categorize errors for better client handling
        let statusCode = 500;
        let errorMessage = 'An unexpected error occurred';
        
        if (error instanceof Error) {
            if (error.message.includes('timeout')) {
                statusCode = 504;
                errorMessage = 'Request timeout';
            } else if (error.message.includes('connection')) {
                statusCode = 503;
                errorMessage = 'Service temporarily unavailable';
            }
        }
            
        return NextResponse.json({ 
            success: false,
            error: errorMessage,
            details: process.env.NODE_ENV === 'production' ? null : (error instanceof Error ? error.stack : null)
        }, { status: statusCode });
    }
}
