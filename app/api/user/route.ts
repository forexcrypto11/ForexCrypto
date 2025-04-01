import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    // Try to get userId from header first (set by frontend)
    let userId: string | null = request.headers.get('X-User-Id');
    
    // If not found in header, try to get from cookies
    if (!userId) {
        const cookieStore = cookies();
        const userIdCookie = cookieStore.get('userId')?.value;
        if (userIdCookie) userId = userIdCookie;
    }

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                gender: true,
                dob: true,
                address: true,
                aadharNo: true,
                bankName: true,
                accountHolder: true,
                accountNumber: true,
                ifscCode: true,
                pan: true,
                nomineeName: true,
                nomineeRelation: true,
                isVerified: true,
                role: true,
                status: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        // Try to get userId from cookies first
        const cookieStore = cookies();
        let userId: string | null = null;
        const userIdCookie = cookieStore.get('userId')?.value;
        
        if (userIdCookie) {
            userId = userIdCookie;
        } else {
            // If not in cookies, try header
            userId = request.headers.get('X-User-Id');
        }

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        
        // Transform the incoming data to match database structure
        const updateData: any = {
            gender: data.gender,
            address: data.address,
            bankName: data.bankName,
            accountHolder: data.accountHolder,
            accountNumber: data.accountNumber,
            ifscCode: data.ifsc,
            pan: data.pan,
            nomineeName: data.nomineeName,
            nomineeRelation: data.nomineeRelation,
        };
        
        // Only update name if both firstName and lastName are provided
        if (data.firstName && data.lastName) {
            updateData.name = `${data.firstName} ${data.lastName}`;
        }
        
        // Only update phone if mobile is provided
        if (data.mobile) {
            updateData.phone = data.mobile;
        }
        
        // Only update date fields if valid dates are provided
        if (data.dob) {
            updateData.dob = new Date(data.dob);
        }
        
        if (data.nomineeDob) {
            updateData.nomineeDob = new Date(data.nomineeDob);
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                name: true,
                email: true,
                phone: true,
                gender: true,
                dob: true,
                address: true,
                aadharNo: true,
                bankName: true,
                accountHolder: true,
                accountNumber: true,
                ifscCode: true,
                pan: true,
                nomineeName: true,
                nomineeRelation: true,
                nomineeDob: true,
            }
        });

        // Transform the response to match frontend structure
        const transformedUser = {
            firstName: user.name?.split(' ')[0] || '',
            lastName: user.name?.split(' ').slice(1).join(' ') || '',
            email: user.email || '',
            username: user.email?.split('@')[0] || '',
            gender: user.gender || '',
            mobile: user.phone || '',
            aadhar: user.aadharNo || '',
            dob: user.dob ? user.dob.toISOString() : '',
            address: user.address || '',
            bankName: user.bankName || '',
            accountHolder: user.accountHolder || '',
            accountNumber: user.accountNumber || '',
            ifsc: user.ifscCode || '',
            pan: user.pan || '',
            nomineeName: user.nomineeName || '',
            nomineeRelation: user.nomineeRelation || '',
            nomineeDob: user.nomineeDob ? user.nomineeDob.toISOString() : (user.dob ? user.dob.toISOString() : ''),
        };

        return NextResponse.json(transformedUser);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 