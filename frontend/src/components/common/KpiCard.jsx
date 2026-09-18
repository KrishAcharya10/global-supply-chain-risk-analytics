import React from 'react';
import { motion } from 'framer-motion';

export default function KpiCard({ title, value, unit, subtitle, icon: Icon, color = 'cyan', badgeText, badgeColor = 'emerald' }) {
  const colorMap = {
    cyan: {
      border: 'border-cyan-500/20 hover:border-cyan-500/50',
      glow: 'shadow-cyan-500/10',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      text: 'text-cyan-400',
    },
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/50',
      glow: 'shadow-amber-500/10',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      text: 'text-amber-400',
    },
    rose: {
      border: 'border-rose-500/20 hover:border-rose-500/50',
      glow: 'shadow-rose-500/10',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      text: 'text-rose-400',
    },
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/50',
      glow: 'shadow-emerald-500/10',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      text: 'text-emerald-400',
    },
    violet: {
      border: 'border-violet-500/20 hover:border-violet-500/50',
      glow: 'shadow-violet-500/10',
      iconBg: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
      text: 'text-violet-400',
    },
  };

  const currentTheme = colorMap[color] || colorMap.cyan;

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={`glass-panel p-5 rounded-2xl border transition-all ${currentTheme.border} ${currentTheme.glow} shadow-xl relative overflow-hidden group`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">{title}</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">{value}</span>
            {unit && <span className="text-xs font-semibold text-slate-400">{unit}</span>}
          </div>
        </div>

        <div className={`p-2.5 rounded-xl border ${currentTheme.iconBg}`}>
          <Icon className="w-5 h-5 stroke-[2.2]" />
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
        <p className="text-xs text-slate-400 truncate max-w-[200px]">{subtitle}</p>
        {badgeText && (
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
            badgeColor === 'rose' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
            badgeColor === 'amber' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}>
            {badgeText}
          </span>
        )}
      </div>

      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full pointer-events-none group-hover:from-white/10 transition-all" />
    </motion.div>
  );
}
