# Shopsmarter — AI-Powered Multi-Store Grocery & Everyday Shopping Assistant

**Tagline:** *"Everything you need. The smartest way to get it."*  
**Platform:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Leaflet (OpenStreetMap)  
**Execution Environment:** 100% Free & Open-Source, zero paid APIs, zero cloud bills, runs entirely locally.

---

## 1. Quick Start Guide (Running Locally)

All cache, temporary files, and dependencies reside entirely on your workspace drive (`E:\Shopsmarter`), strictly avoiding C: drive downloads:

```bash
# 1. Open terminal in project root
cd E:\Shopsmarter

# 2. Run unit test suite (12 comprehensive tests)
npm test

# 3. Start local development server
npm run dev

# 4. Or build and preview production bundle
npm run build
npm run preview
```

The app will start instantly at `http://localhost:5173`.

---

## 2. Summary of Implemented Features

### A. Natural-Language Shopping Input & Multimodal Intent Parsing
- **Single Natural Language Field:** *"What are you planning to cook or buy today?"*
- **Recipe Intent Decomposition:** Recognizes dishes like **Mapo Tofu**, **Tomato Egg Stir-Fry**, **Fried Rice**, **Spaghetti Bolognese**, **Chicken Curry**, **Fluffy Pancakes**, **Fresh Garden Salad**, and **Scrambled Eggs**.
- **Direct Purchase Intent:** Recognizes non-recipe household essentials (*toilet paper, laundry detergent, dish soap, toothpaste, trash bags, facial tissues, foil*) and adds them directly without decomposition.
- **Serving Extraction:** Dynamically detects servings from phrasing like *"for two people"*, *"for 4"*, or Chinese *"两个人"*.
- **Synonym Normalization:** Merges aliases (`scallions = green onions`, `tofu = silken tofu = 嫩豆腐`, `ground pork = pork mince`, `doubanjiang = chili bean paste`).

### B. Interactive My Pantry Inventory
- Pre-seeded with realistic household staples: **Eggs** (3 pcs), **Jasmine Rice** (500g), **Cooking Oil** (500ml), **Salt** (200g), **Garlic** (2 cloves), **Soy Sauce** (150ml), and **Sugar** (250g).
- **Shortfall Deduction Formula:** $\text{gap}_i = \max(0, \text{required}_i - \text{pantry}_i)$.
- **Direct Purchase Protection:** Direct requests (e.g. *"buy toilet paper"*, *"buy another carton of eggs"*) are not deducted from pantry.
- In-place quantity adjusters (`+` / `-`), stock thresholds, low-stock alerts, and localStorage persistence.
- **Post-Shopping Inventory Sync:** Completed trips allow one-click addition of purchased whole packages into pantry inventory.

### C. Multi-Store Combinatorial Optimization Engine
- **Scope & Candidate Stores (Chapel Hill / Carrboro / Durham Area):**
  1. *Harris Teeter (Meadowmont)*: Fresh produce & dairy, close walking proximity.
  2. *Food Lion (Rams Plaza)*: Budget-friendly everyday grocery staples.
  3. *Target (Chapel Hill Blvd)*: Household essentials, paper products, toiletries.
  4. *Walmart Supercenter (New Hope Commons)*: Low-cost bulk groceries and cleaning supplies.
  5. *Li Ming's Global Mart (Asian Market)*: Exclusive specialty store for Pixian Doubanjiang, Sichuan Peppercorns, silken tofu, and Asian sauces.
- **Whole-Package Allocation:** Calculates exact whole cartons/packs:
  $$\text{packs} = \lceil \text{shortfall}_i / \text{packQuantity} \rceil$$
  Charges full package cost $C_{\text{goods}}$ and carries full package weight $W_{\text{total}}$.
- **Three Optimization Goals:**
  - **Save Money:** Minimizes total monetary spend $C_{\text{total}} = C_{\text{goods}} + C_{\text{trip}}$.
  - **Save Time:** Minimizes total trip duration $T_{\text{total}} = T_{\text{travel}} + T_{\text{shopping}}$.
  - **Balanced:** Evaluates normalized trade-off:
    $$S = 0.5 \times \frac{C_{\text{total}}}{C_{\text{ref}}} + 0.5 \times \frac{T_{\text{total}}}{T_{\text{ref}}}$$
