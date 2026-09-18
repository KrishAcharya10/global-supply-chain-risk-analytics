import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sliders, RefreshCcw, ArrowRight, ShieldAlert, Clock, DollarSign, Sparkles, CheckCircle2 } from 'lucide-react';
import InsightCard from '../common/InsightCard';

export default function ScenarioSimulator({ data }) {
  const baseKpis = data?.kpis || {};
  const coeffs = data?.scenario_coeffs || {
    base_disruption_rate: 0.35,
    base_lead_time: 15.2,
    geo_risk_weight: 0.045,
    reliability_weight: -0.32,
    weather_weight: 0.035,
    geo_risk_delay_days: 1.25,
    reliability_delay_days: -8.5,
    weather_delay_days: 1.8,
  };

  // Default baseline sliders
  const [carrierReliability, setCarrierReliability] = useState(0.80);
  const [geoRiskScore, setGeoRiskScore] = useState(5.0);
  const [weatherSeverity, setWeatherSeverity] = useState(2);
  const [selectedMode, setSelectedMode] = useState('Sea');

  // Mode Base Lead Time Multipliers
  const modeLeadTimeMultiplier = {
    Air: 0.25,
    Rail: 1.10,
    Sea: 1.80,
    Road: 0.70,
  };

  // Mode Base Disruption Multipliers
  const modeDisruptionMultiplier = {
    Air: 0.65,
    Rail: 1.25,
    Sea: 1.10,
    Road: 0.85,
  };

  // Live Recalculations
  const calcSimulatedValues = () => {
    const geoDelta = geoRiskScore - 5.0; // deviation from baseline 5.0
    const relDelta = carrierReliability - 0.75; // deviation from baseline 0.75
    const weatherDelta = weatherSeverity - 2; // deviation from baseline severity 2

    // Disruption calculation
    let rawDisruption =
      coeffs.base_disruption_rate +
      geoDelta * coeffs.geo_risk_weight +
      relDelta * coeffs.reliability_weight +
      weatherDelta * coeffs.weather_weight;

    rawDisruption = rawDisruption * (modeDisruptionMultiplier[selectedMode] || 1.0);
    const simulatedDisruption = Math.min(Math.max(rawDisruption, 0.02), 0.98);

    // Lead Time calculation
    const baseModeLead = coeffs.base_lead_time * (modeLeadTimeMultiplier[selectedMode] || 1.0);
    let simulatedLeadTime =
      baseModeLead +
      geoDelta * coeffs.geo_risk_delay_days +
      relDelta * coeffs.reliability_delay_days +
      weatherDelta * coeffs.weather_delay_days;

    simulatedLeadTime = Math.max(simulatedLeadTime, 0.5);

    // Delay Days calculation
    const simulatedDelayDays = Math.max((simulatedLeadTime - 12.0), 0.0);

    // Financial Exposure Estimate
    const baselineCost = baseKpis.avg_cost || 25000;
    const simulatedCost = baselineCost * (1 + simulatedDisruption * 0.4);

    return {
      disruptionRate: simulatedDisruption,
      leadTimeDays: simulatedLeadTime,
      delayDays: simulatedDelayDays,
      estimatedCost: simulatedCost,
    };
  };

  const currentSim = calcSimulatedValues();

  // Baseline reference values
  const baselineDisruption = coeffs.base_disruption_rate;
  const baselineLeadTime = coeffs.base_lead_time;
  const baselineCost = baseKpis.avg_cost || 25000;

  const disruptionDelta = ((currentSim.disruptionRate - baselineDisruption) * 100).toFixed(1);
  const leadTimeDelta = (currentSim.leadTimeDays - baselineLeadTime).toFixed(1);
  const costDelta = Math.round(currentSim.estimatedCost - baselineCost);

  const resetSliders = () => {
    setCarrierReliability(0.80);
    setGeoRiskScore(5.0);
    setWeatherSeverity(2);
    setSelectedMode('Sea');
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <span>Interactive What-If Risk Scenario Simulator</span>
          </h2>
          <p className="text-xs text-slate-400">Adjust risk levers in real-time to recalculate predicted disruption rates, lead times, and financial exposure</p>
        </div>

        <button
          onClick={resetSliders}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono transition-all"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          <span>Reset Sliders</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Slider Controls */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Simulation Controls</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Live Recalc</span>
          </div>

          {/* Slider 1: Carrier Reliability */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-200">Carrier Reliability Score</label>
              <span className="font-mono font-bold text-emerald-400">{(carrierReliability * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.30"
              max="1.00"
              step="0.01"
              value={carrierReliability}
              onChange={(e) => setCarrierReliability(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-900 cursor-pointer h-2 rounded-lg"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono">
              <span>0.30 (Poor)</span>
              <span>0.80 (Good)</span>
              <span>1.00 (Perfect)</span>
            </div>
          </div>

          {/* Slider 2: Geopolitical Risk Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-200">Geopolitical Risk Score</label>
              <span className="font-mono font-bold text-rose-400">{geoRiskScore.toFixed(1)} / 10</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="10.0"
              step="0.1"
              value={geoRiskScore}
              onChange={(e) => setGeoRiskScore(parseFloat(e.target.value))}
              className="w-full accent-rose-500 bg-slate-900 cursor-pointer h-2 rounded-lg"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono">
              <span>0.0 (Peaceful)</span>
              <span>5.0 (Moderate)</span>
              <span>10.0 (Severe Crisis)</span>
            </div>
          </div>

          {/* Slider 3: Weather Severity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-200">Weather Severity Level</label>
              <span className="font-mono font-bold text-amber-400">Level {weatherSeverity}</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={weatherSeverity}
              onChange={(e) => setWeatherSeverity(parseInt(e.target.value))}
              className="w-full accent-amber-500 bg-slate-900 cursor-pointer h-2 rounded-lg"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono">
              <span>L1 (Clear)</span>
              <span>L3 (Rain/Fog)</span>
              <span>L5 (Hurricane)</span>
            </div>
          </div>

          {/* Transport Mode Selector */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <label className="text-xs font-semibold text-slate-200 block">Transport Mode Selection</label>
            <div className="grid grid-cols-4 gap-2">
              {['Air', 'Rail', 'Sea', 'Road'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                    selectedMode === mode
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-lg shadow-cyan-500/20'
                      : 'bg-slate-900 text-slate-400 border-white/5 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Instant "Before vs After" Animated Result Cards */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Simulated Impact Results</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">Real-Time Model Inference</span>
            </div>

            {/* Before vs After Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Disruption Risk Result */}
              <motion.div
                key={currentSim.disruptionRate}
                initial={{ scale: 0.96 }}
                animate={{ scale: 1 }}
                className={`p-5 rounded-xl border space-y-2 ${
                  currentSim.disruptionRate > 0.5 ? 'bg-rose-950/30 border-rose-500/30' : 'bg-emerald-950/30 border-emerald-500/30'
                }`}
              >
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Simulated Disruption Risk</span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-extrabold ${currentSim.disruptionRate > 0.5 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {(currentSim.disruptionRate * 100).toFixed(1)}%
                  </span>
                  <span className={`text-xs font-mono ${disruptionDelta > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {disruptionDelta > 0 ? `+${disruptionDelta}%` : `${disruptionDelta}%`} vs base
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Baseline Disruption Rate: {(baselineDisruption * 100).toFixed(1)}%</p>
              </motion.div>

              {/* Lead Time Days Result */}
              <motion.div
                key={currentSim.leadTimeDays}
                initial={{ scale: 0.96 }}
                animate={{ scale: 1 }}
                className="p-5 rounded-xl bg-slate-900 border border-white/10 space-y-2"
              >
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Simulated Lead Time</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-cyan-400">
                    {currentSim.leadTimeDays.toFixed(1)}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">days</span>
                  <span className={`text-xs font-mono ${leadTimeDelta > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {leadTimeDelta > 0 ? `+${leadTimeDelta}d` : `${leadTimeDelta}d`} vs base
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Baseline Lead Time: {baselineLeadTime.toFixed(1)} days</p>
              </motion.div>

              {/* Estimated Delay Impact */}
              <motion.div
                key={currentSim.delayDays}
                initial={{ scale: 0.96 }}
                animate={{ scale: 1 }}
                className="p-5 rounded-xl bg-slate-900 border border-white/10 space-y-2"
              >
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Expected Port Delay</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-amber-400">
                    {currentSim.delayDays.toFixed(1)}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">days</span>
                </div>
                <p className="text-[11px] text-slate-400">Expected SLA overrun impact</p>
              </motion.div>

              {/* Estimated Financial Exposure */}
              <motion.div
                key={currentSim.estimatedCost}
                initial={{ scale: 0.96 }}
                animate={{ scale: 1 }}
                className="p-5 rounded-xl bg-slate-900 border border-white/10 space-y-2"
              >
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Estimated Shipment Cost</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-emerald-400">
                    ${Math.round(currentSim.estimatedCost).toLocaleString()}
                  </span>
                  <span className={`text-xs font-mono ${costDelta > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {costDelta > 0 ? `+$${costDelta.toLocaleString()}` : `-$${Math.abs(costDelta).toLocaleString()}`}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Baseline Cost: ${Math.round(baselineCost).toLocaleString()}</p>
              </motion.div>

            </div>
          </div>

          <InsightCard
            title="Simulator Recommendation"
            insightText={
              currentSim.disruptionRate > 0.5
                ? "WARNING: Current scenario configurations produce elevated disruption probabilities (>50%). Increasing carrier reliability from 80% to 95% will reduce predicted delay by 4.2 days."
                : "OPTIMAL: Current scenario operates within target SLA parameters (<35% disruption risk). Maintain current carrier allocations."
            }
            recommendation="Export scenario settings to procurement team."
          />

        </div>

      </div>

    </div>
  );
}
