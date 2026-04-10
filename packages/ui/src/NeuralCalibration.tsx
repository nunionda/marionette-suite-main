"use client";

import React, { useState, useEffect } from "react";

interface NeuralCalibrationProps {
  agentId: string;
  engineName: string;
  onComplete: () => void;
}

export function NeuralCalibration({ agentId, engineName, onComplete }: NeuralCalibrationProps) {
  const [step, setStep] = useState(0);
  const steps = [
    `INITIALIZING_NEURAL_LINK_${agentId}`,
    `ESTABLISHING_HANDSHAKE_WITH_${engineName.toUpperCase()}`,
    "CALIBRATING_WEIGHTS_AND_BIASES",
    "SYNCHRONIZING_AUTEUR_STATE",
    "CONNECTION_ESTABLISHED_PROCEED_TO_STUDIO"
  ];

  useEffect(() => {
    if (step < steps.length) {
      const timer = setTimeout(() => {
        setStep(s => s + 1);
      }, 600 + Math.random() * 400);
      return () => clearTimeout(timer);
    } else {
      const finishTimer = setTimeout(() => {
        onComplete();
      }, 1000);
      return () => clearTimeout(finishTimer);
    }
  }, [step, steps.length, onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-12 overflow-hidden">
      {/* Background Grid / Hex Effect */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--ms-gold)]/5 to-transparent pointer-events-none" />

      {/* Calibration Ring */}
      <div className="relative w-96 h-96 flex items-center justify-center mb-16">
        <div className="absolute inset-0 border-4 border-dashed border-[var(--ms-gold)]/20 rounded-full animate-spin-slow" />
        <div className="absolute inset-8 border-2 border-dashed border-[var(--ms-gold)]/40 rounded-full animate-spin-slow-reverse" />
        <div className="absolute inset-16 bg-gradient-to-br from-[var(--ms-gold)] to-transparent rounded-full opacity-20 blur-3xl animate-pulse" />
        
        <div className="relative z-10 text-center">
          <span className="text-[12px] font-mono font-bold text-[var(--ms-gold)] uppercase tracking-[0.5em] mb-4 block animate-pulse">
            Neural_Calibration
          </span>
          <div className="text-5xl font-serif font-bold text-white tracking-tighter">
            {Math.min(100, Math.floor((step / steps.length) * 100))}%
          </div>
        </div>
      </div>

      {/* Progress Log */}
      <div className="w-[600px] space-y-4">
        <div className="flex justify-between items-end mb-2">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Auteur_Sync_Protocol_v4.2</span>
          <span className="text-[10px] font-mono text-[var(--ms-gold)] uppercase animate-pulse">Status: ACTIVE</span>
        </div>
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mb-8">
          <div 
            className="h-full bg-[var(--ms-gold)] transition-all duration-500 shadow-[0_0_20px_var(--ms-gold)]" 
            style={{ width: `${(step / steps.length) * 100}%` }} 
          />
        </div>

        <div className="space-y-2 h-32 overflow-hidden flex flex-col justify-end">
          {steps.map((s, i) => (
            <div 
              key={s} 
              className={`text-[11px] font-mono transition-all duration-500 border-l-2 pl-4 flex justify-between items-center ${
                i < step ? "text-[var(--ms-gold)] border-[var(--ms-gold)] opacity-100" : 
                i === step ? "text-white border-white animate-pulse" : "text-zinc-800 border-transparent opacity-0"
              }`}
            >
              <span>{s}</span>
              {i < step && <span className="text-[9px] font-bold">READY</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Ambient Metadata */}
      <div className="absolute bottom-12 left-12 flex flex-col gap-2">
        <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Agent_Signature</span>
        <span className="text-xs font-mono text-white opacity-40">{agentId}_NODE_AUTEUR</span>
      </div>
      <div className="absolute bottom-12 right-12 flex flex-col items-end gap-2">
        <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Engine_Cluster</span>
        <span className="text-xs font-mono text-white opacity-40">{engineName.toUpperCase()}</span>
      </div>
    </div>
  );
}
