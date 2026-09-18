import React from 'react';
import { Filter, Search, RotateCcw, CloudSun, Truck, ShieldAlert, Award } from 'lucide-react';

export default function StickyFilterBar({ filters, setFilters, onReset, availableModes, availableWeather }) {
  const handleInputChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const isFiltered =
    filters.mode !== 'All' ||
    filters.weather !== 'All' ||
    filters.riskBucket !== 'All' ||
    filters.reliability !== 'All' ||
    filters.search !== '';

  return (
    <div className="sticky top-[108px] z-30 bg-[#0b0f19]/90 backdrop-blur-md border-b border-white/5 py-2.5 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Filter by Route, Port, or Shipment ID..."
            value={filters.search}
            onChange={(e) => handleInputChange('search', e.target.value)}
            className="w-full bg-slate-900/90 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          
          {/* Transport Mode */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-white/10">
            <Truck className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={filters.mode}
              onChange={(e) => handleInputChange('mode', e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900 text-slate-200">All Modes</option>
              {availableModes.map((m) => (
                <option key={m} value={m} className="bg-slate-900 text-slate-200">{m}</option>
              ))}
            </select>
          </div>

          {/* Weather Severity */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-white/10">
            <CloudSun className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={filters.weather}
              onChange={(e) => handleInputChange('weather', e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900 text-slate-200">All Weather</option>
              {availableWeather.map((w) => (
                <option key={w} value={w} className="bg-slate-900 text-slate-200">{w}</option>
              ))}
            </select>
          </div>

          {/* Risk Level */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-white/10">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <select
              value={filters.riskBucket}
              onChange={(e) => handleInputChange('riskBucket', e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900 text-slate-200">All Risk Tiers</option>
              <option value="Low" className="bg-slate-900 text-emerald-400">Low Risk</option>
              <option value="Medium" className="bg-slate-900 text-amber-400">Medium Risk</option>
              <option value="High" className="bg-slate-900 text-rose-400">High Risk</option>
            </select>
          </div>

          {/* Carrier Reliability */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-white/10">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={filters.reliability}
              onChange={(e) => handleInputChange('reliability', e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900 text-slate-200">All Carrier Tiers</option>
              <option value="Poor" className="bg-slate-900 text-rose-400">Poor (&lt;65%)</option>
              <option value="Good" className="bg-slate-900 text-amber-400">Good (65-85%)</option>
              <option value="Excellent" className="bg-slate-900 text-emerald-400">Excellent (&gt;85%)</option>
            </select>
          </div>

          {/* Reset button */}
          {isFiltered && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-all text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

        </div>

      </div>
    </div>
  );
}
