/** Retry once at normal accuracy when the initial high-accuracy fix is unavailable. */
export function requestPositionWithFallback(
  geolocation: Pick<Geolocation, 'getCurrentPosition'>,
  onSuccess: PositionCallback,
  onError: PositionErrorCallback,
  onRetry: () => void
): void {
  geolocation.getCurrentPosition(onSuccess, error => {
    // Permission denial will not be resolved by changing accuracy.
    if (error.code !== 2 && error.code !== 3) {
      onError(error);
      return;
    }
    onRetry();
    geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: false,
      timeout: 20000,
      maximumAge: 60000
    });
  }, {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000
  });
}
