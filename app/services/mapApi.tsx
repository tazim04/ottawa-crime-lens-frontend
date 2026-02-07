import type { MapDataRequestParams } from '~/types/map';
import type { MapDataResponse } from '~/types/map';
import { API_BASE_URL } from '~/config/env';

/**
 * This file contains client-side functions to interact APIs that return map data (Grid and Points).
 */
export async function getMapData(
  params: MapDataRequestParams,
  signal?: AbortSignal
): Promise<MapDataResponse> {
  const search = new URLSearchParams({
    minLon: params.minLon.toString(),
    minLat: params.minLat.toString(),
    maxLon: params.maxLon.toString(),
    maxLat: params.maxLat.toString(),
    zoom: params.zoom.toString(),
  });

  if (params.startDate) search.set('startDate', params.startDate);
  if (params.endDate) search.set('endDate', params.endDate);
  if (params.offenceCategory) search.set('category', params.offenceCategory);

  console.log('Fetching map data with params:', search.toString());

  const res = await fetch(`${API_BASE_URL}/map/data?${search}`, { signal });

  if (!res.ok) {
    throw new Error(`Map API failed: ${res.status}`);
  }

  return res.json();
}
