// components/loading-bar.tsx
"use client";

import { useEffect, useState } from "react";

export function LoadingBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 10;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-1.5 bg-green-100 fixed top-0 left-0">
      <div 
        className="h-full bg-green-500 transition-all duration-300 ease-out" 
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}