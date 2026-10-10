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
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="app-header"><div className="header-inner">
        <a href="#main-content" className="wordmark"><ShoppingBag size={23} aria-hidden="true" />Shopsmarter<span className="brand-dot">.</span></a>
        <div className="header-tools">
          <label className="sr-only" htmlFor="demo-scenario">Try a demo</label>
          <select id="demo-scenario" value="" onChange={e => {if(e.target.value) onLoadScenario(e.target.value);}}><option value="">Try a demo</option>{DEMO_SCENARIOS.map(s => <option key={s.id} value={s.id}>{s.badge}</option>)}</select>
          <button onClick={() => setShowApiModal(true)} className="about-button"><Info size={16} aria-hidden="true" /><span>About the data</span></button>
        </div>
      </div></header>

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
              <button aria-label="Close data information"
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
              <button aria-label="Close data information"
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
