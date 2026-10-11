# Transitland integration plan

Status: planned; credential placeholders and Git exclusions prepared. Runtime integration is not implemented yet.

## Configuration

Put the secret in E:/ShopSmarter/.env.local as TRANSITLAND_API_KEY. The local Node server will read this exact file. Never expose it through VITE_ variables, client configuration, URLs or logs. Commit only the empty .env.example template. Ignore .env, .env.*, and .transit-cache/; explicitly allow .env.example. Existing environment files must not be overwritten. Filling the file alone does not activate routing until implementation is complete.

## 1. Local server and adapter

Add a Node HTTP server bound to 127.0.0.1 with POST /api/transit/plan and a configuration-status endpoint that returns only a boolean. Proxy /api from Vite; update npm run dev to start and stop both processes. Production/preview must also have a documented server/proxy path. Use Node's environment-file support and built-in fetch. The Transitland key is sent only as the apikey header to the fixed official endpoint https://transit.land/api/v2/routing/otp/plan. Validate coordinates, service area, dates, allowed parameters and request sizes. Add timeouts and safe error responses; never return upstream authorization data.

## 2. Timetable-aware planning

Replace simulated transit durations, the fixed eight-minute wait and hardcoded Route 400. Add departure date/time in America/New_York and shopping minutes per store (initially the existing 12-minute assumption, editable). Convert absolute timestamps consistently, including midnight and daylight-saving changes. Query each segment sequentially: origin -> selected stores -> selected destination. Next departure equals the previous arrival plus shopping time; do not add shopping time after the final return leg. Include initial waiting time when calculating elapsed trip time. Disable fallback service dates; missing service must remain unavailable rather than silently using another date or simulated transit.

Separate goods-allocation candidates from route ranking. First release evaluates a bounded shortlist of store allocations and visit orders with actual transit requests, applies goods-cost/time/balanced preferences, and labels the result best among evaluated options rather than globally optimal. Show the request upper bound before calculation. A route with any unavailable leg is incomplete; do not start shopping against it as a complete transit plan. Keep total goods cost independent of transit fares.

## 3. Shared state and UI

Keep Plan and Map & trip transport controls synchronized. Add Plan transit route / Recalculate, loading, stale, empty, unavailable and retry states. A change to origin, destination, stores, shopping duration or departure time invalidates the old transit result. Cancel or disregard older requests so they cannot overwrite new input. Missing key produces a configuration message, not a fake route.

Display walking segments, agency and route names, boarding/alighting stops, scheduled departures/arrivals, transfers and waiting time in English. Render returned leg geometry; if geometry is missing, explicitly label the schematic segment. Use one accepted itinerary for both map and summary. Preserve the purchase checklist; do not reset purchased state merely because a route is fetched. Show Scheduled transit, not live vehicle tracking, and include Transitland attribution.

## 4. Usage controls

Only explicit user actions trigger billable/quota-consuming requests. Cache identical origin/destination/departure/constraint queries for a short TTL, coalesce duplicate requests, and limit concurrency. Persist a local outbound-request counter in ignored .transit-cache/ with a configurable conservative ceiling below the account allowance. Stop and report when the local ceiling is reached; do not automatically enable billing. This counter covers only this project instance and cannot guarantee account-wide usage; the provider dashboard remains authoritative. Do not automatically retry 401, 403 or 429. Limit retries for transient errors.

## 5. Validation and delivery

Unit-test response normalization, geometry decoding, chronological segment chaining, transfer waits, midnight/DST, unavailable service, missing credentials, quota limits, and goods-only costs using sanitized fixtures. Browser-test shared controls, stale-response rejection, checklist preservation, error handling and responsive route details. Ensure no secret is present in browser requests, responses, built assets, or Git-tracked files. Run existing tests and production build. After the user fills the key, perform a small bounded live test on public demo locations and confirm local coverage. No live service claim before that succeeds.

## Sources

- https://www.transit.land/documentation/routing-platform/
- https://www.transit.land/documentation/routing-platform/transit-otp
- https://www.transit.land/plans-pricing/

API documentation currently describes timetable routing without GTFS Realtime TripUpdates/VehiclePositions and without fares. Geographic coverage and transfer quality require actual local verification. Pricing and beta terms must be checked again before activation.
