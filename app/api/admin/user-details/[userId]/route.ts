import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { userId: string } }
) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: params.userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                aadharNo: true,
                pan: true,
                gender: true,
                dob: true,
                nomineeName: true,
                nomineeRelation: true,
                bankName: true,
                accountNumber: true,
                accountHolder: true,
                ifscCode: true,
                address: true,
                isVerified: true,
                role: true,
                status: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching user details:', error);
        return NextResponse.json({ error: 'Failed to fetch user details' }, { status: 500 });
    }
}