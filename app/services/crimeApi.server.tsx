import { API_BASE_URL } from '~/config/env.server';
import type { MapCrimeRequestParams, CrimeMapPoint } from '~/types/crime';

/**
 * This file contains functions to interact with the crime API.
 */

/**
 * Call the crime API to get crime points for the map.
 * @param params: MapCrimeRequestParams
 * @returns Promise<CrimeMapPoint[]>
 */
export async function getMapData(params: MapCrimeRequestParams): Promise<CrimeMapPoint[]> {
  const searchParams = buildSearchParams(params);

  const res = await fetch(`${API_BASE_URL}/map/data?${searchParams.toString()}`);

  if (!res.ok) {
    throw new Response('Failed to load crime map points', { status: res.status });
  }

  return res.json() as Promise<CrimeMapPoint[]>;
}

/**
 * Util function to help build query parameters.
 * @param params: MapCrimeRequestParams
 * @returns URLSearchParams
 */
export function buildSearchParams(params: MapCrimeRequestParams): URLSearchParams {
  const search = new URLSearchParams();

  search.set('minLon', params.minLon.toString());
  search.set('minLat', params.minLat.toString());
  search.set('maxLon', params.maxLon.toString());
  search.set('maxLat', params.maxLat.toString());
  search.set('zoom', params.zoom.toString());

  if (params.startDate) {
    search.set('startDate', params.startDate);
  }

  if (params.endDate) {
    search.set('endDate', params.endDate);
  }

  return search;
}
