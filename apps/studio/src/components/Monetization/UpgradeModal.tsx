import React from "react";

export default function UpgradeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-[#111] border border-[var(--ms-gold)] p-8 max-w-md w-full font-mono text-center">
        <h2 className="text-[var(--ms-gold)] text-xl font-bold uppercase tracking-widest mb-4">Upgrade Required</h2>
        <p className="text-[#CCC] text-sm mb-8">
          You have exhausted your free credits. Upgrade to unlimited execution power to keep building.
        </p>
        <div className="flex gap-4 justify-center">
          <button 
            onClick={onClose}
            className="px-6 py-2 border border-[#444] text-[#888] hover:bg-[#222]"
          >
            CANCEL
          </button>
          <button 
            className="px-6 py-2 bg-[var(--ms-gold)] text-black font-bold"
          >
            UPGRADE NOW
          </button>
        </div>
      </div>
    </div>
  );
}
