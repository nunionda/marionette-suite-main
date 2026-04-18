"use client";

import React, { useState, useEffect } from "react";

interface Take {
  id: string;
  engine: string;
  source: string;
  seed: string;
  grounding: number;
  thumbnail: string;
  timestamp: string;
  status: "Approved" | "Pending" | "Revision";
  feedback?: string;
}

const takes: Take[] = [
  {
    id: "Take_01",
    engine: "Gemini 2.5 Pro (Video-Gen 1)",
    source: "Cloud Infrastructure",
    seed: "8827361-X",
    grounding: 98,
    thumbnail: "https://images.unsplash.com/photo-1510511459019-5dee997ddfdf?q=80&w=2670&auto=format&fit=crop",
    timestamp: "14:20:05",
    status: "Revision",
  },
  {
    id: "Take_02",
    engine: "Veo 3.1 Artist (Motion Focus)",
    source: "Google AI Sandbox",
    seed: "1102938-A",
    grounding: 92,
    thumbnail: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=2670&auto=format&fit=crop",
    timestamp: "14:25:12",
    status: "Pending",
  },
  {
    id: "Take_03",
    engine: "Gemma 2 9B (Local Stable Video)",
    source: "Local Node #04",
    seed: "4455889-B",
    grounding: 95,
    thumbnail: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2670&auto=format&fit=crop",
    timestamp: "14:30:45",
    status: "Pending",
  },
];

