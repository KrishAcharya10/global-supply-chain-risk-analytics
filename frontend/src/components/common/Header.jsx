import React from 'react';
import { ShieldAlert, Activity, Cpu, Layers, GitPullRequest, Truck, DollarSign, Sliders, RefreshCw } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, kpis, modelMetrics, onResetFilters }) {
  const tabs = [
    { id: 'overview', label: 'Executive Overview', icon: Activity },
    { id: 'relationships', label: 'Relationship Explorer', icon: GitPullRequest, highlight: true },
    { id: 'routes', label: 'Route Intelligence', icon: Layers },
    { id: 'carriers', label: 'Carrier Analytics', icon: Truck },
    { id: 'risk', label: 'Risk & Delay', icon: ShieldAlert },
    { id: 'sustainability', label: 'Cost & Sustainability', icon: DollarSign },
    { id: 'simulator', label: 'What-If Simulator', icon: Sliders },
  ];

  const roc = modelMetrics?.classification?.roc_auc ? (modelMetrics.classification.roc_auc * 100).toFixed(1) : '81.6';
  const r2 = modelMetrics?.regression?.r2 ? (modelMetrics.regression.r2 * 100).toFixed(1) : '99.9';

  return (
    <header className="sticky top-0 z-40 bg-[#07090e]/90 backdrop-blur-xl border-b border-white/10 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Brand & Live Metrics Header */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ShieldAlert className="w-6 h-6 text-black stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  ANTIGRAVITY <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">RISK PLATFORM v2.0</span>
                </h1>
              </div>
              <p className="text-xs text-slate-400">Global Supply Chain Intelligence & Risk Analytics Engine</p>
            </div>
          </div>

          <button 
            onClick={onResetFilters}
            className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
            title="Reset Filters"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Model Accuracy & Status Pill */}
        <div className="hidden md:flex items-center gap-4 text-xs font-mono bg-slate-900/80 px-4 py-2 rounded-xl border border-white/5">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>ML Disruption ROC-AUC: <strong className="text-cyan-400">{roc}%</strong></span>
          </div>
          <div className="h-3 w-px bg-slate-800" />
          <div className="flex items-center gap-1.5 text-slate-300">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Lead Time R²: <strong className="text-emerald-400">{r2}%</strong></span>
          </div>
          <div className="h-3 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-400">{kpis?.total_shipments?.toLocaleString() || '5,000'} Shipments Analyzed</span>
          </div>
        </div>

      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto mt-3 pt-2 border-t border-white/5 overflow-x-auto no-scrollbar">
        <nav className="flex items-center gap-1.5 pb-1 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                    : tab.highlight
                    ? 'text-cyan-400 hover:bg-slate-800/80 border border-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.highlight && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
