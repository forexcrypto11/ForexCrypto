import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    const userId = request.headers.get('X-User-Id');

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Fetch all data in parallel for better performance
        const [
            user,
            totalDeposits,
            totalWithdrawals,
            recentTransactions,
            openPositions,
            closedPositions,
            approvedLoan,
            verifiedOrdersAmount,
            totalVolumeData,
            totalTradesCount
        ] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId }
            }),
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
            }),
            prisma.orderHistory.aggregate({
                where: { userId },
                _sum: { tradeAmount: true }
            }),
            prisma.orderHistory.count({
                where: { userId }
            })
        ]);

        // Calculate values
        const baseAccountBalance = (totalDeposits._sum.amount || 0) - (totalWithdrawals._sum.amount || 0);
        const approvedLoanAmount = approvedLoan?._sum?.amount ?? 0;
        const totalOrdersAmount = verifiedOrdersAmount?._sum?.tradeAmount ?? 0;
          
        // Log details of each closed position
        closedPositions.forEach(position => {
    });
        
        const closedPositionsProfitLoss = closedPositions.reduce((sum, position) => {
            return sum + (position.profitLoss || 0);
        }, 0);
        
        
        // Log details of each open position
        openPositions.forEach(position => {
        });
        
        const openPositionsProfitLoss = openPositions.reduce((sum, position) => {
            return sum + (position.profitLoss || 0);
        }, 0);
        
            
        const totalProfitLoss = closedPositionsProfitLoss + openPositionsProfitLoss;

        // Calculate additional values for the response
        const totalOpenOrdersAmount = openPositions.reduce((sum, pos) => sum + (pos.tradeAmount || 0), 0);
        const totalClosedOrdersAmount = closedPositions.reduce((sum, pos) => sum + (pos.tradeAmount || 0), 0);
        
       
        return NextResponse.json({
            dashboardData: {
                accountBalance: baseAccountBalance + approvedLoanAmount - totalOpenOrdersAmount + totalProfitLoss,
                baseAccountBalance,
                totalDeposits: totalDeposits._sum.amount || 0,
                totalWithdrawals: totalWithdrawals._sum.amount || 0,
                openPositionsProfitLoss,
                closedPositionsProfitLoss,
                totalProfitLoss,
                totalTrades: totalTradesCount,
                totalVolume: totalVolumeData._sum.tradeAmount || 0,
                approvedLoanAmount,
                totalOrdersAmount,
                recentTransactions,
                openPositions,
                closedPositions,
                totalOpenOrdersAmount,
                totalClosedOrdersAmount,
                approvedLoanDetails: approvedLoan
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