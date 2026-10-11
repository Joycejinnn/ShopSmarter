# Shopsmarter

**Plan meals, use what you already have, and turn the rest into one practical shopping trip.**

Shopsmarter is a pantry-aware, multi-store shopping planner. It connects recipes, everyday essentials, package sizes, store choices, and transportation preferences so users can move from “What should I buy?” to a complete, actionable plan.

## Why Shopsmarter

Most shopping tools stop at a list. Real shopping requires more decisions:

- Several meals may share the same ingredients.
- The pantry may already cover part of what is needed.
- Recipes specify quantities, while stores sell whole packages.
- The cheapest basket may require more stops and more travel time.
- A good plan changes when servings, stores, or transportation change.

Shopsmarter treats these as one connected planning problem instead of a collection of separate tasks.

## What it does

1. **Understand the request** — Add supported meals, custom dishes, and everyday items in one place.
2. **Build the real shopping need** — Scale servings, combine shared ingredients, normalize quantities, and subtract pantry inventory.
3. **Plan actual purchases** — Convert ingredient shortfalls into whole packages and compare purchasing options across stores.
4. **Balance the trip** — Optimize for lower cost, shorter time, or a balance of both while respecting store and transportation preferences.
5. **Support the shopping trip** — Visualize the route, follow a store-by-store checklist, respond to out-of-stock items, and add completed purchases back to the pantry.

## What makes it different

| A typical shopping list | Shopsmarter |
| --- | --- |
| Keeps meals and products as separate entries | Combines all needs into one coordinated plan |
| Uses recipe quantities as the final list | Calculates the whole packages a shopper actually buys |
| Ignores what is already at home | Deducts pantry inventory before recommending purchases |
| Focuses on a single store or manual comparison | Evaluates multi-store combinations automatically |
| Produces a static checklist | Recalculates when servings, inventory, stores, or travel preferences change |
| Ends when the list is created | Continues through routing, in-store progress, and pantry updates |

## Key capabilities

### Flexible meal and item planning

- Natural-language input for meals and household needs
- Editable recipes and custom dishes
- Serving-size controls that update ingredient quantities
- Ingredient normalization across common naming and unit differences
- Safe merging of repeated meals and direct-purchase items

### Pantry-aware calculations

- Editable household inventory
- Automatic deduction of ingredients already available
- Clear breakdown of total need, pantry coverage, and remaining shortfall
- Local persistence between sessions

### Package-aware store planning

- Whole-package purchasing instead of fractional-product assumptions
- Multi-store allocation based on the complete shopping need
- Cost, time, and balanced planning preferences
- Store exclusions and maximum-stop controls
- Consistent totals based on the products assigned to each store

### Trip and shopping support

- Walking, public transit, cycling, and driving preferences
- Configurable starting point and trip destination
- Interactive route and stop visualization
- Store-by-store shopping mode
- Out-of-stock handling without losing completed purchases
- One-step pantry updates after a trip

## How the planning flow works

Shopsmarter uses a modular pipeline so every user change can update the full plan:

```text
Meals and items
      ↓
Structured shopping needs
      ↓
Ingredient and unit normalization
      ↓
Pantry deduction and shortfall calculation
      ↓
Whole-package purchase matching
      ↓
Store and trip optimization
      ↓
Interactive shopping plan
```

This structure keeps recipe editing, pantry changes, purchase allocation, and route planning synchronized rather than treating them as independent features.

## Built with

- React
- TypeScript
- Vite
- Tailwind CSS
- Leaflet
- Vitest

## Run locally

Requirements: Node.js 18 or newer and npm.

```bash
npm ci
npm run dev
```

Create a production build:

```bash
npm run build
npm run preview
```

Run the automated test suite:

```bash
npm test
```

## Reliability

The automated suite currently includes 63 tests covering the planning logic and its most important interactions, including:

- Recipe scaling and customization
- Ingredient merging and unit handling
- Pantry deductions
- Whole-package calculations
- Multi-store allocation
- Cost and time optimization
- Transportation and route consistency
- Out-of-stock recovery
- Completed-trip pantry updates

## What's next

- Receipt-assisted pantry updates
- Shared household inventories and shopping lists
- Broader recipe and product coverage
- More adaptive trip planning
- Faster ways to reuse and share complete meal plans

## Project status

Shopsmarter is an actively developed planning prototype. The current version focuses on demonstrating a complete and explainable path from meal ideas to an organized shopping trip.
