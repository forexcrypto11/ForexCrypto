"use client";

import { motion } from "framer-motion";
import { Loader } from "lucide-react";
import { FC } from "react";

interface LoadingOverlayProps {
  message?: string;
}

/**
 * A full-screen loading overlay component with a spinner and optional message
 */
const LoadingOverlay: FC<LoadingOverlayProps> = ({ 
  message = "Processing request..." 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div className="flex flex-col items-center gap-4">
        <Loader className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg font-medium">{message}</p>
      </div>
    </motion.div>
  );
};

export default LoadingOverlay;