"use client";

import { FC, ReactNode, useState } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import LoadingOverlay from "@/components/ui/loading-overlay";

interface LoadingButtonProps extends ButtonProps {
  children: ReactNode;
  onClick?: () => Promise<void> | void;
  loadingMessage?: string;
  showOverlay?: boolean;
}

/**
 * A button component that shows a loading state and optionally a full-screen overlay
 * when performing async operations
 */
const LoadingButton: FC<LoadingButtonProps> = ({
  children,
  onClick,
  isLoading: externalLoading,
  loadingMessage = "Processing request...",
  showOverlay = false,
  ...props
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  
  // Use either external loading state or internal loading state
  const isLoading = externalLoading !== undefined ? externalLoading : internalLoading;

  const handleClick = async () => {
    if (!onClick) return;
    
    try {
      setInternalLoading(true);
      await onClick();
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <>
      {showOverlay && isLoading && <LoadingOverlay message={loadingMessage} />}
      <Button
        {...props}
        isLoading={isLoading}
        loadingText={props.loadingText}
        onClick={onClick ? handleClick : undefined}
      >
        {children}
      </Button>
    </>
  );
};

export default LoadingButton; 