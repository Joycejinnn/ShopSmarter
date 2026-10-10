import React, { useState } from 'react';
import { ShoppingBag, Sparkles, Navigation, Layers, ShieldCheck, Info, X } from 'lucide-react';
import { DEMO_SCENARIOS } from '../../data/demoScenarios';
import { ServiceIntegrationsCatalog } from '../../services/apiAdapters';

interface HeaderProps {
  onLoadScenario: (scenarioId: string) => void;
  onStartShopping: () => void;
  canStartShopping: boolean;
  activeScenarioId?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onLoadScenario,
  onStartShopping,
  canStartShopping,
}) => {
  const [showApiModal, setShowApiModal] = useState(false);

  return (
    <>
      <header className="bg-brand-card border-b border-brand-border sticky top-0 z-30 shadow-soft">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            {/* Brand Title & Tagline */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-sage flex items-center justify-center text-white shadow-card">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold tracking-tight text-brand-darkgreen">
                    Shopsmarter
                  </h1>
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-lightgreen text-brand-darkgreen">
                    24h Hackathon MVP
                  </span>
                </div>
                <p className="text-xs text-brand-muted hidden sm:block">
                  Everything you need. The smartest way to get it.
                </p>
              </div>
            </div>

            {/* Clickable Demo Scenarios */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-xs font-semibold text-brand-muted flex items-center gap-1 mr-1">
                <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
                Demos:
              </span>
              {DEMO_SCENARIOS.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => onLoadScenario(scenario.id)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-brand-border bg-brand-canvas hover:bg-brand-lightgreen hover:border-brand-sage hover:text-brand-darkgreen transition-colors text-brand-text flex items-center gap-1 shadow-sm"
                  title={scenario.description}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald"></span>
                  {scenario.badge}
                </button>
              ))}
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2 self-end lg:self-auto">
              <button
                onClick={() => setShowApiModal(true)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-brand-border text-brand-muted hover:text-brand-text hover:bg-brand-subtle flex items-center gap-1.5 transition-colors"
                title="View Modular API Architecture"
              >
                <Layers className="w-3.5 h-3.5 text-brand-sage" />
                <span className="hidden sm:inline">API Status</span>
              </button>

              <button
                onClick={onStartShopping}
                disabled={!canStartShopping}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-card transition-all ${
                  canStartShopping
                    ? 'bg-brand-primary text-white hover:bg-brand-darkgreen hover:shadow-floating active:scale-95'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                <Navigation className="w-4 h-4" />
                <span>Start Shopping Trip</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* API Adapters Architecture Modal */}
      {showApiModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-floating border border-brand-border animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-brand-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-lightgreen flex items-center justify-center text-brand-primary">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-brand-darkgreen">
                    Zero Paid APIs & Architecture Transparency
                  </h3>
                  <p className="text-xs text-brand-muted">
                    100% Free & Open-Source Local Implementation
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowApiModal(false)}
                className="p-1 rounded-lg text-brand-muted hover:bg-brand-subtle"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-3 bg-brand-peachlight rounded-xl border border-brand-peach/30 text-xs text-brand-text flex items-start gap-2">
                <Info className="w-4 h-4 text-brand-orange mt-0.5 shrink-0" />
                <p>
                  <strong>No Paid Services Used:</strong> This application complies strictly with zero paid service rules. All maps use OpenStreetMap with Leaflet. All routing uses a deterministic local multimodal transit graph. All prices & availability are transparently labeled demo estimates.
                </p>
              </div>

              <div className="divide-y divide-brand-border border border-brand-border rounded-xl overflow-hidden text-xs">
                {ServiceIntegrationsCatalog.ADAPTERS_STATUS.map((item) => (
                  <div key={item.id} className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-brand-darkgreen flex items-center gap-2">
                        {item.name}
                        <span className="text-[10px] px-1.5 py-0.5 bg-brand-subtle rounded text-brand-muted">
                          {item.category}
                        </span>
                      </div>
                      <div className="text-brand-muted text-[11px] mt-0.5">
                        Current: <span className="text-brand-primary font-medium">{item.currentMode}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-brand-border flex justify-end">
              <button
                onClick={() => setShowApiModal(false)}
                className="px-4 py-2 bg-brand-primary text-white text-xs font-semibold rounded-xl hover:bg-brand-darkgreen"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
