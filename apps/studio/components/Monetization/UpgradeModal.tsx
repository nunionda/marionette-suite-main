"use client";

import React, { useState } from 'react';

// Polar (Merchant of Record) 목업 컴포넌트
export default function UpgradeModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleCheckout = () => {
    setIsProcessing(true);
    // 이 위치에 Polar (polar.sh) 결제 크리에이트 로직 주입
    setTimeout(() => {
      alert("✅ Polar 결제 연동(MoR) 성공!\n미국 법인 없이도 Pro Plan 엑세스 권한이 부여되었습니다.");
      setIsProcessing(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--ms-bg-2)] border border-[var(--ms-gold)] p-8 max-w-md w-full rounded-sm shadow-[0_0_50px_rgba(212,175,55,0.15)] relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-[var(--ms-text-dim)] hover:text-white font-mono">
          [X]
        </button>
        
        <h2 className="text-2xl font-mono font-bold text-[var(--ms-gold)] uppercase tracking-tighter mb-2">
          UNLOCK PRO AUTEUR
        </h2>
        <p className="text-[10px] font-mono text-[var(--ms-text-dim)] mb-6 tracking-widest uppercase">
          Powered by Polar (Global Payment MoR)
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-3">
            <span className="text-[var(--ms-gold)] text-lg">✦</span>
            <div>
              <h4 className="text-[12px] font-mono font-bold text-white uppercase">Cinematic Mastering Forge</h4>
              <p className="text-[9px] font-mono text-[var(--ms-text-dim)] uppercase tracking-wide">Unlimited access to FFMPEG grain & lens distortion</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[var(--ms-gold)] text-lg">✦</span>
            <div>
              <h4 className="text-[12px] font-mono font-bold text-white uppercase">Self-Healing Overdrive</h4>
              <p className="text-[9px] font-mono text-[var(--ms-text-dim)] uppercase tracking-wide">AI automatically revises failed renders up to 5 times</p>
            </div>
          </div>
        </div>

        <button 
          onClick={handleCheckout}
          disabled={isProcessing}
          className="w-full py-4 bg-[var(--ms-gold)] text-black font-mono font-bold text-sm tracking-widest uppercase rounded-none hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {isProcessing ? "PROCESSING_POLAR_CHECKOUT..." : "UPGRADE NOW ($29/mo)"}
        </button>
      </div>
    </div>
  );
}
