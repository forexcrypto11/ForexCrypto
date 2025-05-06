import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch real data from the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Get total deposits and withdrawals
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: userId,
        status: 'COMPLETED',
      },
    });

    const totalDeposits = transactions
      .filter(tx => tx.type === 'DEPOSIT')
      .reduce((sum, tx) => sum + tx.amount, 0);
      
    const totalWithdrawals = transactions
      .filter(tx => tx.type === 'WITHDRAW')
      .reduce((sum, tx) => sum + tx.amount, 0);

    // Get orders data
    const orders = await prisma.orderHistory.findMany({
      where: { userId: userId },
      orderBy: { tradeDate: 'desc' },
    });

    const openPositions = orders.filter(order => order.status === 'OPEN');
    const closedPositions = orders.filter(order => order.status === 'CLOSED');
    
    const openPositionsProfitLoss = openPositions.reduce((sum, order) => {
      const currentPL = order.profitLoss || 0;
      return sum + currentPL;
    }, 0);
    
    const closedPositionsProfitLoss = closedPositions.reduce((sum, order) => {
      const currentPL = order.profitLoss || 0;
      return sum + currentPL;
    }, 0);
    
    const totalProfitLoss = openPositionsProfitLoss + closedPositionsProfitLoss;

    // Get recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: { userId: userId },
      orderBy: { timestamp: 'desc' },
      take: 5,
    });

    // Get total number of trades
    const totalTrades = orders.length;
    
    // Get sum of trade amounts
    const totalVolume = orders.reduce((sum, order) => sum + order.tradeAmount, 0);
    
    // Calculate the total open orders amount
    const totalOpenOrdersAmount = openPositions.reduce((sum, order) => sum + order.tradeAmount, 0);
    
    // Calculate the total closed orders amount
    const totalClosedOrdersAmount = closedPositions.reduce((sum, order) => sum + order.tradeAmount, 0);
    
    // Get approved loan amount if any
    const approvedLoan = await prisma.loanRequest.findFirst({
      where: {
        userId: userId,
        status: 'APPROVED',
      },
    });
    
    const approvedLoanAmount = approvedLoan?.amount || 0;

    // Calculate base account balance (deposits - withdrawals)
    const baseAccountBalance = totalDeposits - totalWithdrawals;
    
    // Calculate account balance (deposits - withdrawals + profit/loss)
    const accountBalance = baseAccountBalance + totalProfitLoss;

    // Format the dashboard data
    const dashboardData = {
      accountBalance,
      baseAccountBalance,
      totalDeposits,
      totalWithdrawals,
      openPositionsProfitLoss,
      closedPositionsProfitLoss,
      totalProfitLoss,
      totalTrades,
      totalVolume,
      approvedLoanAmount,
      totalOpenOrdersAmount,
      totalClosedOrdersAmount,
      totalOrdersAmount: totalOpenOrdersAmount + totalClosedOrdersAmount,
      recentTransactions: recentTransactions.map(tx => ({
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
      closedPositions: closedPositions.map(order => ({
        id: order.id,
        symbol: order.symbol,
        type: order.type,
        profitLoss: order.profitLoss,
        tradeDate: order.tradeDate,
        quantity: order.quantity,
        buyPrice: order.buyPrice,
        sellPrice: order.sellPrice
      }))
    };

    return NextResponse.json({ 
      success: true, 
      dashboardData 
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch dashboard data',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 