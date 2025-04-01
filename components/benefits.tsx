"use client";

import { motion } from "framer-motion";
import { LineChart, Shield, Zap, BarChart2, Coins, Layers } from "lucide-react";

const features = [
  {
    icon: <LineChart className="h-6 w-6" />,
    title: "Low Spreads & High Leverage",
    description: "Trade major forex pairs with competitive spreads and leverage up to 1:500"
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "AI-Powered Signals",
    description: "Get real-time trading signals powered by advanced machine learning algorithms"
  },
  {
    icon: <BarChart2 className="h-6 w-6" />,
    title: "Advanced Analytics",
    description: "Access professional-grade charts, indicators, and technical analysis tools"
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Secure Trading",
    description: "Your funds are protected with bank-grade security and encryption"
  },
  {
    icon: <Coins className="h-6 w-6" />,
    title: "Fast Withdrawals",
    description: "Quick and hassle-free withdrawals with multiple payment options"
  },
  {
    icon: <Layers className="h-6 w-6" />,
    title: "Diverse Asset Portfolio",
    description: "Trade forex, cryptocurrencies, commodities, and indices all in one platform."
  }
];

export function Benefits() {
  return (
    <section id='benefits' className="py-24 relative overflow-hidden">
      {/* Blurred background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="bg-gradient-to-r from-green-500/20 to-blue-500/10 w-[800px] h-[400px] blur-[100px] rounded-full" />
        </div>
      </div>

      <div className="container px-4 mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Benefits Of ForexCrypto
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience the advantage of trading with a platform that combines cutting-edge 
            technology with professional trading tools.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative p-6 bg-card/50 backdrop-blur-sm rounded-lg border border-border hover:border-primary/50 transition-colors">
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}