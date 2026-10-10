import React, { useState } from 'react';
import { ShoppingBag, Archive, Map, ListFilter } from 'lucide-react';

interface ThreePanelLayoutProps {
  leftPanel: React.ReactNode;
  centerPanel: React.ReactNode;
  rightPanel: React.ReactNode;
}

export const ThreePanelLayout: React.FC<ThreePanelLayoutProps> = ({
  leftPanel,
  centerPanel,
  rightPanel
}) => {
  const [mobileTab, setMobileTab] = useState<'needs' | 'plan' | 'trip'>('plan');

  return (
    <div className="max-w-[1720px] mx-auto px-3 sm:px-6 py-4">
      {/* Desktop 3-Column Layout */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Needs & Pantry (3.5 cols) */}
        <div className="lg:col-span-4 space-y-4">{leftPanel}</div>

        {/* Center Column: Shopping Plan & Multi-Store Allocations (4.5 cols) */}
        <div className="lg:col-span-4 space-y-4">{centerPanel}</div>

        {/* Right Column: Map, Multimodal Trip & Journey Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-4 sticky top-20">{rightPanel}</div>
      </div>

      {/* Mobile / Tablet Tabbed View */}
      <div className="block lg:hidden pb-16">
        {mobileTab === 'needs' && <div className="space-y-4">{leftPanel}</div>}
        {mobileTab === 'plan' && <div className="space-y-4">{centerPanel}</div>}
        {mobileTab === 'trip' && <div className="space-y-4">{rightPanel}</div>}

        {/* Bottom Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-brand-border py-2 px-4 shadow-floating flex items-center justify-around">
          <button
            onClick={() => setMobileTab('needs')}
            className={`flex flex-col items-center gap-1 text-xs font-semibold ${
              mobileTab === 'needs' ? 'text-brand-primary' : 'text-stone-400'
            }`}
          >
            <Archive className="w-5 h-5" />
            <span>Needs & Pantry</span>
          </button>

          <button
            onClick={() => setMobileTab('plan')}
            className={`flex flex-col items-center gap-1 text-xs font-semibold ${
              mobileTab === 'plan' ? 'text-brand-primary' : 'text-stone-400'
            }`}
          >
            <ListFilter className="w-5 h-5" />
            <span>Shopping Plan</span>
          </button>

          <button
            onClick={() => setMobileTab('trip')}
            className={`flex flex-col items-center gap-1 text-xs font-semibold ${
              mobileTab === 'trip' ? 'text-brand-primary' : 'text-stone-400'
            }`}
          >
            <Map className="w-5 h-5" />
            <span>Map & Trip</span>
          </button>
        </div>
      </div>
    </div>
  );
};
