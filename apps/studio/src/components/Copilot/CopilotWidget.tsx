"use client";

import React, { useState, useEffect, useRef } from "react";
import UpgradeModal from "../Monetization/UpgradeModal";

const FREE_CREDITS_LIMIT = 3;

export default function CopilotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', text: string}[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [credits, setCredits] = useState<number>(FREE_CREDITS_LIMIT);
  const [showPaywall, setShowPaywall] = useState(false);
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // 로컬 스토리지를 사용해 무과금 제한 로직 구현
  useEffect(() => {
    const saved = localStorage.getItem("ms_copilot_credits");
    if (saved !== null) {
      setCredits(parseInt(saved, 10));
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const updateCredits = (newAmount: number) => {
    setCredits(newAmount);
    localStorage.setItem("ms_copilot_credits", newAmount.toString());
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    if (credits <= 0) {
      setShowPaywall(true);
      return;
    }

    const currentInput = input;
    setMessages(prev => [...prev, { role: 'user', text: currentInput }]);
    setInput("");
    updateCredits(credits - 1);
    setIsLoading(true);

    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: currentInput })
      });

      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      setMessages(prev => [...prev, { role: 'assistant', text: data.reply || data.error }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: `ERROR: SYSTEM OFFLINE.` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button: Gold Haze HUD */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-[var(--ms-bg-elevated)] border border-[var(--ms-gold-border)] shadow-[0_0_20px_var(--ms-gold-glint)] rounded-full flex items-center justify-center z-40 hover:scale-110 active:scale-95 transition-all group overflow-hidden"
      >
        <div className="absolute inset-0 bg-[var(--ms-gold)] opacity-0 group-hover:opacity-10 transition-opacity" />
        <div className={`absolute inset-1 rounded-full border border-dashed border-[var(--ms-gold-border)] ${isOpen ? 'animate-spin-slow' : ''}`} />
        <span className="font-serif text-[var(--ms-gold)] font-bold text-lg tracking-widest relative z-10">AI</span>
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[350px] h-[500px] bg-black/95 border border-[var(--ms-border)] shadow-[0_4px_30px_rgba(0,0,0,0.5)] flex flex-col z-40 rounded-sm font-mono text-xs animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="p-5 border-b border-[var(--ms-gold-border)]/30 flex justify-between items-center bg-[var(--ms-bg-elevated)]/80 backdrop-blur-xl">
            <div>
              <h3 className="text-[var(--ms-gold)] font-serif font-bold uppercase tracking-widest text-[10px]">Director&apos;s Copilot</h3>
              <p className="text-[var(--ms-text-dim)] text-[8px] uppercase tracking-[0.3em] font-mono mt-0.5">Vibe Production Engine</p>
            </div>
            <div className="text-right">
              <span className={`px-2 py-1 bg-black/40 rounded-sm border ${credits > 0 ? 'border-[var(--ms-gold-border)] text-[var(--ms-gold)]' : 'border-red-500 text-red-500 animate-pulse'} text-[9px] font-mono font-bold`}>
                SYS_CREDITS: {credits}
              </span>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-[11px] leading-relaxed pb-8">
            {messages.length === 0 && (
              <div className="text-center text-[#555] uppercase tracking-widest mt-10">
                <p>System Online.</p>
                <p>Waiting for command...</p>
                <div className="mt-4 p-2 border border-[#333] text-left text-[#888]">
                  <p className="text-[9px] text-[var(--ms-green)] mb-1">PROMPT SUGGESTION:</p>
                  &quot;아이디어: 암울한 2050년 서울을 배경으로 하는 AI 범죄 스릴러&quot;
                </div>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 max-w-[85%] rounded-sm ${
                  msg.role === 'user'
                    ? 'bg-[var(--ms-green-dim)] border border-[var(--ms-green)] text-[var(--ms-green)]'
                    : 'bg-[#222] border border-[#444] text-[#DDD] whitespace-pre-wrap'
                }`}>
                  <span className="opacity-50 text-[8px] block mb-1 uppercase tracking-widest">[{msg.role}]</span>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="p-3 max-w-[85%] rounded-sm bg-[#222] border border-[#444] text-[#DDD]">
                  <span className="opacity-50 text-[8px] block mb-1 uppercase tracking-widest">[assistant]</span>
                  <span className="animate-pulse">GENERATING_RESPONSE...</span>
                </div>
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-[var(--ms-border)] bg-[#0A0A0A]">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex gap-2"
            >
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={credits > 0 ? "Enter instruction..." : "OUT_OF_CREDITS..."}
                disabled={isLoading || credits <= 0}
                className="flex-1 bg-black border border-[#333] p-2 text-white placeholder-[#555] focus:outline-none focus:border-[var(--ms-green)] transition-colors disabled:opacity-50"
              />
              <button 
                type="submit" 
                disabled={isLoading || !input.trim() || credits <= 0}
                className="bg-[var(--ms-border)] hover:bg-[#333] text-white px-4 border border-[#444] transition-colors disabled:opacity-50 uppercase tracking-widest text-[9px] font-bold"
              >
                Execute
              </button>
            </form>
            {credits <= 0 && (
              <button 
                onClick={() => setShowPaywall(true)}
                className="w-full mt-3 p-2 bg-[var(--ms-gold)] text-black text-[10px] font-bold tracking-widest uppercase hover:scale-[1.02] active:scale-[0.98] transition-transform animate-pulse"
              >
                [ UPGRADE TO UNLIMITED ]
              </button>
            )}
          </div>
        </div>
      )}

      {/* Paywall Modal Integration */}
      <UpgradeModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
    </>
  );
}
