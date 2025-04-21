import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    const userId = request.headers.get('X-User-Id');

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log("[API:DASHBOARD] Processing dashboard request for user:", userId);

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

        console.log("[API:DASHBOARD] Data fetched successfully");
        console.log(`[API:DASHBOARD] Open positions: ${openPositions.length}`);
        console.log(`[API:DASHBOARD] Closed positions retrieved: ${closedPositions.length}`);

        // Calculate values
        const baseAccountBalance = (totalDeposits._sum.amount || 0) - (totalWithdrawals._sum.amount || 0);
        const approvedLoanAmount = approvedLoan?._sum?.amount ?? 0;
        const totalOrdersAmount = verifiedOrdersAmount?._sum?.tradeAmount ?? 0;
        
        // Calculate profit/loss from orders
        console.log("[API:DASHBOARD] Calculating profit/loss");
        
        // Log details of each closed position
        console.log("[API:DASHBOARD] Closed position details:");
        closedPositions.forEach(position => {
            console.log(`[API:DASHBOARD] Closed position ${position.id}: PL = ${position.profitLoss || 0}`);
        });
        
        const closedPositionsProfitLoss = closedPositions.reduce((sum, position) => {
            return sum + (position.profitLoss || 0);
        }, 0);
        
        console.log(`[API:DASHBOARD] Total closed positions P/L: ${closedPositionsProfitLoss}`);
        
        // Log details of each open position
        console.log("[API:DASHBOARD] Open position details:");
        openPositions.forEach(position => {
            console.log(`[API:DASHBOARD] Open position ${position.id}: PL = ${position.profitLoss || 0}`);
        });
        
        const openPositionsProfitLoss = openPositions.reduce((sum, position) => {
            return sum + (position.profitLoss || 0);
        }, 0);
        
        console.log(`[API:DASHBOARD] Total open positions P/L: ${openPositionsProfitLoss}`);
            
        const totalProfitLoss = closedPositionsProfitLoss + openPositionsProfitLoss;
        console.log(`[API:DASHBOARD] Total P/L (closed + open): ${totalProfitLoss}`);

        // Calculate additional values for the response
        const totalOpenOrdersAmount = openPositions.reduce((sum, pos) => sum + (pos.tradeAmount || 0), 0);
        const totalClosedOrdersAmount = closedPositions.reduce((sum, pos) => sum + (pos.tradeAmount || 0), 0);
        
        console.log(`[API:DASHBOARD] Account balance components:`);
        console.log(`- Base balance: ${baseAccountBalance}`);
        console.log(`- Approved loan: ${approvedLoanAmount}`);
        console.log(`- Open orders: ${totalOpenOrdersAmount}`);
        console.log(`- Total P/L: ${totalProfitLoss}`);
        console.log(`= Final balance: ${baseAccountBalance + approvedLoanAmount - totalOpenOrdersAmount + totalProfitLoss}`);

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