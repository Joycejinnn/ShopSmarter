# UI and system-logic integration

Merged `origin/system-logic` at `676d8c9` into local `ui`, based on `origin/ui` at `05dae3b`. Existing uncommitted recipe editing work was saved separately as `e1fc307` before merging.

## Conflict decisions

- Preserved the system branch's expanded recipes, Trader Joe's offers, six store coordinates, static 25-stop transit graph, direct/transfer selection, first-mile estimates, custom recipe modal, heuristic extraction and optional asynchronous LLM adapter.
- Preserved the UI branch's two-tab layout, goods-only totals/budgets, editable origin, shopping checklist, recipe ingredient overrides, and duplicate dish merging. Quick-add and asynchronous parsing both use the same merge helper. Custom dishes can also be edited, reset and merged by name.
- Unified recipe quantities: system custom recipes are based on two servings; saved UI overrides use the serving count at save time. The manual modal accepts amounts for its selected servings and normalizes once. An empty override means an intentionally empty recipe, not a reset.
- Retained estimated transit fares in route details and `totalTripCost`, separately from `totalGoodsCost`/`totalCost`. Shopping budget and price optimization use goods only, as requested in the UI requirements.
- Removed the system fallback that fabricated Route 400 and a fare when no connection existed. Disconnected or out-of-coverage transit legs are marked unavailable and make the trip infeasible. Visit-order evaluation prefers connected permutations. Nearby points at the same stop do not incur a boarding fare.
- OSRM requests use mode-specific car/foot/bike datasets. Bus geometry is not replaced with a driving route. Road responses are validated, bounded successful results are cached, simultaneous requests share work, timeout/offline fallbacks are not cached, and obsolete map updates are ignored.

## Validation

- `npm test`: 40 tests, including all 17 system core tests, the five prior UI tests, and 18 integration cases.
- `npm run build`: TypeScript and production build.
- Browser checks: repeat quick-add merges; edited amounts and removed ingredients update shopping; checklist check/uncheck; custom recipe quantities for four servings; later scaling/reset; modal reset; transit details; Plan/Map mode sync; no page errors; 390px layout without horizontal overflow.
- Live requests using public Chapel Hill coordinates: car, foot and bike services each returned HTTP 200 / `Ok`, with 207, 259 and 210 geometry points respectively.
- `.env.local` and local browser-test artifacts remain ignored. No credentials were added or printed.

## Limits retained explicitly

Transit connections/fares are estimates from static data, not verified timetables, service calendars or current operator prices. The graph supports direct routes and one transfer; it is not a full schedule-aware transit planner. Transitland remains a standalone integration test/planning document, not the page routing engine.

OSRM updates map geometry only; optimizer travel times, distances and store order remain based on local estimates. Successful geometry cache lasts for the page session. Public routing service availability is not guaranteed; an offline path is an estimate.

The LLM adapter is optional and retains local fallback. Live LLM calls were not made; tests cover disabled and failed-provider paths. Its incoming browser-side VITE configuration is not appropriate for a shared production secret; the existing Transitland server-only key remains separate.

OSRM mode selection reference: https://project-osrm.org/docs/v5.22.0/api/ (profile is determined by the prepared dataset). Mode-specific public endpoints follow https://github.com/Project-OSRM/osrm-frontend .
