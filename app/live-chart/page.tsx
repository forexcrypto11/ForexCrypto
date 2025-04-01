"use client";

import { motion } from "framer-motion";
import TradingViewWidget from "@/components/trading-view-widget";
import { IndianRupee, Activity, Timer, BarChart, ArrowUp, ArrowDown, TrendingUp, TrendingDown } from "lucide-react";

export default function ChartsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-4 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto space-y-8 px-4 md:px-8 lg:px-12 pt-24 md:pt-28 lg:pt-32 pb-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 mb-8"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent tracking-tight">
            Live Market Analysis
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Stay ahead of the markets with our advanced real-time trading charts. Monitor price movements, analyze trends, and make informed trading decisions.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <div className="flex items-center gap-2 bg-primary/10 backdrop-blur-md rounded-full px-4 py-2 border border-primary/20">
              <Activity className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Real-Time Updates</span>
            </div>
            <div className="flex items-center gap-2 bg-primary/10 backdrop-blur-md rounded-full px-4 py-2 border border-primary/20">
              <BarChart className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Advanced Analytics</span>
            </div>
            <div className="flex items-center gap-2 bg-primary/10 backdrop-blur-md rounded-full px-4 py-2 border border-primary/20">
              <Timer className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Multiple Timeframes</span>
            </div>
          </div>
        </motion.div>

        {/* Main Chart Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-background/60 backdrop-blur-xl rounded-xl border border-primary/10 shadow-[0_0_15px_rgba(0,0,0,0.1)] relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          <div className="p-4 md:p-6 border-b border-primary/10 flex flex-col md:flex-row items-center justify-between gap-4 relative">
            <h3 className="text-xl md:text-2xl font-semibold flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              Real-Time Price Chart
            </h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Timeframe:</span>
                <select className="bg-background/80 backdrop-blur-md border border-primary/20 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20">
                  {['1H', '4H', '1D', '1W', '1M'].map((tf) => (
                    <option key={tf} value={tf}>{tf}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="h-[500px] md:h-[600px] lg:h-[700px] p-4 relative">
            <TradingViewWidget />
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <div className="bg-background/60 backdrop-blur-xl rounded-xl border border-primary/10 p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group">
            <TrendingUp className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
            <h4 className="text-lg font-semibold mb-2">Technical Analysis</h4>
            <p className="text-muted-foreground">Access powerful technical indicators and drawing tools for in-depth market analysis.</p>
          </div>
          <div className="bg-background/60 backdrop-blur-xl rounded-xl border border-primary/10 p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group">
            <ArrowUp className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
            <h4 className="text-lg font-semibold mb-2">Market Trends</h4>
            <p className="text-muted-foreground">Identify market trends and potential trading opportunities with ease.</p>
          </div>
          <div className="bg-background/60 backdrop-blur-xl rounded-xl border border-primary/10 p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group">
            <Timer className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
            <h4 className="text-lg font-semibold mb-2">Multi-Timeframe Analysis</h4>
            <p className="text-muted-foreground">Switch between different timeframes to get a complete market perspective.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}