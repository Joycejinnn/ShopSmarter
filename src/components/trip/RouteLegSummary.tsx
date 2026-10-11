import React from 'react';
import { RouteSegment } from '../../types';

export function RouteLegSummary({ segment }: { segment?: RouteSegment }) {
  if (!segment) return null;
  if (segment.transitUnavailable) return <span>No transit connection found</span>;
  if (segment.walkingRecommendation) return <div className="text-brand-primary">
    <span className="font-semibold">Walking recommended · {segment.durationMinutes} min estimated</span>
    <div>{segment.comparedTransitMinutes !== undefined
      ? `Transit would take about ${segment.comparedTransitMinutes} min including walking and waiting.`
      : segment.walkingRecommendation}</div>
  </div>;
  if (segment.transportMode !== 'transit') return <span>{segment.durationMinutes} min ({segment.transportMode}, estimated)</span>;
  return <div className="flex flex-col gap-0.5">
    <span className="font-semibold text-blue-700">{segment.transitRouteName || 'Transit'} · {segment.durationMinutes} min estimated
      {segment.transitFare !== undefined && ` · estimated fare $${segment.transitFare.toFixed(2)}`}
    </span>
    {segment.boardingStop && <span>Board: {segment.boardingStop}</span>}
    {segment.transferStop && <span className="text-amber-700">Transfer at {segment.transferStop}</span>}
    {segment.debarkingStop && <span>Get off: {segment.debarkingStop}</span>}
    <span>Walk to stop: {segment.firstMileWalkMinutes ?? 0} min · Walk to destination: {segment.lastMileWalkMinutes ?? 0} min</span>
  </div>;
}
