import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withTimeoutHandler } from '@/app/api/utils/timeout-wrapper';
import { headers } from 'next/headers';

// Cache duration in seconds
const CACHE_DURATION = 30;

export const GET = async (request: Request) => {
    const userId = request.headers.get('X-User-Id');

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use our wrapper to handle timeouts consistently
    return withTimeoutHandler(async () => {
        // Fetch all data in parallel for better performance
        const [
            user,
            transactions,
            orders,
            approvedLoan
        ] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    status: true
                }
            }),
            prisma.transaction.findMany({
                where: {
                    userId,
                    OR: [
                        { type: 'DEPOSIT', status: 'COMPLETED', verified: true },
                        { type: 'WITHDRAW', status: 'COMPLETED' }
                    ]
                },
                select: {
                    type: true,
                    amount: true,
                    status: true,
                    verified: true,
                    timestamp: true
                }
            }),
            prisma.orderHistory.findMany({
                where: { userId },
                select: {
                    id: true,
                    symbol: true,
                    type: true,
                    profitLoss: true,
                    tradeDate: true,
                    quantity: true,
                    buyPrice: true,
                    sellPrice: true,
                    status: true,
                    tradeAmount: true
                }
            }),
            prisma.loanRequest.findFirst({
                where: {
                    userId,
                    status: 'APPROVED'
                },
                select: {
                    amount: true,
                    duration: true,
                    updatedAt: true
                }
            })
        ]);

        // Process transactions
        const totalDeposits = transactions
            .filter(tx => tx.type === 'DEPOSIT')
            .reduce((sum, tx) => sum + tx.amount, 0);
            
        const totalWithdrawals = transactions
            .filter(tx => tx.type === 'WITHDRAW')
            .reduce((sum, tx) => sum + tx.amount, 0);

        // Process orders
        const openPositions = orders.filter(order => order.status === 'OPEN');
        const closedPositions = orders.filter(order => order.status === 'CLOSED');
        
        const openPositionsProfitLoss = openPositions.reduce((sum, pos) => sum + (pos.profitLoss || 0), 0);
        const closedPositionsProfitLoss = closedPositions.reduce((sum, pos) => sum + (pos.profitLoss || 0), 0);
        const totalProfitLoss = openPositionsProfitLoss + closedPositionsProfitLoss;

        const totalOpenOrdersAmount = openPositions.reduce((sum, pos) => sum + (pos.tradeAmount || 0), 0);
        const totalClosedOrdersAmount = closedPositions.reduce((sum, pos) => sum + (pos.tradeAmount || 0), 0);
        const totalOrdersAmount = totalOpenOrdersAmount + totalClosedOrdersAmount;

        const baseAccountBalance = totalDeposits - totalWithdrawals;
        const approvedLoanAmount = approvedLoan?.amount || 0;

        const dashboardData = {
            accountBalance: baseAccountBalance + approvedLoanAmount - totalOpenOrdersAmount + totalProfitLoss,
            baseAccountBalance,
            totalDeposits,
            totalWithdrawals,
            openPositionsProfitLoss,
            closedPositionsProfitLoss,
            totalProfitLoss,
            totalTrades: orders.length,
            totalVolume: orders.reduce((sum, order) => sum + (order.tradeAmount || 0), 0),
            approvedLoanAmount,
            totalOrdersAmount,
            recentTransactions: transactions
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, 5)
                .map(tx => ({
                    id: tx.id,
                    type: tx.type,
                    amount: tx.amount,
                    timestamp: tx.timestamp,
                    status: tx.status,
                    verified: tx.verified
                })),
            openPositions: openPositions.map(order => ({
                id: order.id,
                symbol: order.symbol,
                type: order.type,
                profitLoss: order.profitLoss,
                tradeDate: order.tradeDate,
                quantity: order.quantity,
                buyPrice: order.buyPrice
            })),
            closedPositions: closedPositions.slice(0, 5).map(order => ({
                id: order.id,
                symbol: order.symbol,
                type: order.type,
                profitLoss: order.profitLoss,
                tradeDate: order.tradeDate,
                quantity: order.quantity,
                buyPrice: order.buyPrice,
                sellPrice: order.sellPrice
            })),
            totalOpenOrdersAmount,
            totalClosedOrdersAmount,
            approvedLoanDetails: approvedLoan
        };

        const response = NextResponse.json({ dashboardData });
        
        // Add cache control headers
        response.headers.set('Cache-Control', `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`);
        
        return response;
    }, 10000)(); // Reduced timeout to 10 seconds
}; 