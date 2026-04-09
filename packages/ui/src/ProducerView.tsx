"use client";

import React, { useState } from "react";

interface FinancialKPI {
  label: string;
  value: string;
  subValue: string;
  trend: "up" | "down" | "stable";
  color: string;
}

const kpis: FinancialKPI[] = [
  { label: "Total Production Budget", value: "$12,500,000", subValue: "Budget Locked", trend: "stable", color: "var(--ms-gold)" },
  { label: "Capital Deployed", value: "$4,250,000", subValue: "34% Consumption", trend: "up", color: "#4ade80" },
  { label: "P&A Allocation", value: "$2,800,000", subValue: "Est. Marketing", trend: "stable", color: "#60a5fa" },
  { label: "Est. Break-Even", value: "$38,000,000", subValue: "Global BO Target", trend: "stable", color: "var(--ms-text)" },
];

export default function ProducerView() {
  const [activeTab, setActiveTab] = useState<"Financials" | "Investors" | "Legal">("Financials");

  return (
    <div className="flex flex-col h-full bg-[var(--ms-bg-2)] border border-[var(--ms-border)] rounded-xl overflow-hidden shadow-2xl">
      {/* Executive Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--ms-border)] bg-[var(--ms-bg)]">
        <div>
          <h3 className="font-serif text-2xl font-bold text-[var(--ms-gold)]">Executive Summary</h3>
          <p className="text-[10px] text-[var(--ms-text-dim)] uppercase tracking-widest mt-1">Marionette Studio Portfolio • Fiscal Year 2026</p>
        </div>
        <div className="flex gap-4">
           <button className="px-5 py-2 bg-[var(--ms-bg-2)] border border-[var(--ms-border)] text-[var(--ms-text)] text-[10px] font-bold uppercase tracking-widest rounded hover:border-[var(--ms-gold)] transition-all">
             Export Investor Report
           </button>
           <button className="px-5 py-2 bg-[var(--ms-gold)] text-[var(--ms-bg)] text-[10px] font-bold uppercase tracking-widest rounded shadow-lg hover:brightness-110 transition-all">
             Audit Financials
           </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-[var(--ms-border)] bg-[var(--ms-bg)]/50">
        {kpis.map((kpi, i) => (
          <div key={kpi.label} className={`p-8 ${i < 3 ? "border-r border-[var(--ms-border)]" : ""}`}>
            <span className="text-[9px] uppercase tracking-widest text-[var(--ms-text-dim)] font-bold mb-3 block">{kpi.label}</span>
            <div className="text-2xl font-serif font-bold mb-1" style={{ color: kpi.color }}>{kpi.value}</div>
            <div className="text-[10px] text-gray-500 font-mono italic">{kpi.subValue}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-grow overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-grow p-10 overflow-y-auto bg-gradient-to-b from-transparent to-[var(--ms-bg)]/20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Investment Waterfall Section */}
            <div className="lg:col-span-2 space-y-10">
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--ms-text-dim)]">Investment Waterfall Structure</h4>
                  <span className="text-[10px] text-[var(--ms-gold)] font-mono">Total Equity: $6.2M</span>
                </div>
                
                <div className="space-y-8 bg-[var(--ms-bg)] p-8 rounded-2xl border border-[var(--ms-border)]">
                  {[
                    { tier: "Tranche A (Principal Debt)", amount: "$4M", color: "#60a5fa", progress: 100, desc: "Bank Financed / SPC Guarantee" },
                    { tier: "Tranche B (Preferred Equity)", amount: "$3.5M", color: "#f59e0b", progress: 65, desc: "CineVision Capital / Private Equity" },
                    { tier: "Tranche C (Soft Money / Rebates)", amount: "$1.2M", color: "#10b981", progress: 20, desc: "Tax Incentives / State Grant" },
                  ].map(tier => (
                    <div key={tier.tier} className="group cursor-default">
                      <div className="flex justify-between items-end mb-3">
                        <div>
                          <div className="text-xs font-bold text-[var(--ms-text)]">{tier.tier}</div>
                          <div className="text-[9px] text-[var(--ms-text-dim)] mt-0.5">{tier.desc}</div>
                        </div>
                        <span className="text-xs font-mono text-[var(--ms-gold)] font-bold">{tier.amount}</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className="h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(212,175,55,0.2)]" 
                          style={{ width: `${tier.progress}%`, backgroundColor: tier.color }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Recoupment Logic */}
              <section className="bg-[var(--ms-bg-2)] border border-[var(--ms-border)] p-8 rounded-2xl">
                 <h4 className="text-[10px] uppercase font-bold tracking-widest text-[var(--ms-text-dim)] mb-6">Recoupment Projection</h4>
                 <div className="flex items-center gap-12">
                   <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full border-4 border-[var(--ms-gold)] border-t-transparent animate-spin-slow mb-4" />
                      <span className="text-[10px] font-mono text-[var(--ms-gold)]">Calculating ROI...</span>
                   </div>
                   <div className="flex-grow grid grid-cols-2 gap-6 text-[11px] text-[var(--ms-text-dim)]">
                      <p>Projected Domestic BO: <span className="text-[var(--ms-text)] font-bold">$12M - $15M</span></p>
                      <p>Projected Int. Sales: <span className="text-[var(--ms-text)] font-bold">$22M+ (Pre-sales)</span></p>
                      <button className="col-span-2 py-2 mt-2 bg-[var(--ms-gold)]/10 border border-[var(--ms-gold)]/30 text-[var(--ms-gold)] font-bold uppercase tracking-widest rounded hover:bg-[var(--ms-gold)]/20 transition-all">
                        Edit Sales Estimate Models
                      </button>
                   </div>
                 </div>
              </section>
            </div>

            {/* Right Panel: Governance & Risk */}
            <div className="space-y-8">
              <section className="bg-[var(--ms-bg)] border border-[var(--ms-border)] p-6 rounded-xl">
                 <h5 className="text-[10px] uppercase tracking-widest text-[var(--ms-gold)] font-bold mb-4">Investor Activity</h5>
                 <div className="space-y-4">
                    {[
                      { name: "CineVision", action: "Approved Budget Shift", time: "2h ago" },
                      { name: "Global Fund", action: "Requested P&L Summary", time: "5h ago" },
                    ].map(log => (
                      <div key={log.name} className="border-b border-[var(--ms-border)]/50 pb-3 last:border-0 last:pb-0">
                        <div className="text-[11px] font-bold text-[var(--ms-text)]">{log.name}</div>
                        <div className="text-[9px] text-[var(--ms-text-dim)] mt-0.5">{log.action} • {log.time}</div>
                      </div>
                    ))}
                 </div>
              </section>

              <section className="bg-red-950/20 border border-red-900/30 p-6 rounded-xl">
                 <h5 className="text-[10px] uppercase tracking-widest text-red-500 font-bold mb-4">Risk Mitigation</h5>
                 <div className="space-y-3">
                    <div className="flex items-center gap-3">
                       <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                       <span className="text-[10px] text-red-400">FX Exposure Risk (USD/KRW)</span>
                    </div>
                    <p className="text-[9px] text-gray-400 italic">
                      "Recent currency volatility may impact overseas location costs. Hedging strategy advised."
                    </p>
                 </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
