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

    // Fetch orders from the database
    const orders = await prisma.orderHistory.findMany({
      where: { 
        userId: userId 
      },
      orderBy: { 
        tradeDate: 'desc' 
      }
    });

    // Separate open and closed positions
    const openOrders = orders.filter(order => order.status === 'OPEN');
    const closedOrders = orders.filter(order => order.status === 'CLOSED');
    
    // Calculate profit/loss totals
    const openPositionsProfitLoss = openOrders.reduce((sum, order) => {
      const currentPL = order.profitLoss || 0;
      return sum + currentPL;
    }, 0);
    
    const closedPositionsProfitLoss = closedOrders.reduce((sum, order) => {
      const currentPL = order.profitLoss || 0;
      return sum + currentPL;
    }, 0);
    
    const totalProfitLoss = openPositionsProfitLoss + closedPositionsProfitLoss;

    // Format orders for response
    const formattedOrders = orders.map(order => ({
      id: order.id,
      status: order.status,
      quantity: order.quantity,
      buyPrice: order.buyPrice,
      sellPrice: order.sellPrice,
      symbol: order.symbol,
      type: order.type,
      profitLoss: order.profitLoss || 0,
      tradeDate: order.tradeDate,
      tradeAmount: order.tradeAmount
    }));

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
      totalProfitLoss,
      closedPositionsProfitLoss,
      openPositionsProfitLoss
    });
  } catch (error) {
    console.error('Error fetching orders data:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch orders data',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 