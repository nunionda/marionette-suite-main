import React, { useState, useEffect } from "react";
import { usePipeline } from "./PipelineProvider";

export default function CinematicStudio() {
  const [activeCamera, setActiveCamera] = useState("Cam_A_Arri_Master_Anamorphic");
  const { getEngineForAgent, globalHealthScore, getAgentMeta } = usePipeline();
  const assignedEngine = getEngineForAgent("CINE");
  const meta = getAgentMeta("CINE");

  return (
    <div className="flex flex-col h-full bg-[var(--ms-bg-base)] border border-[var(--ms-border)] rounded-3xl overflow-hidden shadow-3xl animate-in fade-in duration-1000 group">
      <div className="flex items-center justify-between px-10 py-8 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-10">
          <div className="flex flex-col gap-1">
             <h3 className="font-serif text-3xl font-bold text-white tracking-tighter uppercase">Virtual Cinematography Suite</h3>
             <div className="flex items-center gap-3">
               <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-mono italic">AU_CINE_PROTOCOL // OPTICS_SENSOR_SIM</span>
               <div className="flex gap-2">
                 <div className="px-2 py-1 bg-white/5 border border-white/10 rounded flex items-center gap-1.5">
                   <div className="w-1 h-1 rounded-full bg-blue-500" />
                   <span className="text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-widest">{meta?.stage}</span>
                 </div>
                 <div className="px-2 py-1 bg-white/5 border border-white/10 rounded flex items-center gap-1.5">
                   <div className="w-1 h-1 rounded-full bg-[var(--ms-gold)]" />
                   <span className="text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-widest">{meta?.layer}</span>
                 </div>
               </div>
             </div>
          </div>

          <div className="flex items-center gap-8 px-6 py-3 bg-white/[0.02] border border-white/10 rounded-2xl">
             <div className="flex flex-col items-end gap-1">
                <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">Logic_Core</span>
                <span className="text-xs font-mono text-[var(--ms-gold)] font-bold">{assignedEngine?.name || "Initializing..."}</span>
             </div>
             <div className="w-px h-6 bg-white/10" />
             <div className="flex flex-col items-end gap-1">
                <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">Latency</span>
                <span className={`text-xs font-mono font-bold ${
                   (assignedEngine?.latency ?? 0) > 1000 ? "text-amber-500" : "text-green-500"
                }`}>
                   {assignedEngine ? `${Math.floor(assignedEngine.latency)}ms` : "---"}
                </span>
             </div>
             <div className="w-px h-6 bg-white/10" />
             <div className="flex flex-col items-end gap-1">
                <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">Integrity</span>
                <span className="text-xs font-mono text-white font-bold">{globalHealthScore}%</span>
             </div>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="px-4 py-2 bg-[var(--ms-gold)]/10 border border-[var(--ms-gold)]/20 text-[var(--ms-gold)] text-[10px] font-mono font-bold rounded-lg flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--ms-gold)] animate-pulse" />
            SENSOR_SYNC_4K_LF
          </div>
          <button className="px-8 py-2 bg-[var(--ms-gold)] text-black text-[10px] font-bold uppercase tracking-[0.2em] rounded-lg shadow-xl shadow-[var(--ms-gold)]/10 hover:scale-105 transition-all">
            Lock_Optics
          </button>
        </div>
      </div>

      <div className="flex flex-grow h-[550px]">
        {/* Left: Component List */}
        <div className="w-80 border-r border-[var(--ms-border)] bg-[var(--ms-bg)]/30 p-8 space-y-12">
           <div>
              <span className="text-[10px] font-bold text-[var(--ms-gold)] uppercase tracking-[0.2em] mb-4 block">Camera_Profile</span>
              <select className="w-full bg-[var(--ms-bg-base)] border border-[var(--ms-gold-border)]/40 p-3 text-[10px] text-[var(--ms-text)] font-mono focus:outline-none uppercase tracking-tighter">
                 <option>Arri Alexa LF - Open Gate</option>
                 <option>RED V-RAPTOR XL - 8K VV</option>
                 <option>Sony Venice 2 - 8.6K Full Frame</option>
                 <option>AI_VEO_CUSTOM_SENSOR_v1</option>
              </select>
           </div>

           <div className="space-y-6">
              <span className="text-[10px] font-bold text-[var(--ms-text-dim)] uppercase tracking-widest block">Lens Metadata (Cooke/Arri)</span>
              <div className="grid grid-cols-2 gap-4">
                 {[
                   { label: "Focal Length", value: "35mm T1.9" },
                   { label: "Anamorphic", value: "2.0x Squeeze" },
                   { label: "EI / ISO", value: "800 (Base)" },
                   { label: "Shutter", value: "180.0°" }
                 ].map(param => (
                   <div key={param.label} className="p-3 bg-[var(--ms-bg-base)] border border-[var(--ms-border)] rounded">
                      <span className="text-[8px] uppercase text-[var(--ms-text-dim)] block mb-1 font-bold">{param.label}</span>
                      <span className="text-[10px] font-mono text-[var(--ms-gold)]">{param.value}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="pt-8 border-t border-[var(--ms-border)]">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-4">Director_of_Photography_AI</span>
              <p className="text-[10px] text-[var(--ms-text-dim)] leading-relaxed italic border-l border-blue-400/30 pl-4">
                "The 35mm T1.9 Anamorphic profile is calibrated for the Seoul night sequence to maximize bokeh ovalization and horizontal flares."
              </p>
           </div>
        </div>

        {/* Main: Preview / Visual Controls */}
        <div className="flex-grow p-12 bg-[var(--ms-bg-base)] flex flex-col gap-12 overflow-y-auto">
           <div className="w-full aspect-video bg-black border border-[var(--ms-gold-border)]/20 rounded-lg flex items-center justify-center relative overflow-hidden group shadow-2xl">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay" />
              <div className="absolute inset-0 opacity-10 border-[60px] border-black" />
              <div className="text-[10px] font-mono text-white/20 uppercase tracking-[1.5em] animate-pulse">
                 Optics_Sim_Engine_Active
              </div>
              <div className="absolute bottom-6 left-6 flex flex-col gap-1">
                 <span className="text-[10px] text-white/60 font-mono tracking-widest">ARRI_ALEXA_LF // RE_001_010</span>
                 <span className="text-[8px] text-[var(--ms-gold)] uppercase font-bold tracking-[0.2em]">Safe_Area: 2.39:1 CINEMASCOPE</span>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                 <h4 className="text-[10px] font-bold uppercase text-[var(--ms-gold)] tracking-[0.2em]">Lighting Cue Ops</h4>
                 <div className="p-8 bg-[var(--ms-bg-2)] border border-[var(--ms-border)] rounded-2xl relative overflow-hidden group hover:border-[var(--ms-gold)]/40 transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-3xl rounded-full" />
                    <p className="text-[11px] text-gray-400 leading-relaxed italic border-l border-white/10 pl-4">
                      "Key: 5600K HMI Softbox @ Top-Right. Rim: 3200K Tungsten Seoul-Neon @ Far-Left. Contrast: 5:1."
                    </p>
                 </div>
              </div>

              <div className="space-y-4">
                 <h4 className="text-[10px] font-bold uppercase text-[var(--ms-gold)] tracking-[0.2em]">Movement Rig Profile</h4>
                 <div className="p-8 bg-[var(--ms-bg-2)] border border-[var(--ms-border)] rounded-2xl relative overflow-hidden group hover:border-blue-400/40 transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-3xl rounded-full" />
                    <span className="text-[9px] font-mono text-blue-400 uppercase mb-4 block">AI_Virtual_Dolly_v3</span>
                    <p className="text-[11px] text-gray-400 leading-relaxed italic border-l border-white/10 pl-4">
                      "Linear push-in (Slow) with Z-axis stabilization. Organic breathing: Enabled (0.15 intensity)."
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
