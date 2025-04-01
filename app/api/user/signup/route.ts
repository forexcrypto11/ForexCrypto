import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { email, password, firstName, lastName, phone, aadharNo, pan, gender, dob, nomineeName, nomineeRelation, nomineeDob, bankName, accountNumber, accountHolder, ifscCode, address } = await request.json();

        // Basic validation
        if (!email || !password || !firstName || !lastName || !phone || !aadharNo || !pan || !gender || !dob || !nomineeName || !nomineeRelation || !nomineeDob || !bankName || !accountNumber || !accountHolder || !ifscCode || !address) {
            return NextResponse.json({ 
                success: false,
                error: 'All fields are required' 
            }, { status: 400 });
        }

        // Add a connection timeout handler
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error('Database connection timeout after 15 seconds'));
            }, 15000);
        });

        // Check if user already exists with timeout
        const existingUserPromise = prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { phone: phone },
                    { aadharNo: aadharNo },
                    { pan: pan },
                    { accountNumber: accountNumber }
                ]
            }
        });

        // Race the query against the timeout
        const existingUser = await Promise.race([existingUserPromise, timeoutPromise]) as any;

        if (existingUser) {
            let duplicateField = '';
            if (existingUser.email === email) duplicateField = 'email';
            else if (existingUser.phone === phone) duplicateField = 'phone';
            else if (existingUser.aadharNo === aadharNo) duplicateField = 'Aadhar number';
            else if (existingUser.pan === pan) duplicateField = 'PAN';
            else if (existingUser.accountNumber === accountNumber) duplicateField = 'account number';

            return NextResponse.json({ 
                success: false,
                error: `User with this ${duplicateField} already exists` 
            }, { status: 409 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        const name = firstName + " " + lastName;
        
        // Create a new user in the database with timeout
        const userPromise = prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                phone,
                aadharNo,
                pan,
                gender,
                dob: new Date(dob),
                nomineeName,
                nomineeRelation,
                nomineeDob: new Date(nomineeDob),
                bankName,
                accountNumber,
                accountHolder,
                ifscCode,
                address,
                status: 'ACTIVE'
            },
        });

        // Race the creation against the timeout
        const user = await Promise.race([userPromise, timeoutPromise]) as any;

        return NextResponse.json({ 
            success: true,
            message: 'User created successfully', 
            user: { 
                id: user.id, 
                email: user.email, 
                name: user.name,
                status: user.status
            } 
        }, { status: 201 });
    } catch (error) {
        console.error('Signup error:', error);
        
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
            } else if (error.message.includes('Unique constraint')) {
                statusCode = 409;
                errorMessage = 'User with these details already exists';
            }
        }
        
        return NextResponse.json({ 
            success: false,
            error: errorMessage,
            details: process.env.NODE_ENV === 'production' ? null : (error instanceof Error ? error.stack : null)
        }, { status: statusCode });
    }
} 