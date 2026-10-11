import { describe, expect, it, vi } from 'vitest';
import { requestPositionWithFallback } from '../services/browserLocation';

const locationError = (code: number): GeolocationPositionError => ({ code, message: 'test', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 });
const position: GeolocationPosition = {
  timestamp: 0, toJSON: () => ({}), coords: { latitude: 35.91, longitude: -79.05, accuracy: 500,
    altitude: null, altitudeAccuracy: null, heading: null, speed: null, toJSON: () => ({}) }
};
describe('Browser location accuracy fallback', () => {
  it('uses only one request when high accuracy succeeds', () => {
    const getCurrentPosition = vi.fn<Geolocation['getCurrentPosition']>((success) => success(position));
    const success = vi.fn(), failure = vi.fn(), retry = vi.fn();
    requestPositionWithFallback({ getCurrentPosition }, success, failure, retry);
    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
    expect(getCurrentPosition.mock.calls[0][2]?.enableHighAccuracy).toBe(true);
    expect(success).toHaveBeenCalledWith(position);
    expect(retry).not.toHaveBeenCalled();
  });
  it.each([2, 3])('retries error %s at normal accuracy and accepts the result', code => {
    const getCurrentPosition = vi.fn<Geolocation['getCurrentPosition']>()
      .mockImplementationOnce((_success, failure) => failure?.(locationError(code)))
      .mockImplementationOnce(success => success(position));
    const success = vi.fn(), failure = vi.fn(), retry = vi.fn();
    requestPositionWithFallback({ getCurrentPosition }, success, failure, retry);
    expect(getCurrentPosition).toHaveBeenCalledTimes(2);
    expect(getCurrentPosition.mock.calls[1][2]).toEqual({ enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 });
    expect(retry).toHaveBeenCalledTimes(1);
    expect(success).toHaveBeenCalledWith(position);
    expect(failure).not.toHaveBeenCalled();
  });
  it('does not retry permission denial', () => {
    const getCurrentPosition = vi.fn<Geolocation['getCurrentPosition']>((_success, failure) => failure?.(locationError(1)));
    const success = vi.fn(), failure = vi.fn(), retry = vi.fn();
    requestPositionWithFallback({ getCurrentPosition }, success, failure, retry);
    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
    expect(retry).not.toHaveBeenCalled();
    expect(failure).toHaveBeenCalledWith(locationError(1));
  });
  it('stops after the second failure', () => {
    const getCurrentPosition = vi.fn<Geolocation['getCurrentPosition']>((_success, failure) => failure?.(locationError(3)));
    const failure = vi.fn();
    requestPositionWithFallback({ getCurrentPosition }, vi.fn(), failure, vi.fn());
    expect(getCurrentPosition).toHaveBeenCalledTimes(2);
    expect(failure).toHaveBeenCalledTimes(1);
  });
});
