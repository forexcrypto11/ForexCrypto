"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Shield, BarChart3, TrendingUp, Globe, Award, CheckCircle, FileCheck } from "lucide-react";

export function AboutSection() {
  // Statistics data
  const stats = [
    { icon: <Users className="h-6 w-6 text-green-400" />, value: "1M+", label: "Registered Users" },
    { icon: <Shield className="h-6 w-6 text-blue-400" />, value: "RBI", label: "Verified & Regulated" },
    { icon: <CheckCircle className="h-6 w-6 text-teal-400" />, value: "ISO", label: "27001 Certified" },
    { icon: <FileCheck className="h-6 w-6 text-amber-400" />, value: "SEBI", label: "Registered" },
    { icon: <BarChart3 className="h-6 w-6 text-purple-400" />, value: "24/7", label: "Trading Support" }
  ];

  // Feature cards
  const features = [
    {
      icon: <TrendingUp className="h-6 w-6 text-green-400" />,
      title: "Advanced Trading Tools",
      description: "Access sophisticated trading instruments with real-time analytics and customizable charts."
    },
    {
      icon: <Globe className="h-6 w-6 text-blue-400" />,
      title: "Global Market Access",
      description: "Trade across international markets with competitive spreads and deep liquidity pools."
    },
    {
      icon: <Award className="h-6 w-6 text-amber-400" />,
      title: "Award-winning Platform",
      description: "Experience our industry-recognized platform built for both beginners and professionals."
    }
  ];

  return (
    <section
      className="min-h-screen relative overflow-hidden flex items-center"
      id="about"
    >
      {/* Background with larger grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:54px_64px]" />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-green-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="container px-4 mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-green-400">
              What is ForexCrypto Vision?
            </h2>
            <p className="text-lg text-muted-foreground">
              We are ForexCrypto, the leading global forex trading platform
              specializing in digital assets. We pioneer innovative financial
              products and services that provide traders with trust and
              transparency. Together, we are building the future of forex
              trading.
            </p>
            
            {/* Stats section after paragraph - updated to grid with 5 items */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 py-6 my-4"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center p-3 rounded-lg bg-card/30 backdrop-blur-sm border border-border hover:border-primary/40 transition-all duration-300"
                >
                  <div className="mb-2">{stat.icon}</div>
                  <div className="text-xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-muted-foreground text-center">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
            
            <Button
              className="bg-green-500 hover:bg-green-600 text-black font-semibold"
              onClick={() => window.location.href = '/login'}
            >
              Start Trading
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative w-full aspect-square">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full blur-3xl" />
              <div className="relative w-full h-full">
                <img
                  src="/assets/bull.png"
                  alt="Trading Visualization"
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
            </div>
          </motion.div>
        </div>
      
      </div>
    </section>
  );
}