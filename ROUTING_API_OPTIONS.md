# Routing assessment — 2026-10-11

## Current application

The page still uses a static transit network. The existing Transitland key is only used by the standalone test, not by the page planner. OSRM supplies road geometry, but the optimizer still uses local duration/distance estimates; consequently a real road line does not imply that store order or ETA was optimized from those roads.

This change compares each available transit leg against direct walking for identical endpoints. Transit time includes access walking, estimated waiting, a ride via the transfer hub when applicable, and egress walking. Equal or slower transit is replaced with walking. The returned segment uses walking mode and no bus fare/boarding data. All-walking trips show a walking recommendation; mixed trips retain useful bus legs. This remains an estimated comparison, not a live timetable guarantee. Unavailable transit connections still show an explicit failure.

## API candidates

### HERE Routing v8 + Public Transit v8

A useful candidate for a unified provider. Transit supports alternative routes, transfer limits, pedestrian speed/access distance, polylines and departure times. A pedestrian alternative can be returned alongside transit. Local Chapel Hill/Carrboro/Durham coverage and departure-time quality must be verified with actual requests before replacing the current provider. No HERE key was available or tested.

Sources: https://docs.here.com/transit/reference/public-transit-api-v8-getroutes and https://docs.here.com/routing/docs/routing-v8-get-started . Pricing and account limits: https://www.here.com/get-started/pricing . The pricing page was not retrievable in this check, so no guaranteed free quota is assumed.

### Google Routes

Transit itineraries include walking legs, line/stop details, arrival/departure times, alternatives, and less-walking/fewer-transfer preferences. Transit does not support intermediate waypoints: multi-store journeys must be chained, carrying arrival plus shopping dwell time into each next departure. Compute Routes Essentials currently lists 10,000 monthly free events, then $5 per 1,000 in the first paid tier; features may select other SKUs. Map display policies require Google maps for mapped Routes results, so this is not a simple replacement under the current Leaflet/OSM map.

Sources: https://developers.google.com/maps/documentation/routes/transit-route , https://developers.google.com/maps/billing-and-pricing/pricing , https://developers.google.com/maps/documentation/routes/policies .

### Existing Transitland + street routing

Lowest credential/setup change for this project. The OTP-compatible endpoint supports includeWalkingItinerary and fallbackWalkingItinerary; compare returned full-trip durations instead of static speed guesses. Explorer includes 1,000 routing queries/month. Current beta documentation says no fares, no GTFS Realtime TripUpdates/VehiclePositions, and no transfers.txt support. Coverage and service dates still need validation; an authenticated empty result does not establish usable local routing.

Sources: https://www.transit.land/documentation/routing-platform/transit-otp and https://www.transit.land/plans-pricing/ . The broader platform also documents Valhalla street routing: https://www.transit.land/documentation/routing-platform/ . Verify endpoint access and quota under the existing account before choosing it for street routing.

### OpenTripPlanner (self-hosted)

Open source engine combining GTFS transit and OSM street data. Appropriate for control over local feeds, not the simplest hosted free API: requires data ingestion, graph construction, hosting and feed maintenance.

Source: https://www.opentripplanner.org/ .

## Recommended next integration

First choose a real data source for duration and distance, not just geometry. For driving/walking/cycling use a directed travel-time matrix to evaluate store visit order, then fetch matching route geometry. For transit chain schedule-aware legs through the stores and include shopping dwell times. Compare complete walking and transit options for the same shopping needs and departure time; preserve goods-only costs.

Test HERE as the replacement candidate if switching provider. Otherwise finish the existing Transitland integration before concluding that its route quality is worse than the current local model. Do not automatically migrate APIs or place secret keys in VITE variables.

Validation for this change: 49 automated tests passed; production build passed; browser verified a nearby-store transit selection becomes a walking-only trip, shows both walking legs, requests pedestrian geometry and displays no bus fare.
