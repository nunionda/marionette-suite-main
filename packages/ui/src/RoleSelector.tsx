"use client";

import React from "react";

export type Role = "producer" | "line-producer" | "director" | "production-designer" | "writer" | "system-admin" | "studio-ceo";

interface RoleSelectorProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
}

const roles: { id: Role; label: string; icon: string; desc: string }[] = [
  { 
    id: "studio-ceo", 
    label: "Studio CEO", 
    icon: "🏛️", 
    desc: "Global Portfolio & Asset Vault" 
  },
  { 
    id: "writer", 
    label: "Writer / Dev", 
    icon: "🖋️", 
    desc: "Differentiated Scenario & Plotting" 
  },
  { 
    id: "production-designer", 
    label: "Concept Lab", 
    icon: "🎨", 
    desc: "Differentiated Visual DNA & Look Dev" 
  },
  { 
    id: "director", 
    label: "Director", 
    icon: "🎬", 
    desc: "Creative Vision and Scene Approval" 
  },
  { 
    id: "line-producer", 
    label: "Line Producer", 
    icon: "📅", 
    desc: "Schedule and Production Resources" 
  },
  { 
    id: "system-admin", 
    label: "System Admin", 
    icon: "⚙️", 
    desc: "AI Engine Registry & Orchestration" 
  },
];

export default function RoleSelector({ currentRole, onRoleChange }: RoleSelectorProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 w-full max-w-4xl mx-auto mb-8">
      {roles.map((role) => (
        <button
          key={role.id}
          onClick={() => onRoleChange(role.id)}
          className={`flex-1 group relative p-6 rounded-xl border transition-all duration-300 text-left overflow-hidden ${
            currentRole === role.id
              ? "bg-[var(--ms-bg-2)] border-[var(--ms-gold)] shadow-[0_0_20px_rgba(212,175,55,0.15)]"
              : "bg-[var(--ms-bg-2)]/50 border-[var(--ms-border)] hover:border-[var(--ms-gold)]/50"
          }`}
        >
          {/* Active indicator */}
          {currentRole === role.id && (
            <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--ms-gold)]/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2" />
          )}

          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">{role.icon}</span>
            {currentRole === role.id && (
              <span className="text-[10px] uppercase tracking-widest text-[var(--ms-gold)] font-bold">
                Active View
              </span>
            )}
          </div>

          <h3 className={`text-xl font-serif font-bold mb-1 transition-colors ${
            currentRole === role.id ? "text-[var(--ms-gold)]" : "text-[var(--ms-text)] group-hover:text-[var(--ms-gold)]"
          }`}>
            {role.label}
          </h3>
          <p className="text-xs text-[var(--ms-text-dim)] leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
            {role.desc}
          </p>

          {/* Hover highlight line */}
          <div className={`absolute bottom-0 left-0 h-1 bg-[var(--ms-gold)] transition-all duration-500 ${
            currentRole === role.id ? "w-full" : "w-0 group-hover:w-1/2"
          }`} />
        </button>
      ))}
    </div>
  );
}
