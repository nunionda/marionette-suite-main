"use client";

import React, { useState } from "react";

interface StripScene {
  id: number;
  slugline: string;
  pages: string;
  characters: string[];
  sets: string[];
  props: string[];
  status: "Ready" | "Pending" | "Conflict" | "Wrapped";
  timeOfDay: "Day" | "Night" | "Magic Hour";
  locationType: "INT" | "EXT";
}

interface ShootingDay {
  dayNumber: number;
  date: string;
  location: string;
  scenes: StripScene[];
}

const mockShootingDays: ShootingDay[] = [
  {
    dayNumber: 1,
    date: "2026-04-10",
    location: "Malibu Beach / Studio A",
    scenes: [
      { 
        id: 1, 
        slugline: "EXT. BEACH - DAY", 
        pages: "3 4/8", 
        characters: ["AEON", "CLIENT"], 
        sets: ["Lifeguard Tower"], 
        props: ["Binary Tablet"],
        status: "Ready",
        timeOfDay: "Day",
        locationType: "EXT"
      },
      { 
        id: 5, 
        slugline: "EXT. BEACH - MAGIC HOUR", 
        pages: "1 2/8", 
        characters: ["AEON"], 
        sets: ["Lifeguard Tower"], 
        props: ["Tactical Rifle"],
        status: "Pending",
        timeOfDay: "Magic Hour",
        locationType: "EXT"
      },
    ]
  },
  {
    dayNumber: 2,
    date: "2026-04-11",
    location: "Cyber Cafe (Set)",
    scenes: [
      { 
        id: 2, 
        slugline: "INT. CAFE - NIGHT", 
        pages: "5 1/8", 
        characters: ["AEON", "HACKER"], 
        sets: ["Cafe Window"], 
        props: ["Broken Cup", "Neon Laptop"],
        status: "Conflict",
        timeOfDay: "Night",
        locationType: "INT"
      },
    ]
  }
];

