// src/components/GlassCard.tsx
import React, { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`backdrop-blur-xl bg-white/80 border border-slate-200/80 rounded-2xl shadow-2xl p-6 relative overflow-hidden transition-all duration-300 hover:border-slate-300/80 ${className}`}
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-violet-600" />
      {children}
    </div>
  );
};
