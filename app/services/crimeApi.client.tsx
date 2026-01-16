import type { MapCrimeRequestParams, CrimeMapPoint, MapDataResponse } from '~/types/crime';

// This file contains client-side functions to interact with the crime API.
// These functions use relative URLs and rely on Vite's proxy during development.
// Can be used in React components.
export async function getMapDataClient(
  params: MapCrimeRequestParams,
  signal?: AbortSignal
): Promise<MapDataResponse> {
  const search = new URLSearchParams();

  search.set('minLon', params.minLon.toString());
  search.set('minLat', params.minLat.toString());
  search.set('maxLon', params.maxLon.toString());
  search.set('maxLat', params.maxLat.toString());
  search.set('zoom', params.zoom.toString());

  if (params.startDate) search.set('startDate', params.startDate);
  if (params.endDate) search.set('endDate', params.endDate);

  const res = await fetch(`/api/map/data?${search.toString()}`, {
    signal
  });

  if (!res.ok) {
    throw new Error('Failed to load crime map points');
  }

  return res.json();
}
