"use client";

import React, { createContext, useContext, ReactNode } from "react";
import "./theme.css";

interface GStackContextType {
  integrity: number;
  status: "nominal" | "degraded" | "critical";
}

const GStackContext = createContext<GStackContextType | undefined>(undefined);

export function useGStack() {
  const context = useContext(GStackContext);
  if (!context) {
    throw new Error("useGStack must be used within a GStackProvider");
  }
  return context;
}

interface GStackProviderProps {
  children: ReactNode;
  initialIntegrity?: number;
}

/**
 * GStackProvider - Injects high-integrity design tokens and provides 
 * the core context for agentic UI components.
 */
export function GStackProvider({ children, initialIntegrity = 100 }: GStackProviderProps) {
  const [integrity, setIntegrity] = React.useState(initialIntegrity);
  const [status, setStatus] = React.useState<GStackContextType["status"]>("nominal");

  // Global integrity monitor logic (can be expanded with real-time sync)
  React.useEffect(() => {
    if (integrity > 90) setStatus("nominal");
    else if (integrity > 70) setStatus("degraded");
    else setStatus("critical");
  }, [integrity]);

  return (
    <GStackContext.Provider value={{ integrity, status }}>
      <div className="gstack-root selection:bg-[var(--ms-green)] selection:text-black">
        {children}
      </div>
    </GStackContext.Provider>
  );
}
