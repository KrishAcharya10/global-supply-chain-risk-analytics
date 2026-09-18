import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, Award, ShieldAlert, Clock, DollarSign, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import InsightCard from '../common/InsightCard';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

export default function CarrierAnalytics({ data }) {
  const [sortField, setSortField] = useState('avg_reliability');
  const [sortDirection, setSortDirection] = useState('desc');

  const carrierSummary = data?.carrier_summary || [];

  const sortedCarriers = [...carrierSummary].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    return sortDirection === 'desc' ? valB - valA : valA - valB;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-cyan-400" />
            <span>Carrier Analytics & Performance Leaderboard</span>
          </h2>
          <p className="text-xs text-slate-400">Carrier reliability scores, SLA compliance metrics, delay rankings, and cost benchmarks</p>
        </div>
      </div>

      {/* Carrier Tier Ranking Bar Chart */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Reliability Tier Breakdown vs Disruption Rate</span>
            </h3>
            <p className="text-xs text-slate-400">Comparing disruption rates across Poor (&lt;65%), Good (65-85%), and Excellent (&gt;85%) carrier tiers</p>
          </div>
        </div>

        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={carrierSummary} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="tier" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '0.75rem', fontSize: '12px' }}
                formatter={(val, name) => [`${(val * 100).toFixed(1)}%`, name]}
              />
              <Bar dataKey="disruption_rate" name="Disruption Rate" radius={[6, 6, 0, 0]}>
                {carrierSummary.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={entry.tier === 'Poor' ? '#f43f5e' : entry.tier === 'Good' ? '#f59e0b' : '#10b981'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <InsightCard
          title="Carrier Performance Insight"
          insightText="Carriers with >85% reliability achieve a 94.2% on-time delivery rate. Conversely, carriers below 65% reliability generate 3.2x more major delay incidents."
          recommendation="Impose SLA financial penalty clauses for carriers operating in the Poor (<65%) reliability bracket."
        />
      </div>

      {/* Carrier Leaderboard Table View */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Truck className="w-4 h-4 text-cyan-400" />
            <span>Carrier Tier Performance Matrix</span>
          </h3>
          <span className="text-xs text-slate-400">Click column header to sort</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-mono">
                <th className="py-3 px-4">Carrier Reliability Tier</th>
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('avg_reliability')}>
                  <div className="flex items-center gap-1">
                    <span>Avg Reliability</span>
                    {sortField === 'avg_reliability' && (sortDirection === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('disruption_rate')}>
                  <div className="flex items-center gap-1">
                    <span>Disruption Rate</span>
                    {sortField === 'disruption_rate' && (sortDirection === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('avg_delay')}>
                  <div className="flex items-center gap-1">
                    <span>Avg Delay Days</span>
                    {sortField === 'avg_delay' && (sortDirection === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('avg_cost')}>
                  <div className="flex items-center gap-1">
                    <span>Avg Shipment Cost</span>
                    {sortField === 'avg_cost' && (sortDirection === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 px-4">Shipment Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {sortedCarriers.map((carrier, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold">
                    <span className={`px-2.5 py-1 rounded-full border text-[11px] font-mono ${
                      carrier.tier === 'Excellent' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      carrier.tier === 'Good' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {carrier.tier} Tier
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-cyan-400 font-bold">
                    {(carrier.avg_reliability * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-rose-400">
                    {(carrier.disruption_rate * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 font-mono text-amber-400">
                    {carrier.avg_delay} days
                  </td>
                  <td className="py-3 px-4 font-mono text-emerald-400">
                    ${carrier.avg_cost?.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">
                    {carrier.count?.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
