# Implementation Plan — Shopsmarter

**Tagline:** *"Everything you need. The smartest way to get it."*  
**Platform:** React, TypeScript, Vite, Tailwind CSS, Lucide React, Leaflet (OpenStreetMap)  
**Execution Environment:** Completely local, offline-capable, 100% free & open-source, zero paid APIs.

---

## 1. Architectural Overview & Modular Structure

```
src/
├── types/
│   ├── index.ts               # Core entity types (Recipe, Pantry, Product, Offer, Store, Trip, Plan)
├── data/
│   ├── recipes.ts             # Predefined structured recipes (Mapo Tofu, Tomato Egg, Fried Rice, Spaghetti, etc.)
│   ├── pantrySeed.ts          # Seed inventory for My Pantry
│   ├── stores.ts              # 5 Chapel Hill / Carrboro / Durham stores with real coordinates & metadata
│   ├── products.ts            # 50+ realistic grocery & household products across all required categories
│   ├── productOffers.ts       # Store-specific offers with price, pack sizes, carry weight, availability
│   ├── travelGraph.ts         # Multimodal distance/time matrix & route geometry (Walking, Transit, Bike, Drive)
│   └── demoScenarios.ts       # 4 Pre-built interactive demo scenarios
├── services/
│   ├── intentParser.ts        # Natural language parser: extracts recipes, servings & direct purchase items
│   ├── recipeService.ts       # Recipe scaling, ingredient lookup, serving management
│   ├── pantryService.ts       # LocalStorage pantry management, stock check, gap deduction
│   ├── ingredientNormalizer.ts# Plural/alias normalization, unit compatibility (g/kg, ml/L, piece)
│   ├── travelService.ts       # Travel duration/distance calculation per mode, transit graph connection
│   └── apiAdapters/           # Modular future API adapters (Kroger, OpenFoodFacts, OSRM/Routes, LLM)
├── algorithms/
│   ├── shortfallCalculator.ts # Computes net shortfall: max(0, required - pantry) + whole package packs
│   ├── storeOptimizer.ts      # Multi-store combinatorial evaluator, whole-pack cost & weight, budget/capacity
│   └── routePlanner.ts        # Stop ordering (TSP), origin -> stops -> destination, mode-specific routing
├── hooks/
│   ├── useShopsmarterState.ts # Central application state manager & sync
│   └── useGeolocation.ts      # Safe browser location with demo fallback and out-of-bounds detection
├── components/
│   ├── layout/
│   │   ├── Header.tsx         # Brand header, scenario switcher, budget indicator, demo badge
│   │   ├── ThreePanelLayout.tsx # Responsive 3-column desktop layout & mobile tabs
│   │   └── MobileNav.tsx      # Mobile bottom navigation tabs
│   ├── needs/
│   │   ├── NaturalLanguageInput.tsx # "What are you planning to cook or buy today?"
│   │   ├── ActiveNeedsList.tsx      # Meal cards with serving adjusters, direct item badges, remove actions
│   │   └── PantryInventory.tsx      # Interactive pantry manager, stock adjustments, running-low alerts
│   ├── plan/
│   │   ├── OptimizationControls.tsx # Mode toggles (Save Money, Save Time, Balanced), max stops, transport
│   │   ├── RequirementsBreakdown.tsx # Ingredient shortfalls table (Required / Pantry / Needed / Packs)
│   │   ├── StoreAllocationCard.tsx  # Store-by-store breakdown with assigned items, pack totals, subtotals
│   │   ├── PlanComparisonModal.tsx  # Cost & time trade-off comparison with plain English explanation
│   │   └── UnresolvedItemsAlert.tsx # Clear warnings for unavailable items or constraint violations
│   ├── trip/
│   │   ├── TripContextPanel.tsx     # Location picker (Current / Map / Demo), transport mode, carrying limits
│   │   ├── MapView.tsx              # Interactive Leaflet map with origin, store pins, routes & tooltips
│   │   └── RouteSummaryCard.tsx     # Journey timeline, travel time, shopping time, carrying weight vs capacity
│   └── shopping/
│       ├── ShoppingModeModal.tsx    # Live shopping trip mode with checklists, out-of-stock handler & replan
│       └── TripSummaryModal.tsx     # Purchase receipt & "Add purchased items to pantry" confirmation
└── tests/
    └── coreLogic.test.ts            # Comprehensive Vitest suite for calculations, formulas and constraints
```

