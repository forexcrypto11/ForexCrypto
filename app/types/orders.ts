export enum TradeType {
    LONG = "LONG",
    SHORT = "SHORT"
  }
  
  export enum TradeStatus {
    PENDING = "PENDING",
    OPEN = "OPEN",
    CLOSED = "CLOSED",
    PENDING_SELL = "PENDING_SELL"
  }
  
  export type Order = {
    id: string;
    userId: string;
    tradeDate: Date;
    symbol: string;
    quantity: number;
    buyPrice: number;
    sellPrice: number | null;
    type: TradeType;
    status: TradeStatus;
    profitLoss: number | null;
    tradeAmount: number;
    createdAt?: Date;
    updatedAt?: Date;
  };
  
  export type NewOrder = {
    userId: string;
    symbol: string;
    quantity: number;
    buyPrice: number;
    sellPrice: number;
    tradeAmount: number;
    type: TradeType;
    status: TradeStatus;
  };

  export type SellOrderRequest = {
    orderId: string;
    sellPrice: number;
  };