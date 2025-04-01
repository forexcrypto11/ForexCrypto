import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    const userId = request.headers.get('X-User-Id');
    
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    try {
        // Verify the user is an admin
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });
        
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        
        // Fetch admin dashboard statistics
        const [
            totalUsers,
            activeUsers,
            pendingWithdrawals,
            pendingLoans,
            recentWithdrawalRequests,
            loanApplications
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({
                where: { status: 'active' }
            }),
            prisma.transaction.findMany({
                where: { 
                    type: 'WITHDRAW',
                    status: 'PENDING'
                },
                select: {
                    id: true,
                    amount: true
                }
            }),
            prisma.loanRequest.findMany({
                where: { status: 'PENDING' },
                select: {
                    id: true,
                    amount: true
                }
            }),
            prisma.transaction.findMany({
                where: { 
                    type: 'WITHDRAW',
                    status: 'PENDING'
                },
                orderBy: { timestamp: 'desc' },
                take: 5,
                include: {
                    user: {
                        select: {
                            name: true
                        }
                    }
                }
            }),
            prisma.loanRequest.findMany({
                where: { status: 'PENDING' },
                orderBy: { createdAt: 'desc' },
                take: 5,
                include: {
                    user: {
                        select: {
                            name: true
                        }
                    }
                }
            })
        ]);
        
        // Calculate total pending withdrawal amount
        const totalPendingWithdrawalAmount = pendingWithdrawals.reduce(
            (sum, withdrawal) => sum + withdrawal.amount, 
            0
        );
        
        // Calculate total pending loan amount
        const totalPendingLoanAmount = pendingLoans.reduce(
            (sum, loan) => sum + loan.amount, 
            0
        );
        
        // Format recent withdrawal requests
        const formattedWithdrawals = recentWithdrawalRequests.map(withdrawal => ({
            id: withdrawal.id,
            user: withdrawal.user.name,
            amount: `₹${withdrawal.amount.toLocaleString()}`,
            date: new Date(withdrawal.timestamp).toISOString().split('T')[0],
            status: 'Pending'
        }));
        
        // Format loan applications
        const formattedLoans = loanApplications.map(loan => ({
            id: loan.id,
            user: loan.user.name,
            amount: `₹${loan.amount.toLocaleString()}`,
            leverage: "1:10", // This would come from actual data in a real app
            date: new Date(loan.createdAt).toISOString().split('T')[0]
        }));
        
        return NextResponse.json({
            stats: [
                { 
                    title: "Total Users", 
                    value: totalUsers.toString(), 
                    change: "+12.4%", // This would be calculated in a real app
                    color: "text-green-400",
                    icon: "Users"
                },
                { 
                    title: "Active Traders", 
                    value: activeUsers.toString(), 
                    change: "+8.2%", // This would be calculated in a real app
                    color: "text-blue-400",
                    icon: "Activity"
                },
                { 
                    title: "Pending Withdrawals", 
                    value: `₹${totalPendingWithdrawalAmount.toLocaleString()}`, 
                    change: `${pendingWithdrawals.length} requests`, 
                    color: "text-yellow-400",
                    icon: "Wallet"
                },
                { 
                    title: "Pending Loans", 
                    value: `₹${totalPendingLoanAmount.toLocaleString()}`, 
                    change: `${pendingLoans.length} requests`, 
                    color: "text-purple-400",
                    icon: "Coins"
                },
            ],
            recentWithdrawals: formattedWithdrawals,
            pendingLoans: formattedLoans
        });
    } catch (error) {
        console.error('Admin dashboard fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch admin dashboard data' },
            { status: 500 }
        );
    }
} 