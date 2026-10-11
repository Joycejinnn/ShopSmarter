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

  // Add transit waiting/transfer time (e.g. 6-10 mins)
  if (mode === 'transit' && distanceMeters > 500) {
    durationMinutes += 8;
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
    geometry
  };
}
