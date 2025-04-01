"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";

export function Contact() {
  return (
    <section id='contact' className="relative py-24 overflow-hidden">
      {/* Blurred background effect matching features.tsx */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/10 w-[800px] h-[400px] blur-[100px] rounded-full" />
        </div>
      </div>

      <div className="container px-4 mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600 mb-4"
            >
              Let's Connect
            </motion.h2>
            <p className="text-lg text-muted-foreground">
              Have questions or need support? We're here to help with your forex trading needs.
            </p>
          </div>

          <motion.form
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-6 bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-border shadow-xl"
          >
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <Input
                type="text"
                placeholder="John Doe"
                className="bg-background/70 border-green-500/20 focus:border-green-500/50 focus:ring-green-500/30"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="john@example.com"
                className="bg-background/70 border-green-500/20 focus:border-green-500/50 focus:ring-green-500/30"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Message
              </label>
              <Textarea
                placeholder="Your message..."
                rows={5}
                className="bg-background/70 border-green-500/20 focus:border-green-500/50 focus:ring-green-500/30"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 transition-all font-semibold"
              size="lg"
            >
              Send Message
            </Button>
          </motion.form>
        </motion.div>
      </div>
    </section>
  );
}