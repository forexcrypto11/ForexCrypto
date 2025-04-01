"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image"; // Make sure to import Next.js Image component
import Link from 'next/link'

export function HeroSection() {
  return (
    <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden pt-24">
      {/* Background gradient and grid */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:54px_64px]" />
      </div>

      <div className="container px-4 mx-auto relative z-10 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center"
        >
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-green-400 mb-6">
              Trade Smarter with AI-Powered Forex Solutions
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Experience professional forex trading with low spreads, real-time AI signals, 
              and advanced analytics. Start your journey to financial success today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Button size="lg" className="bg-green-500 hover:bg-green-600">
                 <Link href="/login">Start Trading Now</Link>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline">
                 <Link href="/live-chart">View Live Rates</Link>
                
              </Button>
            </div>
          </div>

          {/* Responsive Image Container */}
          <div className="w-full max-w-[1051px] mx-auto mt-4 md:mt-8 px-4">
            <div className="aspect-video w-full relative rounded-xl overflow-hidden shadow-xl">
              <Image
                src="https://framerusercontent.com/images/1joyHbLkxJFhcq81guduQM2qXcE.png"
                alt="AI Forex Trading Analytics"
                width={1051}
                height={492}
                className="object-cover w-full h-full"
                priority
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-green-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-blue-500/10 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}