export default function LineProducerView() {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Infrastructure Bar: Daily Units */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {mockShootingDays.map((day, idx) => (
          <button
            key={day.dayNumber}
            onClick={() => setSelectedDayIndex(idx)}
            className={`flex-shrink-0 w-48 p-4 rounded-xl border transition-all ${
              selectedDayIndex === idx 
                ? "bg-[var(--ms-gold)]/10 border-[var(--ms-gold)] shadow-[0_0_15px_rgba(212,175,55,0.1)]" 
                : "bg-[var(--ms-bg-2)] border-[var(--ms-border)] hover:border-[var(--ms-gold)]/50"
            }`}
          >
            <div className="text-[10px] uppercase tracking-widest text-[var(--ms-gold)] font-bold mb-1">Day {day.dayNumber}</div>
            <div className="text-sm font-serif font-bold text-[var(--ms-text)] mb-2">{day.date}</div>
            <div className="text-[10px] text-[var(--ms-text-dim)] truncate uppercase">{day.location}</div>
          </button>
        ))}
        <button className="flex-shrink-0 w-48 p-4 rounded-xl border-2 border-dashed border-[var(--ms-border)] flex flex-col items-center justify-center text-[var(--ms-text-dim)] hover:text-[var(--ms-gold)] hover:border-[var(--ms-gold)]/50 transition-all">
          <span className="text-xl">+</span>
          <span className="text-[9px] uppercase font-bold tracking-widest">Add Shooting Day</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Hollywood Stripboard (Main View) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between mb-2 px-2">
            <h3 className="text-lg font-serif font-bold text-[var(--ms-text)]">Production Stripboard</h3>
            <div className="flex gap-4 text-[10px] font-mono text-[var(--ms-text-dim)] uppercase">
              <span>Scenes: {mockShootingDays[selectedDayIndex].scenes.length}</span>
              <span>Total Pages: 10 7/8</span>
            </div>
          </div>

          <div className="space-y-2">
            {mockShootingDays[selectedDayIndex].scenes.map((scene) => (
              <div 
                key={scene.id}
                className="flex h-16 border border-[var(--ms-border)] rounded-md overflow-hidden bg-[var(--ms-bg-2)] hover:border-[var(--ms-gold)]/50 transition-all group cursor-pointer"
              >
                {/* ID & Type Color Indicator */}
                <div className={`w-3 h-full ${scene.locationType === "INT" ? "bg-blue-600" : "bg-amber-600"}`} />
                
                {/* Scene Meta */}
                <div className="w-16 flex flex-col items-center justify-center border-r border-[var(--ms-border)] bg-[var(--ms-bg)]/50">
                   <span className="text-[8px] font-bold text-[var(--ms-text-dim)]">SCENE</span>
                   <span className="text-lg font-serif font-bold text-[var(--ms-gold)]">#{scene.id}</span>
                </div>

                {/* Strip Content */}
                <div className="flex-grow flex items-center px-6 justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[var(--ms-text)] truncate">{scene.slugline}</span>
                    <div className="flex gap-3 mt-1">
                      <span className="text-[9px] text-[var(--ms-text-dim)] uppercase font-mono">{scene.timeOfDay}</span>
                      <span className="text-[9px] text-[var(--ms-text-dim)] uppercase font-mono">Pgs: {scene.pages}</span>
                    </div>
                  </div>

                  {/* Cast / Resource Icons */}
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] uppercase font-bold text-[var(--ms-text-dim)] mb-1">Cast IDs</span>
                      <div className="flex gap-1">
                        {scene.characters.map(c => (
                          <span key={c} className="w-4 h-4 rounded-full bg-[var(--ms-gold)]/20 text-[7px] flex items-center justify-center text-[var(--ms-gold)] font-bold">
                            {c[0]}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-[8px] uppercase font-bold text-[var(--ms-text-dim)] mb-1">Assets</span>
                      <div className="flex gap-1">
                        {scene.sets.length > 0 && <span title="Sets" className="text-[10px]">🏢</span>}
                        {scene.props.length > 0 && <span title="Props" className="text-[10px]">🎒</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className={`w-32 flex items-center justify-center text-[9px] font-bold uppercase tracking-widest border-l border-[var(--ms-border)] ${
                   scene.status === "Ready" ? "text-green-500 bg-green-500/5" :
                   scene.status === "Conflict" ? "text-red-500 bg-red-500/5" : "text-amber-500 bg-amber-500/5"
                }`}>
                  {scene.status}
                </div>
              </div>
            ))}
          </div>

          <button className="w-full py-4 border-2 border-dashed border-[var(--ms-border)] rounded-md text-[10px] text-[var(--ms-text-dim)] uppercase font-bold tracking-widest hover:border-[var(--ms-gold)]/50 hover:text-[var(--ms-gold)] transition-all">
            + Reorder or Add Scene to Board
          </button>
        </div>

        {/* Sidebar: Production Automation */}
        <div className="space-y-6">
          <div className="bg-[var(--ms-bg-2)] border border-[var(--ms-border)] rounded-xl p-6 shadow-sm">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-[var(--ms-gold)] font-bold mb-4">Daily Call Sheet</h4>
            <div className="space-y-4">
              <div className="p-3 bg-[var(--ms-bg)] border border-[var(--ms-border)] rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold">Crew Call</span>
                  <span className="text-xs font-mono text-[var(--ms-gold)]">07:00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Sunrise Shoot</span>
                  <span className="text-xs font-mono text-[var(--ms-gold)]">05:45</span>
                </div>
              </div>
              <button className="w-full py-2.5 bg-[#40a7e3] text-white text-[10px] font-bold uppercase tracking-widest rounded shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2">
                <span>✈️</span> Send via Telegram
              </button>
              <button className="w-full py-2.5 bg-transparent border border-[var(--ms-border)] text-[var(--ms-text-dim)] text-[10px] font-bold uppercase tracking-widest rounded hover:border-[var(--ms-gold)] transition-all">
                Preview PDF
              </button>
            </div>
          </div>

          <div className="bg-[var(--ms-bg-2)] border border-[var(--ms-border)] rounded-xl p-6 shadow-sm">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-[var(--ms-text-dim)] font-bold mb-4">Weather & Transit</h4>
            <div className="space-y-3">
               <div className="flex justify-between items-center bg-[var(--ms-bg)] p-2 rounded border border-[var(--ms-border)]">
                 <span className="text-[10px] text-gray-400">MALIBU</span>
                 <span className="text-[10px] text-amber-500 font-bold">☀️ 22°C</span>
               </div>
               <p className="text-[9px] text-[var(--ms-text-dim)] leading-relaxed italic border-l-2 border-[var(--ms-gold)] pl-3">
                 "High winds expected after 14:00. Secure exterior equipment early."
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
