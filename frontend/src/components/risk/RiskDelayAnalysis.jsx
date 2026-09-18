import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle, Cpu, Search, CheckCircle2, XCircle, ArrowUpRight } from 'lucide-react';
import InsightCard from '../common/InsightCard';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

export default function RiskDelayAnalysis({ data }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');

  const highRiskShipments = data?.high_risk_shipments || [];
  const featureImportances = data?.model_metrics?.classification?.top_features || [];

  const filteredShipments = highRiskShipments.filter((s) => {
    const matchesSearch =
      s.Shipment_ID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.Route_Label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.Transport_Mode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatusFilter === 'All' ||
      (selectedStatusFilter === 'Disrupted' && s.Disruption_Occurred === 1) ||
      (selectedStatusFilter === 'Normal' && s.Disruption_Occurred === 0);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <span>Risk Index & Delay Driver Analysis</span>
          </h2>
          <p className="text-xs text-slate-400">ML Random Forest feature importance rankings and granular high-risk shipment search table</p>
        </div>
      </div>

      {/* Feature Importance ML Drivers Chart */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Top ML Disruption Drivers (Random Forest Feature Importances)</span>
            </h3>
            <p className="text-xs text-slate-400">Quantifying relative mathematical feature weights driving supply chain disruptions</p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">ROC-AUC 81.6%</span>
        </div>

        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={featureImportances.slice(0, 7)}
              margin={{ top: 10, right: 30, left: 100, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
              <YAxis
                type="category"
                dataKey="feature"
                stroke="#64748b"
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => v.replace(/_/g, ' ')}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '0.75rem', fontSize: '12px' }}
                formatter={(val) => [`${(val * 100).toFixed(1)}% Weight`, 'Feature Importance']}
              />
              <Bar dataKey="importance" fill="#06b6d4" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <InsightCard
          title="Machine Learning Insights"
          insightText="Geopolitical Risk Score (31.4% weight) and Carrier Reliability (24.8% weight) account for over 56% of total predictive power for delivery disruptions."
          recommendation="Prioritize real-time geopolitical alert integrations into carrier allocation algorithms."
        />
      </div>

      {/* Filterable High-Risk Shipment Table */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>High-Risk Shipment Audit Table</span>
            </h3>
            <p className="text-xs text-slate-400">Search and filter top 50 highest risk index shipments in real-time</p>
          </div>

          {/* Table Filters */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search shipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-900 border border-white/10 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-slate-900 border border-white/10 text-xs text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Disrupted">Disrupted</option>
              <option value="Normal">Normal</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-mono">
                <th className="py-2.5 px-3">Shipment ID</th>
                <th className="py-2.5 px-3">Route Lane</th>
                <th className="py-2.5 px-3">Mode</th>
                <th className="py-2.5 px-3">Geo Risk</th>
                <th className="py-2.5 px-3">Reliability</th>
                <th className="py-2.5 px-3">Lead Time</th>
                <th className="py-2.5 px-3">Delay</th>
                <th className="py-2.5 px-3">Risk Index</th>
                <th className="py-2.5 px-3">Outcome Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200 font-mono">
              {filteredShipments.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-cyan-400">{s.Shipment_ID}</td>
                  <td className="py-2.5 px-3 font-sans text-white">{s.Route_Label}</td>
                  <td className="py-2.5 px-3 font-sans">{s.Transport_Mode}</td>
                  <td className="py-2.5 px-3 text-rose-400 font-bold">{s.Geopolitical_Risk_Score}</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">{(s.Carrier_Reliability_Score * 100).toFixed(0)}%</td>
                  <td className="py-2.5 px-3 text-slate-300">{s.Lead_Time_Days}d</td>
                  <td className="py-2.5 px-3 text-amber-400">{s.Delay_Days}d</td>
                  <td className="py-2.5 px-3 text-violet-400 font-bold">{s.Risk_Index}</td>
                  <td className="py-2.5 px-3 font-sans">
                    {s.Disruption_Occurred === 1 ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <XCircle className="w-3 h-3" />
                        Disrupted
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        On Time
                      </span>
                    )}
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
