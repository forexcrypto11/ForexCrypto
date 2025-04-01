"use client";

import { motion } from "framer-motion";
import TradingViewWidget from "@/components/trading-view-widget";
import { DollarSign, Activity, Timer, BarChart, ArrowUp, ArrowDown, TrendingUp, TrendingDown } from "lucide-react";

const marketData = [
  { symbol: "BTC/USD", price: "42,300", change: "+2.4%", volume: "24B", color: "text-green-400" },
  { symbol: "ETH/USD", price: "2,300", change: "-1.2%", volume: "8B", color: "text-red-400" },
  { symbol: "NASDAQ", price: "14,800", change: "+0.8%", volume: "42B", color: "text-green-400" },
];

export default function ChartsPage() {
  return (
    <div className="space-y-6 p-4 md:p-6 -mt-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-primary mb-6">Live Market Analysis</h1>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Market Overview Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-background/80 backdrop-blur-lg rounded-xl border p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <BarChart className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Market Overview</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Market Cap</span>
              <span className="font-medium">$1.72T</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">24h Volume</span>
              <span className="font-medium">$64.32B</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Dominance</span>
              <span className="font-medium">BTC: 52%</span>
            </div>
          </div>
        </motion.div>

        {/* Top Gainers Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-background/80 backdrop-blur-lg rounded-xl border p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-green-400/10">
              <TrendingUp className="h-6 w-6 text-green-400" />
            </div>
            <h2 className="text-xl font-semibold">Top Gainers</h2>
          </div>
          <div className="space-y-3">
            {[['SOL', '+12.4%'], ['AVAX', '+8.9%'], ['DOT', '+5.6%']].map(([asset, change], idx) => (
              <div key={asset} className="flex justify-between items-center p-2 hover:bg-accent/5 rounded-lg">
                <span className="font-medium">{asset}</span>
                <span className="text-green-400">{change}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Losers Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-background/80 backdrop-blur-lg rounded-xl border p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-red-400/10">
              <TrendingDown className="h-6 w-6 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold">Top Losers</h2>
          </div>
          <div className="space-y-3">
            {[['LUNA', '-9.2%'], ['NEAR', '-6.7%'], ['ATOM', '-4.1%']].map(([asset, change], idx) => (
              <div key={asset} className="flex justify-between items-center p-2 hover:bg-accent/5 rounded-lg">
                <span className="font-medium">{asset}</span>
                <span className="text-red-400">{change}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Main Chart Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-background/80 backdrop-blur-lg rounded-xl border shadow-sm"
      >
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Real-Time Price Chart
          </h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Timeframe:</span>
              <select className="bg-transparent">
                {['1H', '4H', '1D', '1W', '1M'].map((tf) => (
                  <option key={tf} value={tf}>{tf}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="h-[600px] p-4">
          <TradingViewWidget />
        </div>
      </motion.div>

      {/* Market Data Table */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-background/80 backdrop-blur-lg rounded-xl border shadow-sm overflow-hidden"
      >
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Timer className="h-5 w-5 text-primary" />
            Live Market Data
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="text-xs text-muted-foreground border-b">
              <tr>
                <th className="p-3 text-left">Asset</th>
                <th className="p-3 text-right">Price</th>
                <th className="p-3 text-right">24h Change</th>
                <th className="p-3 text-right">Volume</th>
              </tr>
            </thead>
            <tbody>
              {marketData.map((data, idx) => (
                <tr key={data.symbol} className="hover:bg-accent/5 transition-colors">
                  <td className="p-3 font-medium">{data.symbol}</td>
                  <td className="p-3 text-right">${data.price}</td>
                  <td className={`p-3 text-right ${data.color}`}>{data.change}</td>
                  <td className="p-3 text-right">{data.volume}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}