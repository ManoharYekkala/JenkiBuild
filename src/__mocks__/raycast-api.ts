// Mock for @raycast/api — used by vitest to prevent resolution failures
// fetchJobTree is not tested in unit tests; only pure functions are tested.
export function getPreferenceValues<T>(): T {
  return {} as T;
}