- **Plain-Language Explanations:** Real algorithmic comparisons against alternative plans (e.g., *"We recommend visiting 2 stores (Li Ming's & Food Lion) saving $8.40 compared to single-stop Target, adding only 14 min travel time."*).

### D. Multimodal Transportation & Carrying Limits
- Evaluates **Walking**, **Public Transit** (GoTriangle Route 400 transit modeling with real fares), **Cycling**, and **Driving** (with fuel costs).
- **Carrying Capacity Modes:**
  - Backpack: 5 kg
  - 1 Shopping Bag: 8 kg
  - 2 Shopping Bags: 15 kg
  - Custom limit
- Real-time gauge and warning banner if heavy bulk items (e.g. laundry detergent + 5lb rice) violate carrying limits.

### E. Origin/Destination & Geolocation
- Three input modes: **Use Current GPS Location**, **Choose on Map**, or **Select Pre-defined Demo Location** (*UNC Campus*, *Meadowmont*, *Patterson Place*).
- Safe boundary check: graceful error and demo fallback if user is outside the Triangle service area.
- Destination flexibility: *"Return to Starting Point"* vs *"End at Last Store"*.

### F. Dynamic Map Visualization
- Interactive Leaflet map with OpenStreetMap tiles (100% free, no API keys).
- Numbered stop markers, origin house pin, interactive store cards, and multimodal route polylines.

### G. In-Store Live Shopping Mode
- Step-by-step checklist per store stop.
- Mark items as **"Got It" (Purchased)** or **"Out of Stock"**.
- Recalculates remaining route when an item is out of stock while preserving prior purchases.
- Final celebratory receipt summary with one-click **"Add Purchased Quantities to My Pantry"** button.

### H. 4 One-Click Demo Scenarios
1. **Scenario A — Cooking Tonight:** Dual recipe decomposition (Mapo Tofu + Tomato Egg), shared ingredient merging, pantry deduction, and specialty Asian market routing.
2. **Scenario B — Everyday Essentials:** Direct household essentials across multiple retail departments and store price comparisons.
3. **Scenario C — Shopping Without a Car:** Public transit modeling with a strict 1-bag (8kg) carrying capacity constraint.
4. **Scenario D — Dynamic Changes:** Live re-scaling of servings, exclusion of Walmart, and switching between Save Money and Save Time.

---

## 3. Data & API Architecture Transparency

| Component | Current Mode | Live Integration Status |
|---|---|---|
| **Mapping Tiles** | Leaflet + OpenStreetMap | 100% Free Open Tiles (Zero paid billing) |
| **Routing & Distance** | Deterministic Multimodal Graph | OpenRouteService / OSRM REST Adapter Ready |
| **Product Catalogs** | 55+ Verified Products across 13 departments | Kroger Developer OAuth2 Adapter Ready |
| **Nutrition & Barcodes** | Local Taxonomy (g/kg/ml) | Open Food Facts Public REST Adapter Ready |
| **Natural Language** | Deterministic Rule & Alias Parser | Gemini / LLM Multimodal Adapter Ready |

---

## 4. Automated Test Suite Results

Run `npm test` to verify all 12 unit tests in `src/tests/coreLogic.test.ts`:
- Increasing recipe servings updates ingredient quantities correctly.
- Duplicate ingredients from multiple recipes are merged into combined requirements.
- Pantry inventory is correctly subtracted from recipe needs ($\text{shortfall} = \max(0, \text{need} - \text{pantry})$).
- Household products are treated as direct purchase intents without decomposition.
- Removing a recipe preserves other independent intents and requirements.
- Unavailable items remain visible as unresolved requirements and are never silently dropped.
- Excluding a store excludes its offers and recalculates allocation.
- Detects carrying capacity violations when weight exceeds limit.
- Purchased items are added to pantry with proper quantities after shopping trip.
- Switching optimization priorities between Save Money and Save Time produces distinct trade-offs.
- Route includes all stores with assigned products and returns to origin.
- Plan totals equal the sum of whole-pack offer prices.
