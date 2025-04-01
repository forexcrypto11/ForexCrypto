"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LifeBuoy, Clock, BarChart } from "lucide-react";

export function Features() {
  return (
    <section id='features' className="relative py-20 overflow-hidden">
      {/* Blurred background effects matching features.tsx */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="bg-gradient-to-r from-green-500/20 to-blue-500/10 w-[800px] h-[400px] blur-[100px] rounded-full" />
        </div>
      </div>

      <div className="container px-4 mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Built for the Future of{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600">
              Trusted Today and Tomorrow
            </span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Experience unmatched reliability in forex trading, institutional-grade liquidity provisioning, 
            and next-generation financial services engineered for precision and performance.
          </p>
          <motion.div
            initial={{ scale: 0.95 }}
            whileInView={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
          </motion.div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {/* Seamless Support Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(74, 222, 128, 0.2)" }}
            className="p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-colors"
          >
            <div className="mb-6 p-4 bg-primary/10 rounded-full w-fit">
              <LifeBuoy className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">Seamless Support</h3>
            <p className="text-muted-foreground">
              24/7 institutional-grade engineering support with full compliance monitoring 
              and real-time system health checks.
            </p>
          </motion.div>

          {/* On-time Execution Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(74, 222, 128, 0.2)" }}
            className="p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-colors"
          >
            <div className="mb-6 p-4 bg-primary/10 rounded-full w-fit">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">On-time Execution</h3>
            <p className="text-muted-foreground">
              Microsecond-order execution speeds with 99.99% uptime SLA, powered by 
              colocated trading infrastructure.
            </p>
          </motion.div>

          {/* Liquidity Delivered Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(74, 222, 128, 0.2)" }}
            className="p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-colors"
          >
            <div className="mb-6 p-4 bg-primary/10 rounded-full w-fit">
              <BarChart className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">Liquidity Delivered</h3>
            <p className="text-muted-foreground">
              Deep liquidity pools aggregating top-tier providers with smart order 
              routing for optimal fill ratios.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Additional glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 left-1/4 w-1/2 h-1/2 bg-green-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-1/4 right-1/4 w-1/2 h-1/2 bg-blue-500/10 blur-[120px] rounded-full" />
      </div>
    </section>
  );
}