export default function ShotReviewGallery({ shotId = "SC_001_020", runId, step = "generalist", onClose }: { shotId?: string, runId: string, step?: string, onClose?: () => void }) {
  const [takes, setTakes] = useState<Take[]>([]);
  const [comparing, setComparing] = useState<string[]>([]);
  const [isShotgunning, setIsShotgunning] = useState(false);

  useEffect(() => {
    fetchTakes();
  }, [shotId, step]);

  const fetchTakes = async () => {
    try {
      const response = await fetch(`${(process.env.INTERNAL_CONTENTS_STUDIO_API_URL ?? "http://localhost:3005")}/api/pipeline/${runId}/takes?step=${step}&shot_id=${shotId}`);
      const data = await response.json();
      const mappedTakes: Take[] = data.map((t: any) => ({
        id: t.id,
        engine: t.engine || "Unknown AI",
        source: t.description || "Production Node",
        seed: t.id.slice(0, 8),
        grounding: t.soq_score * 10 || 90,
        thumbnail: t.output_path || "https://images.unsplash.com/photo-1510511459019-5dee997ddfdf?q=80&w=2670&auto=format&fit=crop",
        timestamp: new Date(t.created_at).toLocaleTimeString(),
        status: t.is_master ? "Approved" : "Pending",
        feedback: "Auteur Duel Score: 9.8/10. Composition optimized by Gemini 2.5."
      }));
      setTakes(mappedTakes);
      if (mappedTakes.length > 0 && comparing.length === 0) {
        setComparing([mappedTakes[0].id]);
      }
    } catch (e) {
      console.error("Failed to fetch takes", e);
    }
  };

  const handleShotgun = async () => {
    setIsShotgunning(true);
    try {
      await fetch(`${(process.env.INTERNAL_CONTENTS_STUDIO_API_URL ?? "http://localhost:3005")}/api/pipeline/${runId}/shotgun?step=${step}&shot_id=${shotId}&num_takes=3`, { method: 'POST' });
      await fetchTakes();
    } finally {
      setIsShotgunning(false);
    }
  };

  const toggleCompare = (id: string) => {
    if (comparing.includes(id)) {
      if (comparing.length > 1) setComparing(comparing.filter(c => c !== id));
    } else {
      if (comparing.length < 2) setComparing([...comparing, id]);
      else setComparing([comparing[1], id]);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-8 bg-black/95 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="w-full max-w-[1700px] h-[90vh] flex flex-col bg-[var(--ms-bg-2)] border border-[var(--ms-border)] rounded-[32px] overflow-hidden shadow-[0_0_120px_rgba(0,0,0,1)]">
        
        {/* Shotgun Header */}
        <div className="flex items-center justify-between px-10 py-8 border-b border-[var(--ms-border)] bg-black/40">
           <div className="flex items-center gap-10">
              <div className="flex flex-col gap-1">
                 <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-[var(--ms-gold)] font-bold uppercase tracking-[0.4em]">Shotgun Review Hub</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_red]" />
                 </div>
                 <h2 className="text-3xl font-serif font-bold text-[var(--ms-text)]">
                   {shotId} <span className="text-[var(--ms-text-dim)] text-xl font-light ml-2">// Multi-Take Analysis</span>
                 </h2>
              </div>
              <div className="h-14 w-px bg-[var(--ms-border)]" />
              <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                 <span className="text-[9px] uppercase font-bold text-[var(--ms-text-dim)]">Project</span>
                 <span className="text-[9px] uppercase font-bold text-[var(--ms-text)]">BIT-SAVIOR (2026)</span>
                 <span className="text-[9px] uppercase font-bold text-[var(--ms-text-dim)]">Seq / Scene</span>
                 <span className="text-[9px] uppercase font-bold text-[var(--ms-text)]">SQ_01 / SC_02</span>
              </div>
           </div>
           
           <div className="flex items-center gap-6">
               <div className="flex bg-black/50 p-1 rounded-xl border border-[var(--ms-border)]">
                  <button className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-[var(--ms-text)] bg-[var(--ms-gold)]/10 rounded-lg">Side-by-Side</button>
                  <button className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-[var(--ms-text-dim)] hover:text-[var(--ms-text)] transition-colors">Compare</button>
               </div>
               <button 
                onClick={handleShotgun}
                disabled={isShotgunning}
                className="px-6 py-2 bg-[var(--ms-gold)] text-[var(--ms-bg)] text-[10px] font-bold uppercase tracking-widest rounded-lg hover:scale-105 transition-all disabled:opacity-50"
               >
                 {isShotgunning ? "Shotgunning..." : "Shotgun This Shot"}
               </button>
               <button onClick={onClose} className="w-12 h-12 rounded-full border border-[var(--ms-border)] flex items-center justify-center text-2xl text-gray-400 hover:text-white hover:border-white/20 transition-all">×</button>
           </div>
        </div>

        {/* Main Workspace */}
        <div className="flex-grow flex overflow-hidden">
           
           {/* Take Selector Sidebar */}
           <div className="w-96 border-r border-[var(--ms-border)] bg-black/20 flex flex-col">
              <div className="p-8 border-b border-[var(--ms-border)]">
                 <h3 className="text-[10px] uppercase font-bold tracking-[0.3em] text-[var(--ms-text-dim)]">Render History</h3>
              </div>
              <div className="flex-grow overflow-y-auto p-6 space-y-6">
                 {takes.map(take => (
                   <div 
                      key={take.id}
                      onClick={() => toggleCompare(take.id)}
                      className={`relative p-5 rounded-2xl border transition-all cursor-pointer group ${
                        comparing.includes(take.id)
                          ? "bg-[var(--ms-gold)]/10 border-[var(--ms-gold)] shadow-[0_0_30px_rgba(212,175,55,0.1)]"
                          : "bg-[var(--ms-bg)] border-[var(--ms-border)] hover:border-[var(--ms-gold)]/40"
                      }`}
                   >
                      <div className="flex justify-between items-start mb-4">
                         <div className="flex flex-col">
                            <span className="text-[8px] font-mono text-[var(--ms-gold)] font-bold mb-1 uppercase tracking-widest">{take.id}</span>
                            <h4 className="text-sm font-bold text-white group-hover:text-[var(--ms-gold)] transition-colors">{take.engine.split(' ')[0]} Render</h4>
                         </div>
                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                            comparing.includes(take.id) ? "bg-[var(--ms-gold)] text-[var(--ms-bg)] border-[var(--ms-gold)]" : "bg-black/40 border-white/10 text-white/40"
                         }`}>
                            <span className="text-[10px] font-bold">{comparing.indexOf(take.id) === -1 ? "" : comparing.indexOf(take.id) + 1}</span>
                         </div>
                      </div>
                      <div className="aspect-video bg-black rounded-lg border border-white/5 overflow-hidden mb-3 relative">
                         <img src={take.thumbnail} alt={take.id} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
                         <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/80 backdrop-blur-md rounded text-[7px] text-white font-mono">
                            {take.timestamp}
                         </div>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-[9px] font-mono text-gray-500 uppercase">{take.source}</span>
                         <span className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter ${
                            take.status === "Approved" ? "bg-green-900/40 text-green-400" :
                            take.status === "Revision" ? "bg-red-900/40 text-red-400" : "bg-blue-900/40 text-blue-400"
                         }`}>{take.status}</span>
                      </div>
                   </div>
                 ))}
              </div>
              <div className="p-8 border-t border-[var(--ms-border)] bg-black/40">
                 <button className="w-full py-4 bg-[var(--ms-gold)] text-[var(--ms-bg)] text-[11px] font-bold uppercase tracking-widest rounded-xl shadow-2xl hover:scale-[1.02] transition-transform">
                    Submit Master Revision
                 </button>
              </div>
           </div>

           {/* Comparison Arena */}
           <div className="flex-grow flex bg-black p-4 gap-4">
              {comparing.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center text-[var(--ms-text-dim)] uppercase tracking-[0.5em] italic">
                   Select Takes to Compare
                </div>
              ) : (
                comparing.map((id, index) => {
                  const take = takes.find(t => t.id === id)!;
                  return (
                    <div key={id} className="flex-grow relative border border-white/10 rounded-2xl overflow-hidden shadow-2xl group flex flex-col">
                       {/* Take Info HUD Overlay */}
                       <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
                          <div className="px-3 py-1 bg-black/80 backdrop-blur-xl border border-white/10 rounded-lg flex items-center gap-3">
                             <span className="text-[10px] font-serif font-bold text-[var(--ms-gold)]">TAKE {index + 1}</span>
                             <span className="w-px h-3 bg-white/20" />
                             <span className="text-[9px] text-white/70 font-mono">{take.engine}</span>
                          </div>
                          <div className="flex gap-2">
                             <div className="px-2 py-1 bg-black/60 backdrop-blur-md border border-white/5 rounded text-[8px] text-white/50 font-mono">SEED: {take.seed}</div>
                             <div className={`px-2 py-1 bg-black/60 backdrop-blur-md border border-white/5 rounded text-[8px] font-bold ${
                               take.grounding >= 80 ? "text-[var(--ms-green)]" : "text-amber-400"
                             }`}>DNA SYNC: {take.grounding}%</div>
                          </div>
                           {take.feedback && (
                            <div className="max-w-[340px] px-4 py-3 bg-[var(--ms-green-dim)]/20 backdrop-blur-xl border border-[var(--ms-green-border)]/40 rounded-xl space-y-2">
                               <div className="flex justify-between items-center pb-2 border-b border-white/10">
                                  <span className="text-[8px] font-bold text-[var(--ms-green)] uppercase tracking-widest flex items-center gap-2">
                                     <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                                     # AUTEUR_DUEL_LOG
                                  </span>
                                  <span className="text-[7px] font-mono text-white/40">G2.5 vs C3.5</span>
                               </div>
                               <p className="text-[10px] text-white/80 leading-relaxed font-mono italic">
                                 "Gemini proposed high-key lighting, but I countered with Rembrandt split-toning to emphasize the character's internal conflict. Final prompt locked with anamorphic artifacts."
                               </p>
                               <div className="flex justify-between items-center pt-1">
                                  <span className="text-[8px] text-[var(--ms-green)] font-bold">STABILITY_LOCKED: 9.8</span>
                                  <span className="text-[7px] text-white/30 uppercase">Sync-Finalize</span>
                               </div>
                            </div>
                          )}
                       </div>

                       <div className="flex-grow relative cursor-crosshair group/player">
                          <img src={take.thumbnail} alt="Comparison" className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover/player:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                          
                          {/* Playback Controls Overlay */}
                          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-8 opacity-0 group-hover/player:opacity-100 transition-opacity duration-500">
                             <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-xl">◀</button>
                             <button className="w-16 h-16 rounded-full bg-[var(--ms-gold)] text-[var(--ms-bg)] flex items-center justify-center text-3xl shadow-[0_0_30px_var(--ms-gold)]">▶</button>
                             <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-xl">▶</button>
                          </div>
                       </div>

                       <div className="h-20 bg-black flex items-center justify-between px-8 relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-[1px] bg-white/10" />
                          <div className="flex items-center gap-4">
                             <span className="text-[10px] font-mono text-[var(--ms-gold)]">00:0{index}:12:24</span>
                          </div>
                          <div className="flex-grow mx-10 h-1 bg-gray-900 rounded-full cursor-pointer relative">
                             <div className="absolute inset-0 bg-white/5" />
                             <div className="h-full bg-[var(--ms-gold)] shadow-[0_0_10px_var(--ms-gold)]" style={{ width: "42%" }} />
                             <div className="absolute top-1/2 right-[58%] -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-2xl border-4 border-[var(--ms-bg)]" />
                          </div>
                          <div className="flex gap-4">
                             <button className="p-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">🖍️</button>
                             <button className="p-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">✂️</button>
                          </div>
                       </div>
                    </div>
                  );
                })
              )}
           </div>

        </div>
      </div>
    </div>
  );
}