---

## 2. Core Mathematical Formulas & Logic (Section 9A - 9C)

1. **Shortfall Calculation:**
   $$\text{gap}_i = \max(0, \text{required}_i - \text{pantry}_i)$$
   For direct purchase items, pantry deduction does not apply ($\text{gap}_i = \text{target}_i$).

2. **Package Conversion (Whole Pack purchases):**
   $$\text{packs} = \lceil \text{gap}_i / \text{packQuantity} \rceil$$
   $$\text{buyQuantity} = \text{packs} \times \text{packQuantity}$$
   $$\text{surplus} = \text{buyQuantity} - \text{gap}_i$$
   Whole-package price and carrying weight are charged in full.

3. **Multi-Store Exhaustive Optimization:**
   - Candidate stores $S \subseteq \{1..5\}$, $|S| \le \text{maxStops}$ (default 2, up to 15 non-empty combinations).
   - Valid if every unresolved requirement has an available offer in $\bigcup_{s \in S} \text{Offers}(s)$.
   - Calculate whole-pack allocation to minimize objectives subject to constraints:
     - Carrying capacity: $W_{\text{total}} \le W_{\text{max}}$
     - User budget: $C_{\text{goods}} \le \text{Budget}$
     - Excluded stores: $s \notin \text{Excluded}$
   - Route Evaluation: For store set $S$, test permutations of visit orders starting from `Origin` $\to S_{\pi} \to$ `Destination` (Return to start, or end at last stop).
   - Objectives:
     - **Save Money:** $\min C_{\text{total}}$ (goods + transport), then $\min T_{\text{total}}$, then $\min |S|$.
     - **Save Time:** $\min T_{\text{total}}$, then $\min C_{\text{total}}$, then $\min |S|$.
     - **Balanced:** $\min S_{\text{balanced}} = 0.5 \times \frac{C_{\text{total}}}{C_{\text{ref}}} + 0.5 \times \frac{T_{\text{total}}}{T_{\text{ref}}}$.

4. **Plain Language Explanations:**
   Compare the selected plan with best alternatives (e.g., 1-store vs 2-store):
   `"We recommend visiting 2 stores (Li Ming's & Food Lion) saving $8.40 compared to single-store Target, adding only 14 min walking."`

---

## 3. UI/UX Aesthetic Details

- **Palette:** Warm off-white background (`bg-[#FAF8F5]` / warm canvas), sage green primary (`#2E6F40`, `#3F8A56`), emerald accents (`#10B981`), warm peach/orange highlights (`#FF8A50`, `#FFF2EB`).
- **Cards & Inputs:** Soft pill tags, rounded-2xl cards, subtle border highlights, clean typography (Inter / system fonts), Lucide icons with colored badges.
- **Visual Feedback:** Live recalculations, animated badges on shopping state changes, clear "Demo Estimate" transparency tags.

---

## 4. Execution Phases

1. Initialize project with Vite + React + TypeScript + Tailwind + Lucide + Leaflet.
2. Build data layers: stores, products (50+), offers, recipes, pantry seed, travel graph.
3. Build services & algorithms: NLP intent parser, recipe scaler, shortfall calculator, multi-store optimizer, multimodal router.
4. Implement UI components: Layout, Natural Language Input, Needs & Pantry, Optimization & Allocation, Map & Trip, Shopping Mode & Trip Summary.
5. Implement Demo Scenarios & LocalStorage persistence.
6. Write and run automated unit tests verifying all Section 17 requirements.
7. Verification & polish.
