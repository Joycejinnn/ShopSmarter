import React, { useState } from 'react';
import { useShopsmarterState } from './hooks/useShopsmarterState';
import { Header } from './components/layout/Header';
import { ThreePanelLayout } from './components/layout/ThreePanelLayout';
import { NaturalLanguageInput } from './components/needs/NaturalLanguageInput';
import { CustomRecipeModal } from './components/needs/CustomRecipeModal';
import { ActiveNeedsList } from './components/needs/ActiveNeedsList';
import { PantryInventory } from './components/needs/PantryInventory';
import { OptimizationControls } from './components/plan/OptimizationControls';
import { RequirementsBreakdown } from './components/plan/RequirementsBreakdown';
import { StoreAllocationCard } from './components/plan/StoreAllocationCard';
import { TripContextPanel } from './components/trip/TripContextPanel';
import { TransportSelector } from './components/plan/TransportSelector';
import { MapView } from './components/trip/MapView';
import { RouteSummaryCard } from './components/trip/RouteSummaryCard';
import { ShoppingModeModal } from './components/shopping/ShoppingModeModal';
import { AlertCircle, ShoppingBag } from 'lucide-react';

export function App() {
  const {
    intents,
    pantryItems,
    tripContext,
    optimizationMode,
    requirements,
    plan,
    shoppingSession,
    lastNotification,
    addFromNaturalLanguage,
    addCustomRecipe,
    removeIntent,
    updateServings,
    updateRecipeIngredients,
    clearAllIntents,
    updatePantry,
    deletePantryItem,
    resetPantry,
    setTransportMode,
    setMaxStops,
    setOrigin,
    setDestinationMode,
    toggleStoreExclusion,
    setOptimizationMode,
    startShopping,
    markItemPurchased,
    setItemPurchased,
    markItemOutOfStock,
    completeTripAndSyncPantry,
    cancelShopping,
    isParsingLLM
  } = useShopsmarterState();

  const [customModalState, setCustomModalState] = useState<{ isOpen: boolean; dishName?: string }>({
    isOpen: false
  });

  // Left Panel: Needs & Pantry
  const leftPanel = (
    <div className="space-y-4">
      <NaturalLanguageInput
        onAddInput={addFromNaturalLanguage}
        lastNotification={lastNotification}
        isParsing={isParsingLLM}
        onOpenCustomModal={(dishName) => setCustomModalState({ isOpen: true, dishName })}
      />
      <ActiveNeedsList
        intents={intents}
        onRemoveIntent={removeIntent}
        onUpdateServings={updateServings}
        onUpdateRecipeIngredients={updateRecipeIngredients}
        onClearAll={clearAllIntents}
      />
      <details className="disclosure"><summary>My pantry <span>{pantryItems.length} items · edit inventory</span></summary><div className="pt-4">
      <PantryInventory
        pantryItems={pantryItems}
        onUpdatePantry={updatePantry}
        onDeleteItem={deletePantryItem}
        onResetPantry={resetPantry}
      />
      </div></details>
    </div>
  );

  // Center Panel: Shopping Plan & Multi-Store Allocations
  const centerPanel = (
    <div className="space-y-4">
      <TransportSelector mode={tripContext.transportMode} onChange={setTransportMode} />
      <OptimizationControls
        optimizationMode={optimizationMode}
        onSetOptimizationMode={setOptimizationMode}
        maxStops={tripContext.maxStops}
        onSetMaxStops={setMaxStops}
        excludedStoreIds={tripContext.excludedStoreIds}
        onToggleStoreExclusion={toggleStoreExclusion}
      />

      <RouteSummaryCard
        plan={plan}
        tripContext={tripContext}
        onStartShopping={startShopping}
      />



      {/* Unresolved Requirements Alert */}
      {plan.unresolvedRequirements.length > 0 && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            Items still needed ({plan.unresolvedRequirements.length})
          </div>
          <p className="text-amber-800 text-[11px]">
            The following items could not be found in currently included stores. Consider enabling
            specialty stores (e.g. Li Ming's Global Mart) or adjusting excluded stores:
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {plan.unresolvedRequirements.map((ur) => (
              <span
                key={ur.ingredientId}
                className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-semibold text-[11px]"
              >
                {ur.name} ({ur.shortfall} {ur.unit})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Store Allocation Cards */}
      {plan.storeAllocations.length > 0 ? (
        <div className="store-grid space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-brand-darkgreen flex items-center justify-between">
            <span>Shopping to-do list ({plan.storeAllocations.length})</span>
            <span className="text-[11px] font-normal text-brand-muted">
              Visit order
            </span>
          </div>

          {plan.storeAllocations.map((alloc, idx) => (
            <StoreAllocationCard key={alloc.store.id} allocation={alloc} stopIndex={idx} purchasedItems={shoppingSession.purchasedItems} onSetPurchased={setItemPurchased} />
          ))}
        </div>
      ) : (
        <div className="p-8 bg-brand-card rounded-2xl border border-brand-border text-center text-xs text-brand-muted space-y-2 shadow-sm">
          <ShoppingBag className="w-8 h-8 text-stone-300 mx-auto" />
          <p className="font-bold text-brand-darkgreen">No store visits required or planned</p>
          <p className="max-w-xs mx-auto text-[11px]">
            Add recipes or household items above to generate an optimized multi-store shopping plan.
          </p>
        </div>
      )}
    </div>
  );

  // Right Panel: Map & Multimodal Trip
  const rightPanel = (
    <div className="space-y-4">
      <TransportSelector mode={tripContext.transportMode} onChange={setTransportMode} />
      <TripContextPanel
        tripContext={tripContext}
        onSetOrigin={setOrigin}
        onSetDestinationMode={setDestinationMode}
      />

      <MapView plan={plan} tripContext={tripContext} />


    </div>
  );

  return (
    <div className="min-h-screen bg-brand-canvas text-brand-text flex flex-col">
      <Header />

      <main id="main-content" className="flex-1">
        <div className="page-intro"><div><p className="eyebrow">LESS PLANNING. BETTER SHOPPING.</p><h1>Your next shop, simplified.</h1><p>Bring your list. We’ll bring it together.</p></div><span className="demo-note">Demo prices & simulated routes</span></div>
        <ThreePanelLayout
          leftPanel={leftPanel}
          centerPanel={centerPanel}
          rightPanel={rightPanel}
        />
      </main>

      {/* Live In-Store Shopping Session Modal */}
      {shoppingSession.isActive && (
        <ShoppingModeModal
          session={shoppingSession}
          plan={plan}
          onMarkPurchased={markItemPurchased}
          onMarkOutOfStock={markItemOutOfStock}
          onCompleteTrip={completeTripAndSyncPantry}
          onCancelShopping={cancelShopping}
        />
      )}

      {/* Manual Custom Recipe & Ingredients Modal (Option 3) */}
      {customModalState.isOpen && <CustomRecipeModal
        isOpen={customModalState.isOpen}
        initialDishName={customModalState.dishName}
        onClose={() => setCustomModalState({ isOpen: false })}
        onSave={addCustomRecipe}
      />}
    </div>
  );
}
export default App;
