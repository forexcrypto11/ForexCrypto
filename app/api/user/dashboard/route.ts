import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    const userId = request.headers.get('X-User-Id');

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Fetch user details
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                name: true,
                email: true,
            }
        });

        // Fetch account statistics
        const [
            totalDeposits,
            totalWithdrawals,
            recentTransactions,
            openPositions,
            closedPositions,
            approvedLoan,
            verifiedOrdersAmount
        ] = await Promise.all([
            prisma.transaction.aggregate({
                where: {
                    userId,
                    type: 'DEPOSIT',
                    status: 'COMPLETED',
                    verified: true
                },
                _sum: { amount: true }
            }),
            prisma.transaction.aggregate({
                where: {
                    userId,
                    type: 'WITHDRAW',
                    status: 'COMPLETED'
                },
                _sum: { amount: true }
            }),
            prisma.transaction.findMany({
                where: { 
                    userId,
                    OR: [
                        { 
                            type: 'WITHDRAW',
                            status: 'COMPLETED'
                        },
                        { 
                            type: 'DEPOSIT',
                            status: 'COMPLETED',
                            verified: true
                        }
                    ]
                },
                orderBy: { timestamp: 'desc' },
                take: 5,
                select: {
                    id: true,
                    type: true,
                    amount: true,
                    timestamp: true,
                    status: true,
                    verified: true
                }
            }),
            prisma.orderHistory.findMany({
                where: { 
                    userId,
                    status: 'OPEN'
                },
                orderBy: { tradeDate: 'desc' },
                select: {
                    id: true,
                    symbol: true,
                    type: true,
                    profitLoss: true,
                    tradeDate: true,
                    quantity: true,
                    buyPrice: true,
                    tradeAmount: true
                }
            }),
            prisma.orderHistory.findMany({
                where: { 
                    userId,
                    status: 'CLOSED'
                },
                orderBy: { tradeDate: 'desc' },
                take: 5,
                select: {
                    id: true,
                    symbol: true,
                    type: true,
                    profitLoss: true,
                    tradeDate: true,
                    quantity: true,
                    buyPrice: true,
                    sellPrice: true,
                    tradeAmount: true
                }
            }),
            prisma.loanRequest.aggregate({
                where: {
                    userId,
                    status: 'APPROVED'
                },
                orderBy: {
                    updatedAt: 'desc'
                },
                _sum: { amount: true }
            }),
            prisma.orderHistory.aggregate({
                where: {
                    userId,
                    OR: [
                        { status: 'OPEN' },
                        { status: 'CLOSED' }
                    ]
                },
                _sum: { tradeAmount: true }
            })
        ]);

        // Get approved loan amount 
        const approvedLoanAmount = approvedLoan?._sum?.amount ?? 0;
        
        // Get total amount for all verified orders (open and closed)
        const totalOrdersAmount = verifiedOrdersAmount?._sum?.tradeAmount ?? 0;
        
        // Calculate account balance and other metrics
        const baseAccountBalance = (totalDeposits._sum.amount || 0) - (totalWithdrawals._sum.amount || 0);
        const accountBalance = baseAccountBalance + approvedLoanAmount - totalOrdersAmount;
        
        // Calculate profit/loss from open positions
        const openPositionsProfitLoss = openPositions.reduce((sum, position) => 
            sum + (position.profitLoss || 0), 0);
        
        // Calculate profit/loss from closed positions
        const closedPositionsProfitLoss = closedPositions.reduce((sum, position) => 
            sum + (position.profitLoss || 0), 0);
            
        // Total profit/loss (combined)
        const totalProfitLoss = openPositionsProfitLoss + closedPositionsProfitLoss;
        
        // Calculate total trading volume
        const totalTrades = await prisma.orderHistory.count({
            where: { userId }
        });
        
        // Calculate total volume across all orders
        const totalVolumeData = await prisma.orderHistory.aggregate({
            where: { userId },
            _sum: { tradeAmount: true }
        });
        
        const totalVolume = totalVolumeData._sum.tradeAmount || 0;

        return NextResponse.json({
            user,
            dashboardData: {
                accountBalance,
                baseAccountBalance,
                totalDeposits: totalDeposits._sum.amount || 0,
                totalWithdrawals: totalWithdrawals._sum.amount || 0,
                openPositionsProfitLoss,
                closedPositionsProfitLoss,
                totalProfitLoss,
                totalTrades,
                totalVolume,
                approvedLoanAmount,
                totalOrdersAmount,
                approvedLoanDetails: approvedLoan,
                recentTransactions,
                openPositions,
                closedPositions
            }
        });
    } catch (error) {
        console.error('Dashboard fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard data' },
            { status: 500 }
        );
    }
} 