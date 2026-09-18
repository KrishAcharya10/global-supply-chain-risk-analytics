import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, ArrowRight, ShieldAlert, Clock, DollarSign, CheckCircle2, Sliders } from 'lucide-react';
import InsightCard from '../common/InsightCard';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

export default function RouteIntelligence({ data }) {
  const [selectedRouteA, setSelectedRouteA] = useState(null);
  const [selectedRouteB, setSelectedRouteB] = useState(null);

  const routeSummary = data?.route_summary || [];

  const topDisruptedRoutes = [...routeSummary].sort((a, b) => b.disruption_rate - a.disruption_rate).slice(0, 8);

  const handleSelectRouteForComparison = (route) => {
    if (!selectedRouteA) {
      setSelectedRouteA(route);
    } else if (!selectedRouteB && route.route !== selectedRouteA.route) {
      setSelectedRouteB(route);
    } else {
      setSelectedRouteA(route);
      setSelectedRouteB(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>Route Intelligence & Lane Analytics</span>
          </h2>
          <p className="text-xs text-slate-400">Origin-to-destination flow metrics, bottleneck lane rankings, and side-by-side lane comparison</p>
        </div>

        {selectedRouteA && (
          <button
            onClick={() => { setSelectedRouteA(null); setSelectedRouteB(null); }}
            className="text-xs font-mono px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
          >
            Clear Route Comparison
          </button>
        )}
      </div>

      {/* Side-by-Side Route Comparison Mode Banner (If selected) */}
      {selectedRouteA && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-5 rounded-2xl border border-cyan-500/40 bg-slate-900/90 space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2 font-mono">
              <Sliders className="w-4 h-4" />
              <span>Lane Comparison Mode</span>
            </h3>
            <span className="text-[10px] text-slate-400">
              {selectedRouteB ? "Comparing 2 Selected Shipping Lanes" : "Select a 2nd route below to compare side-by-side"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Route A Card */}
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Lane A</span>
              <h4 className="text-sm font-bold text-white mt-1">{selectedRouteA.route}</h4>
              <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                <div>Disruption Rate: <strong className="text-rose-400">{(selectedRouteA.disruption_rate * 100).toFixed(1)}%</strong></div>
                <div>Avg Delay: <strong className="text-amber-400">{selectedRouteA.avg_delay} days</strong></div>
                <div>Risk Index: <strong className="text-cyan-400">{selectedRouteA.avg_risk}</strong></div>
                <div>Avg Cost: <strong className="text-emerald-400">${selectedRouteA.avg_cost?.toLocaleString()}</strong></div>
              </div>
            </div>

            {/* Route B Card */}
            {selectedRouteB ? (
              <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">Lane B</span>
                <h4 className="text-sm font-bold text-white mt-1">{selectedRouteB.route}</h4>
                <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                  <div>Disruption Rate: <strong className="text-rose-400">{(selectedRouteB.disruption_rate * 100).toFixed(1)}%</strong></div>
                  <div>Avg Delay: <strong className="text-amber-400">{selectedRouteB.avg_delay} days</strong></div>
                  <div>Risk Index: <strong className="text-cyan-400">{selectedRouteB.avg_risk}</strong></div>
                  <div>Avg Cost: <strong className="text-emerald-400">${selectedRouteB.avg_cost?.toLocaleString()}</strong></div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-slate-700 flex items-center justify-center text-xs text-slate-500">
                Click any lane card below to select as Lane B
              </div>
            )}

          </div>
        </motion.div>
      )}

      {/* Top Disrupted Lanes Bar Chart */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Highest Disruption Lanes Leaderboard</span>
            </h3>
            <p className="text-xs text-slate-400">Comparing disruption rates across top global origin-destination corridors</p>
          </div>
        </div>

        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topDisruptedRoutes} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="route" stroke="#64748b" tick={{ fontSize: 9 }} interval={0} angle={-20} textAnchor="end" />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '0.75rem', fontSize: '12px' }}
                formatter={(val, name) => [`${(val * 100).toFixed(1)}%`, 'Disruption Rate']}
              />
              <Bar dataKey="disruption_rate" radius={[6, 6, 0, 0]}>
                {topDisruptedRoutes.map((r, idx) => (
                  <Cell key={idx} fill={r.disruption_rate > 0.65 ? '#f43f5e' : r.disruption_rate > 0.4 ? '#f59e0b' : '#06b6d4'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <InsightCard
          title="Route Risk Analysis"
          insightText="Lanes originating from Singapore & Rotterdam exhibit severe bottleneck congestion when paired with long-haul transpacific destination ports."
          recommendation="Deploy multi-modal land bridges (Sea-Rail combos) to bypass chokepoints during high-demand quarters."
        />
      </div>

      {/* Grid of Route Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">All Active Origin → Destination Shipping Lanes</h3>
          <span className="text-xs text-slate-400">{routeSummary.length} Lanes Configured</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {routeSummary.map((lane, idx) => {
            const isSelected = selectedRouteA?.route === lane.route || selectedRouteB?.route === lane.route;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -2 }}
                onClick={() => handleSelectRouteForComparison(lane)}
                className={`glass-panel p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected ? 'border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/20' : 'border-white/5 hover:border-cyan-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{lane.origin}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="text-xs font-bold text-white">{lane.destination}</span>
                  </div>

                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    lane.disruption_rate > 0.6 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                    lane.disruption_rate > 0.35 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {(lane.disruption_rate * 100).toFixed(1)}% Risk
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center text-xs">
                  <div>
                    <span className="block text-[9px] text-slate-500 uppercase font-mono">Lead Time</span>
                    <strong className="text-slate-200">{lane.avg_lead_time}d</strong>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-500 uppercase font-mono">Avg Delay</span>
                    <strong className="text-amber-400">{lane.avg_delay}d</strong>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-500 uppercase font-mono">Avg Cost</span>
                    <strong className="text-emerald-400">${lane.avg_cost?.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>{lane.count} Total Shipments</span>
                  <span className="text-cyan-400 font-sans">Click to compare →</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
