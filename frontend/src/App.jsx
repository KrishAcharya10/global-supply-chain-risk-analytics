import React, { useState, useMemo } from 'react';
import Header from './components/common/Header';
import StickyFilterBar from './components/common/StickyFilterBar';
import ExecutiveOverview from './components/overview/ExecutiveOverview';
import RelationshipExplorer from './components/relationships/RelationshipExplorer';
import RouteIntelligence from './components/routes/RouteIntelligence';
import CarrierAnalytics from './components/carriers/CarrierAnalytics';
import RiskDelayAnalysis from './components/risk/RiskDelayAnalysis';
import CostSustainability from './components/sustainability/CostSustainability';
import ScenarioSimulator from './components/simulator/ScenarioSimulator';

import rawPayload from '../../outputs/dashboard_payload.json';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');

  // Global Filter State
  const [filters, setFilters] = useState({
    mode: 'All',
    weather: 'All',
    riskBucket: 'All',
    reliability: 'All',
    search: '',
  });

  const handleResetFilters = () => {
    setFilters({
      mode: 'All',
      weather: 'All',
      riskBucket: 'All',
      reliability: 'All',
      search: '',
    });
  };

  const availableModes = ['Air', 'Rail', 'Sea', 'Road'];
  const availableWeather = ['Clear', 'Rain', 'Fog', 'Storm', 'Hurricane'];

  // Filtered dataset generator for views that accept filter slices
  const filteredData = useMemo(() => {
    let payload = { ...rawPayload };

    if (!payload.scatter_samples) return payload;

    let samples = [...payload.scatter_samples];
    let highRisk = [...(payload.high_risk_shipments || [])];

    if (filters.mode !== 'All') {
      samples = samples.filter((d) => d.Transport_Mode === filters.mode);
      highRisk = highRisk.filter((d) => d.Transport_Mode === filters.mode);
    }

    if (filters.weather !== 'All') {
      samples = samples.filter((d) => d.Weather_Condition === filters.weather);
      highRisk = highRisk.filter((d) => d.Weather_Condition === filters.weather);
    }

    if (filters.riskBucket !== 'All') {
      samples = samples.filter((d) => {
        const score = d.Geopolitical_Risk_Score;
        if (filters.riskBucket === 'Low') return score <= 3.5;
        if (filters.riskBucket === 'Medium') return score > 3.5 && score <= 7.0;
        if (filters.riskBucket === 'High') return score > 7.0;
        return true;
      });
    }

    if (filters.search !== '') {
      const q = filters.search.toLowerCase();
      highRisk = highRisk.filter((d) =>
        d.Shipment_ID?.toLowerCase().includes(q) ||
        d.Route_Label?.toLowerCase().includes(q)
      );
    }

    return {
      ...payload,
      scatter_samples: samples,
      high_risk_shipments: highRisk,
    };
  }, [filters]);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans">
      
      {/* SaaS Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        kpis={rawPayload.kpis}
        modelMetrics={rawPayload.model_metrics}
        onResetFilters={handleResetFilters}
      />

      {/* Sticky Global Filter Controls */}
      <StickyFilterBar
        filters={filters}
        setFilters={setFilters}
        onReset={handleResetFilters}
        availableModes={availableModes}
        availableWeather={availableWeather}
      />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && (
              <ExecutiveOverview data={filteredData} onNavigateTab={setActiveTab} />
            )}

            {activeTab === 'relationships' && (
              <RelationshipExplorer data={filteredData} />
            )}

            {activeTab === 'routes' && (
              <RouteIntelligence data={filteredData} />
            )}

            {activeTab === 'carriers' && (
              <CarrierAnalytics data={filteredData} />
            )}

            {activeTab === 'risk' && (
              <RiskDelayAnalysis data={filteredData} />
            )}

            {activeTab === 'sustainability' && (
              <CostSustainability data={filteredData} />
            )}

            {activeTab === 'simulator' && (
              <ScenarioSimulator data={rawPayload} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-4 px-4 lg:px-8 text-center text-xs text-slate-500 font-mono">
        <p>ANTIGRAVITY SUPPLY CHAIN RISK ANALYTICS PLATFORM • BUILT FOR DEMO & JUDGING • 5,000 SHIPMENTS EVALUATED</p>
      </footer>

    </div>
  );
}
