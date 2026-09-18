import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Leaf, TrendingUp, BarChart2, ShieldAlert } from 'lucide-react';
import InsightCard from '../common/InsightCard';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, ScatterChart, Scatter, ZAxis } from 'recharts';

export default function CostSustainability({ data }) {
  const modeSummary = data?.mode_summary || [];
  const scatterSamples = data?.scatter_samples || [];

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span>Cost & Sustainability Analytics</span>
          </h2>
          <p className="text-xs text-slate-400">Unit cost economics (Cost/KM, Cost/Tonne) and carbon emissions intensity per transport mode</p>
        </div>
      </div>

      {/* Mode Economics Comparison Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Cost per KM by Mode */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Unit Cost per Kilometer ($/KM)</span>
              </h3>
              <p className="text-xs text-slate-400">Average freight unit transportation cost per kilometer by mode</p>
            </div>
          </div>

          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modeSummary} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="mode" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '0.75rem', fontSize: '12px' }}
                  formatter={(val) => [`$${val}/km`, 'Avg Cost per KM']}
                />
                <Bar dataKey="avg_cost_per_km" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <InsightCard
            title="Cost Economics"
            insightText="Air freight commands $24.99/km (16x ocean freight), but delivers 8.2x faster transit speed."
            recommendation="Restrict Air freight utilization exclusively to perishable or high-margin electronic shipments."
          />
        </div>

        {/* Carbon Emissions by Mode */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Leaf className="w-4 h-4 text-cyan-400" />
                <span>Average Carbon Footprint (kg CO₂ / shipment)</span>
              </h3>
              <p className="text-xs text-slate-400">Comparing greenhouse gas emissions intensity across shipping modes</p>
            </div>
          </div>

          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modeSummary} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="mode" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '0.75rem', fontSize: '12px' }}
                  formatter={(val) => [`${val.toLocaleString()} kg CO₂`, 'Avg Carbon Footprint']}
                />
                <Bar dataKey="avg_emissions" radius={[6, 6, 0, 0]}>
                  {modeSummary.map((m, idx) => (
                    <Cell key={idx} fill={m.mode === 'Air' ? '#f43f5e' : m.mode === 'Road' ? '#f59e0b' : '#06b6d4'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <InsightCard
            title="Sustainability Target"
            insightText="Air freight generates 500 kg CO₂ per tonne-km, compared to just 22 kg CO₂ for ocean & rail freight."
            recommendation="Transitioning 15% of non-urgent Air freight to Sea-Rail routes reduces corporate carbon footprint by ~420,000 kg CO₂ annually."
          />
        </div>

      </div>

      {/* High-Cost vs High-Risk Scatter Comparison */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>High-Cost vs High-Risk Matrix Comparison</span>
            </h3>
            <p className="text-xs text-slate-400">Identifying shipments in the top-right quadrant (High Cost + High Geopolitical Risk)</p>
          </div>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="Geopolitical_Risk_Score" stroke="#64748b" tick={{ fontSize: 10 }} label={{ value: 'Geopolitical Risk Score', position: 'bottom', offset: 0, fill: '#94a3b8', fontSize: 11 }} />
              <YAxis dataKey="Estimated_Cost_USD" stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} label={{ value: 'Estimated Cost ($)', angle: -90, position: 'left', fill: '#94a3b8', fontSize: 11 }} />
              <ZAxis range={[30, 100]} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '0.75rem', fontSize: '12px' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const dataPoint = payload[0].payload;
                    return (
                      <div className="p-3 bg-slate-900 border border-white/10 rounded-xl space-y-1 text-xs">
                        <div className="font-bold text-white">{dataPoint.Shipment_ID}</div>
                        <div className="text-cyan-400">Geo Risk: {dataPoint.Geopolitical_Risk_Score}</div>
                        <div className="text-emerald-400">Cost: ${dataPoint.Estimated_Cost_USD?.toLocaleString()}</div>
                        <div className="text-slate-400">{dataPoint.Route_Label}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter data={scatterSamples} fill="#06b6d4" opacity={0.6} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
