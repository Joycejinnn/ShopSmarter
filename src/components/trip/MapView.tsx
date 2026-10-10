import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ShoppingPlan, TripContext, Store } from '../../types';
import { DEMO_STORES } from '../../data/stores';

interface MapViewProps {
  plan: ShoppingPlan;
  tripContext: TripContext;
  onSelectStore?: (store: Store) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  plan,
  tripContext,
  onSelectStore
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center between Chapel Hill and Durham
    const map = L.map(mapContainerRef.current, {
      center: [35.945, -78.995],
      zoom: 12,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Shopsmarter Demo',
      maxZoom: 18
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    const observer = new ResizeObserver(() => { map.invalidateSize(); });
    observer.observe(mapContainerRef.current);
    return () => {
      observer.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Layers & Route
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const bounds = L.latLngBounds([]);

    // 1. Add Origin Marker
    const originCoords: [number, number] = [tripContext.origin.lat, tripContext.origin.lng];
    bounds.extend(originCoords);

    const originIcon = L.divIcon({
      className: '',
      html: `
        <div style="background-color: #2D6A4F; color: white; border-radius: 9999px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid white;">
          S
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const originMarker = L.marker(originCoords, { icon: originIcon }).addTo(layerGroup);
    originMarker.bindPopup(`
      <div style="font-family: inherit; font-size: 12px; line-height: 1.4;">
        <strong style="color: #1B4332;">Starting Point</strong><br/>
        <span>${tripContext.origin.label}</span><br/>
        <small style="color: #6C757D;">Mode: ${tripContext.transportMode}</small>
      </div>
    `);

    // 2. Add Store Markers
    const visitedStoreIds = new Set(plan.routeStops.map((s) => s.id));

    DEMO_STORES.forEach((store) => {
      const isVisited = visitedStoreIds.has(store.id);
      const isExcluded = tripContext.excludedStoreIds.includes(store.id);
      const stopIndex = plan.routeStops.findIndex((s) => s.id === store.id);

      const storeCoords: [number, number] = [store.lat, store.lng];
      if (isVisited) {
        bounds.extend(storeCoords);
      }

      const alloc = plan.storeAllocations.find((a) => a.store.id === store.id);

      const iconBg = isVisited ? store.color : isExcluded ? '#9CA3AF' : '#6C757D';
      const iconText = isVisited ? `${stopIndex + 1}` : '•';
      const iconOpacity = isExcluded ? '0.5' : '1.0';

      const storeIcon = L.divIcon({
        className: '',
        html: `
          <div style="background-color: ${iconBg}; color: white; border-radius: 9999px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; box-shadow: 0 3px 8px rgba(0,0,0,0.25); border: 2px solid white; opacity: ${iconOpacity};">
            ${iconText}
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const marker = L.marker(storeCoords, { icon: storeIcon }).addTo(layerGroup);

      const popupContent = `
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4; min-width: 160px;">
          <strong style="color: #1B4332; font-size: 13px;">${store.name}</strong><br/>
          <span style="color: #6C757D; font-size: 11px;">${store.address}</span><br/>
          <hr style="margin: 6px 0; border: none; border-top: 1px solid #E8E2D8;"/>
          ${
            isVisited && alloc
              ? `<div style="color: #2D6A4F; font-weight: 700;">Stop #${stopIndex + 1} in Route</div>
                 <div>Assigned: <strong>${alloc.items.length} items</strong></div>
                 <div>Subtotal: <strong>$${alloc.subtotalCost.toFixed(2)}</strong></div>
                 <div style="font-size: 10px; color: #888;">Weight: ${alloc.totalWeightKg.toFixed(1)} kg</div>`
              : isExcluded
              ? `<div style="color: #DC2626; font-weight: 600;">Excluded by user</div>`
              : `<div style="color: #6C757D;">Not selected for this trip</div>`
          }
        </div>
      `;

      marker.bindPopup(popupContent);

      if (isVisited) {
        marker.on('click', () => {
          if (onSelectStore) onSelectStore(store);
        });
      }
    });

    // 3. Draw Route Polylines
    if (plan.routeSegments && plan.routeSegments.length > 0) {
      plan.routeSegments.forEach((segment, idx) => {
        const polylineColor =
          tripContext.transportMode === 'walking'
            ? '#2D6A4F'
            : tripContext.transportMode === 'transit'
            ? '#3B82F6'
            : tripContext.transportMode === 'cycling'
            ? '#10B981'
            : '#E76F51';

        const polyline = L.polyline(segment.geometry, {
          color: polylineColor,
          weight: 4,
          opacity: 0.85,
          dashArray: tripContext.transportMode === 'walking' ? '6, 8' : undefined
        }).addTo(layerGroup);

        segment.geometry.forEach((pt) => bounds.extend(pt));

        polyline.bindTooltip(
          `Leg ${idx + 1}: ${segment.fromName} → ${segment.toName} (${segment.durationMinutes} min, ${(segment.distanceMeters / 1000).toFixed(1)} km)`,
          { sticky: true }
        );
      });
    }

    // Fit map bounds
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [plan, tripContext, onSelectStore]);

  return (
    <div className="relative isolate w-full h-[320px] sm:h-[400px] lg:h-[480px] rounded-2xl overflow-hidden border border-brand-border shadow-card">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-7 left-3 z-[20] bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl border border-brand-border shadow-soft text-[11px] space-y-1">
        <div className="font-bold text-brand-darkgreen flex items-center gap-1.5">
          <span>Chapel Hill / Durham Route</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-brand-subtle text-brand-muted">
            Simulated Graph
          </span>
        </div>
        <div className="flex items-center gap-3 text-stone-600">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-primary"></span>
            <span>Origin</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-emerald"></span>
            <span>Stops</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-400"></span>
            <span>Other Stores</span>
          </div>
        </div>
      </div>
    </div>
  );
};
