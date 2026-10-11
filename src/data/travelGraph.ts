import { TransportationMode, RouteSegment } from '../types';

export interface GeoCoord {
  lat: number;
  lng: number;
}

// Calculate Haversine distance in meters
export function calculateHaversineDistanceMeters(
  point1: GeoCoord,
  point2: GeoCoord
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (point1.lat * Math.PI) / 180;
  const phi2 = (point2.lat * Math.PI) / 180;
  const deltaPhi = ((point2.lat - point1.lat) * Math.PI) / 180;
  const deltaLambda = ((point2.lng - point1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Generate intermediate road/path waypoints between two coordinates
export function generateCurvedWaypoints(
  start: [number, number],
  end: [number, number],
  steps: number = 3
): [number, number][] {
  const points: [number, number][] = [start];
  for (let i = 1; i <= steps; i++) {
    const fraction = i / (steps + 1);
    // Slight realistic road jitter
    const lat = start[0] + (end[0] - start[0]) * fraction;
    const lng = start[1] + (end[1] - start[1]) * fraction;
    // Add small road curvature offset
    const curveOffset = Math.sin(fraction * Math.PI) * 0.0015;
    points.push([lat + curveOffset, lng - curveOffset * 0.5]);
  }
  points.push(end);
  return points;
}

// Estimated travel parameters; fares are not modeled.
export const TRANSPORT_MODES_CONFIG: Record<
  TransportationMode,
  {
    name: string;
    speedKmh: number;
    comfortMaxDistanceKm: number;
    icon: string;
    description: string;
  }
> = {
  walking: {
    name: 'Walking',
    speedKmh: 4.8, // ~80 m/min
    comfortMaxDistanceKm: 3.5,
    icon: 'Footprints',
    description: 'Walk between stores. No transportation cost.'
  },
  transit: {
    name: 'Public Transit',
    speedKmh: 22.0, // Bus transit including stops
    comfortMaxDistanceKm: 25.0,
    icon: 'Bus',
    description: 'Simulated travel time only. Transit routes and fares are not verified.'
  },
  cycling: {
    name: 'Cycling',
    speedKmh: 16.0,
    comfortMaxDistanceKm: 12.0,
    icon: 'Bike',
    description: 'Cycle between stores. No transportation cost.'
  },
  driving: {
    name: 'Driving',
    speedKmh: 45.0, // Arterial roads US-15/501
    comfortMaxDistanceKm: 50.0,
    icon: 'Car',
    description: 'Fastest for long distances and heavy hauls. Travel time is estimated.'
  }
};

// Real bus stops database for Chapel Hill Transit (CHT) and GoTriangle
export interface TransitStop {
  stopName: string;
  zone:
    | 'Carrboro'
    | 'North Chapel Hill'
    | 'Downtown / UNC'
    | 'East Chapel Hill'
    | 'Southern Village'
    | 'Durham Commercial'
    | 'Southpoint';
  lat: number;
  lng: number;
  routes: string[];
}

export const LOCAL_TRANSIT_STOPS: TransitStop[] = [
  // --- Carrboro ---
  {
    stopName: 'E Main St at Weaver St (Carr Mill Mall)',
    zone: 'Carrboro',
    lat: 35.9105,
    lng: -79.0752,
    routes: ['CHT Route J', 'CHT Route CW', 'CHT Route CPX']
  },
  {
    stopName: 'Jones Ferry Rd at Willow Creek (Carrboro)',
    zone: 'Carrboro',
    lat: 35.9012,
    lng: -79.0830,
    routes: ['CHT Route J', 'CHT Route CM']
  },
  {
    stopName: 'Old Fayetteville Rd at McDougle (North Carrboro)',
    zone: 'Carrboro',
    lat: 35.9220,
    lng: -79.0915,
    routes: ['CHT Route CW', 'CHT Route J']
  },
  {
    stopName: 'NC-54 at Carrboro Plaza (Carrboro West)',
    zone: 'Carrboro',
    lat: 35.9085,
    lng: -79.0935,
    routes: ['CHT Route CW', 'CHT Route CPX']
  },

  // --- North Chapel Hill / MLK Jr Blvd & Timberlyne ---
  {
    stopName: 'Martin Luther King Jr Blvd at Homestead Rd (Chapel Hill North)',
    zone: 'North Chapel Hill',
    lat: 35.9558,
    lng: -79.0572,
    routes: ['CHT Route NS', 'CHT Route T']
  },
  {
    stopName: 'Martin Luther King Jr Blvd at Municipal Dr',
    zone: 'North Chapel Hill',
    lat: 35.9388,
    lng: -79.0584,
    routes: ['CHT Route NS', 'CHT Route T', 'CHT Route HS']
  },
  {
    stopName: 'Martin Luther King Jr Blvd at Hillsborough St',
    zone: 'North Chapel Hill',
    lat: 35.9202,
    lng: -79.0570,
    routes: ['CHT Route NS', 'CHT Route T', 'CHT Route A']
  },
  {
    stopName: 'Weaver Dairy Rd at Timberlyne Shopping Center',
    zone: 'North Chapel Hill',
    lat: 35.9592,
    lng: -79.0435,
    routes: ['CHT Route T', 'CHT Route G', 'CHT Route HS']
  },
  {
    stopName: 'Weaver Dairy Rd at Carol Woods',
    zone: 'North Chapel Hill',
    lat: 35.9575,
    lng: -79.0520,
    routes: ['CHT Route T', 'CHT Route G']
  },

  // --- Downtown Chapel Hill & UNC Campus ---
  {
    stopName: 'E Franklin St at Varsity Theatre (Downtown Hub)',
    zone: 'Downtown / UNC',
    lat: 35.9135,
    lng: -79.0552,
    routes: ['GoTriangle 400', 'CHT Route J', 'CHT Route NS', 'CHT Route S', 'CHT Route D', 'CHT Route A', 'CHT Route CL']
  },
  {
    stopName: 'South Rd at Student Stores (UNC Campus)',
    zone: 'Downtown / UNC',
    lat: 35.9098,
    lng: -79.0475,
    routes: ['CHT Route S', 'CHT Route D', 'CHT Route U']
  },
  {
    stopName: 'Manning Dr at UNC Hospitals (Hospital Hub)',
    zone: 'Downtown / UNC',
    lat: 35.9045,
    lng: -79.0525,
    routes: ['GoTriangle 400', 'GoTriangle 800', 'CHT Route NS', 'CHT Route S', 'CHT Route D', 'CHT Route J', 'CHT Route V']
  },

  // --- Southern Village & South Chapel Hill ---
  {
    stopName: 'Market St at Southern Village (Lumina Theater)',
    zone: 'Southern Village',
    lat: 35.8778,
    lng: -79.0620,
    routes: ['CHT Route NS', 'CHT Route V']
  },
  {
    stopName: 'S Columbia St at Culbreth Rd (Southern Chapel Hill)',
    zone: 'Southern Village',
    lat: 35.8895,
    lng: -79.0605,
    routes: ['CHT Route NS', 'CHT Route V']
  },

  // --- East Chapel Hill / US-15/501 Commercial Corridor ---
  {
    stopName: 'E Franklin St at Eastgate Shopping Center (Trader Joe\'s)',
    zone: 'East Chapel Hill',
    lat: 35.9365,
    lng: -79.0238,
    routes: ['GoTriangle 400', 'CHT Route D', 'CHT Route CL']
  },
  {
    stopName: 'Fordham Blvd at Rams Plaza (Food Lion)',
    zone: 'East Chapel Hill',
    lat: 35.9328,
    lng: -79.0330,
    routes: ['GoTriangle 400', 'CHT Route D']
  },
  {
    stopName: 'Ephesus Church Rd at Colony Woods Dr',
    zone: 'East Chapel Hill',
    lat: 35.9315,
    lng: -79.0175,
    routes: ['CHT Route D', 'CHT Route CL']
  },
  {
    stopName: 'Meadowmont Village Cir at Harris Teeter',
    zone: 'East Chapel Hill',
    lat: 35.9080,
    lng: -79.0060,
    routes: ['CHT Route S', 'CHT Route V']
  },
  {
    stopName: 'Friday Center Park & Ride (NC-54)',
    zone: 'East Chapel Hill',
    lat: 35.9002,
    lng: -79.0125,
    routes: ['CHT Route S', 'CHT Route FCX', 'GoTriangle 800']
  },
  {
    stopName: 'NC-54 at Barbee Chapel Rd',
    zone: 'East Chapel Hill',
    lat: 35.9040,
    lng: -78.9880,
    routes: ['GoTriangle 800', 'CHT Route S']
  },

  // --- South Durham / US-15/501 Commercial Corridor ---
  {
    stopName: 'New Hope Commons Dr at Walmart Supercenter',
    zone: 'Durham Commercial',
    lat: 35.9552,
    lng: -78.9985,
    routes: ['GoTriangle 400', 'GoDurham 10']
  },
  {
    stopName: 'Durham-Chapel Hill Blvd at Patterson Place (Target)',
    zone: 'Durham Commercial',
    lat: 35.9528,
    lng: -78.9620,
    routes: ['GoTriangle 400', 'GoDurham 10']
  },
  {
    stopName: 'Westgate Dr at University Dr (Li Ming\'s Global Mart)',
    zone: 'Durham Commercial',
    lat: 35.9660,
    lng: -78.9635,
    routes: ['GoTriangle 400', 'GoDurham 10']
  },
  {
    stopName: 'University Dr at South Square (Durham)',
    zone: 'Durham Commercial',
    lat: 35.9610,
    lng: -78.9550,
    routes: ['GoTriangle 400', 'GoDurham 10', 'GoDurham 6']
  },

  // --- Southpoint / NC-54 Corridor ---
  {
    stopName: 'Renaissance Pkwy at The Streets at Southpoint',
    zone: 'Southpoint',
    lat: 35.9030,
    lng: -78.9415,
    routes: ['GoTriangle 800', 'GoDurham 5', 'GoDurham 7']
  }
];

// Find closest real-world transit stop to any coordinate
export function findNearestTransitStop(coords: [number, number]): TransitStop {
  let best = LOCAL_TRANSIT_STOPS[0];
  let minDistance = Infinity;
  for (const stop of LOCAL_TRANSIT_STOPS) {
    const dist = calculateHaversineDistanceMeters(
      { lat: coords[0], lng: coords[1] },
      { lat: stop.lat, lng: stop.lng }
    );
    if (dist < minDistance) {
      minDistance = dist;
      best = stop;
    }
  }
  return best;
}

// Resolve estimated connections in the static network; no timetable or live fare verification.
export function resolveTransitRouteDetails(
  fromCoords: [number, number],
  toCoords: [number, number]
) {
  const boarding = findNearestTransitStop(fromCoords);
  const debarking = findNearestTransitStop(toCoords);

  const firstMileMeters = calculateHaversineDistanceMeters(
    { lat: fromCoords[0], lng: fromCoords[1] },
    { lat: boarding.lat, lng: boarding.lng }
  );
  const firstMileMinutes = Math.max(1, Math.round(firstMileMeters / 80)); // ~80m/min walking
  const lastMileMeters = calculateHaversineDistanceMeters(
    { lat: toCoords[0], lng: toCoords[1] }, { lat: debarking.lat, lng: debarking.lng }
  );
  const isTransitDesert = firstMileMeters > 1200 || lastMileMeters > 1200;
  const unavailable = {
    routeName: undefined, boardingStop: boarding.stopName, debarkingStop: debarking.stopName,
    transferStop: undefined, transferRouteName: undefined, fare: undefined,
    firstMileWalkMeters: firstMileMeters, firstMileWalkMinutes: firstMileMinutes,
    isTransitDesert, details: 'No transit connection found in the local network.'
  };
  if (isTransitDesert) return unavailable;
  // No boarding (or fare) is needed for two locations served by the same stop.
  if (boarding === debarking) return { ...unavailable, fare: 0, routeName: 'Walk',
    details: 'Walk between nearby locations; no bus boarding needed.' };

  // 1. Direct route?
  const commonRoutes = boarding.routes.filter((r) => debarking.routes.includes(r));

  if (commonRoutes.length > 0) {
    // Prefer free Chapel Hill Transit route if available
    let routeName = commonRoutes[0];
    const freeCht = commonRoutes.find((r) => r.startsWith('CHT'));
    if (freeCht) {
      routeName = freeCht;
    }

    const fare = routeName.startsWith('CHT') || routeName.startsWith('GoDurham') ? 0.00 : 2.25;
    const fareText = fare === 0 ? 'Fare-Free ($0.00)' : `$${fare.toFixed(2)}`;

    let walkPrefix = '';
    if (firstMileMeters > 150) {
      walkPrefix = `Walk ${firstMileMeters > 1000 ? (firstMileMeters / 1000).toFixed(1) + 'km' : firstMileMeters + 'm'} (${firstMileMinutes}m) → `;
    }

    const details = `${walkPrefix}${routeName} (${fareText}) · Board: ${boarding.stopName} → Debark: ${debarking.stopName}`;

    return {
      routeName,
      boardingStop: boarding.stopName,
      debarkingStop: debarking.stopName,
      transferStop: undefined,
      transferRouteName: undefined,
      fare,
      firstMileWalkMeters: firstMileMeters,
      firstMileWalkMinutes: firstMileMinutes,
      isTransitDesert,
      details
    };
  }

  // 2. Multi-line Transfer route
  // Find transfer hub connecting boarding stop routes and debarking stop routes
  const candidateHubs = LOCAL_TRANSIT_STOPS.filter((stop) => {
    const hasFeeder = stop.routes.some((r) => boarding.routes.includes(r));
    const hasConnector = stop.routes.some((r) => debarking.routes.includes(r));
    return hasFeeder && hasConnector && stop.stopName !== boarding.stopName && stop.stopName !== debarking.stopName;
  });

  // Pick best hub (prefer Franklin St Downtown Hub or UNC Hospitals Hub)
  const transferHub =
    candidateHubs.find((h) => h.stopName.includes('Downtown Hub')) ||
    candidateHubs.find((h) => h.stopName.includes('Hospital Hub')) ||
    candidateHubs[0];

  if (transferHub) {
    const feederRoutes = boarding.routes.filter((r) => transferHub.routes.includes(r));
    const feederRoute = feederRoutes.find((r) => r.startsWith('CHT')) || feederRoutes[0];

    const connectingRoutes = debarking.routes.filter((r) => transferHub.routes.includes(r));
    const connectingRoute = connectingRoutes.find((r) => r.startsWith('CHT')) || connectingRoutes[0];

    const feederFare = feederRoute.startsWith('CHT') || feederRoute.startsWith('GoDurham') ? 0.00 : 2.25;
    const connectingFare = connectingRoute.startsWith('CHT') || connectingRoute.startsWith('GoDurham') ? 0.00 : 2.25;
    const totalFare = Math.round((feederFare + connectingFare) * 100) / 100;
    const fareText = totalFare === 0 ? 'Fare-Free ($0.00)' : `$${totalFare.toFixed(2)}`;

    const routeName = `${feederRoute} ➔ ${connectingRoute}`;
    let walkPrefix = '';
    if (firstMileMeters > 150) {
      walkPrefix = `Walk ${firstMileMeters > 1000 ? (firstMileMeters / 1000).toFixed(1) + 'km' : firstMileMeters + 'm'} (${firstMileMinutes}m) → `;
    }

    const details = `${walkPrefix}Board: ${feederRoute} at ${boarding.stopName} → Transfer at ${transferHub.stopName.split('(')[0].trim()} → ${connectingRoute} to ${debarking.stopName} (${fareText})`;

    return {
      routeName,
      boardingStop: boarding.stopName,
      debarkingStop: debarking.stopName,
      transferStop: transferHub.stopName,
      transferRouteName: connectingRoute,
      fare: totalFare,
      firstMileWalkMeters: firstMileMeters,
      firstMileWalkMinutes: firstMileMinutes,
      isTransitDesert,
      details
    };
  }

  // Do not invent a route or a fare when the static graph is disconnected.
  return unavailable;
}

// Calculate multimodal segment between any two points
export function getRouteSegment(
  fromName: string,
  fromCoords: [number, number],
  toName: string,
  toCoords: [number, number],
  mode: TransportationMode
): RouteSegment {
  const straightMeters = calculateHaversineDistanceMeters(
    { lat: fromCoords[0], lng: fromCoords[1] },
    { lat: toCoords[0], lng: toCoords[1] }
  );

  // Road network factor: roads are ~1.25x - 1.4x straight line distance
  const roadFactor = mode === 'transit' ? 1.35 : mode === 'walking' ? 1.25 : 1.3;
  const distanceMeters = Math.round(straightMeters * roadFactor);
  const distanceKm = distanceMeters / 1000;

  const config = TRANSPORT_MODES_CONFIG[mode];
  let durationMinutes = Math.round((distanceKm / config.speedKmh) * 60);

  let transitFare: number | undefined;
  let transitDetails: string | undefined;
  let transitRouteName: string | undefined;
  let boardingStop: string | undefined;
  let debarkingStop: string | undefined;
  let transferStop: string | undefined;
  let transferRouteName: string | undefined;
  let firstMileWalkMeters: number | undefined;
  let firstMileWalkMinutes: number | undefined;
  let isTransitDesert: boolean | undefined;
  let transitUnavailable: boolean | undefined;

  if (mode === 'transit') {
    const tr = resolveTransitRouteDetails(fromCoords, toCoords);
    transitUnavailable = !tr.routeName;
    transitFare = tr.fare;
    transitDetails = tr.details;
    transitRouteName = tr.routeName;
    boardingStop = tr.boardingStop;
    debarkingStop = tr.debarkingStop;
    transferStop = tr.transferStop;
    transferRouteName = tr.transferRouteName;
    firstMileWalkMeters = tr.firstMileWalkMeters;
    firstMileWalkMinutes = tr.firstMileWalkMinutes;
    isTransitDesert = tr.isTransitDesert;

    // Realistic transit duration:
    // Base ride time at ~22 km/h + walking time to stop + wait/transfer headway
    const baseRideMinutes = Math.round((distanceKm / config.speedKmh) * 60);
    const waitHeadwayMinutes = tr.transferStop ? 14 : 7;
    durationMinutes = tr.routeName === 'Walk'
      ? Math.max(3, Math.round(distanceMeters / 80))
      : Math.max(5, baseRideMinutes + tr.firstMileWalkMinutes + waitHeadwayMinutes);
  }

  // Minimum trip time floor
  durationMinutes = Math.max(3, durationMinutes);

  const geometry = generateCurvedWaypoints(fromCoords, toCoords);

  return {
    fromName,
    fromCoords,
    toName,
    toCoords,
    distanceMeters,
    durationMinutes,
    transportMode: mode,
    transitFare,
    transitDetails,
    transitRouteName,
    boardingStop,
    debarkingStop,
    transferStop,
    transferRouteName,
    firstMileWalkMeters,
    firstMileWalkMinutes,
    isTransitDesert,
    transitUnavailable,
    geometry
  };
}

// Cache successful road results only. Failed requests may retry after connectivity returns.
const routeGeometryCache = new Map<string, [number, number][]>();
const pendingGeometries = new Map<string, Promise<[number, number][]>>();
const ROAD_SERVERS = {
  walking: 'https://routing.openstreetmap.de/routed-foot',
  cycling: 'https://routing.openstreetmap.de/routed-bike',
  driving: 'https://routing.openstreetmap.de/routed-car'
};

export async function fetchRealRoadGeometry(
  fromCoords: [number, number],
  toCoords: [number, number],
  mode: TransportationMode
): Promise<[number, number][]> {
  // Road profiles cannot provide a bus route or its transfer geometry.
  if (mode === 'transit') return generateCurvedWaypoints(fromCoords, toCoords);
  const cacheKey = `${fromCoords.join(',')}_${toCoords.join(',')}_${mode}`;
  const cached = routeGeometryCache.get(cacheKey);
  if (cached) return cached;
  const pending = pendingGeometries.get(cacheKey);
  if (pending) return pending;

  const request = (async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    try {
      // The prepared server dataset selects the mode; the URL profile alone does not.
      const url = `${ROAD_SERVERS[mode]}/route/v1/driving/${fromCoords[1]},${fromCoords[0]};${toCoords[1]},${toCoords[0]}?overview=full&geometries=geojson`;
      const response = await fetch(url, { signal: controller.signal });
      if (response.ok) {
        const data = await response.json();
        const coordinates: unknown = data?.routes?.[0]?.geometry?.coordinates;
        if (data.code === 'Ok' && Array.isArray(coordinates) && coordinates.length > 1 &&
          coordinates.every(point => Array.isArray(point) && point.length >= 2 &&
            Number.isFinite(point[0]) && Math.abs(point[0]) <= 180 &&
            Number.isFinite(point[1]) && Math.abs(point[1]) <= 90)) {
          const result: [number, number][] = coordinates.map(point => [point[1], point[0]]);
          if (routeGeometryCache.size >= 200) routeGeometryCache.delete(routeGeometryCache.keys().next().value!);
          routeGeometryCache.set(cacheKey, result);
          return result;
        }
      }
    } catch {
      // Offline and timeout fallback stays local and is never cached as a real road.
    } finally {
      clearTimeout(timeoutId);
    }
    return generateCurvedWaypoints(fromCoords, toCoords);
  })();
  pendingGeometries.set(cacheKey, request);
  try { return await request; }
  finally { pendingGeometries.delete(cacheKey); }
}
