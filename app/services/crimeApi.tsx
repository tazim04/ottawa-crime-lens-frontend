import type { CrimeDetail, GridStat } from '~/types/crime';
import { API_BASE_URL } from '~/config/env';

/**
 * This file contains client-side functions to interact APIs that return crime specific data.
 */

export async function getCrimeDetails(id: number, signal?: AbortSignal): Promise<CrimeDetail> {
  const res = await fetch(`${API_BASE_URL}/crime/${id}`, { signal });

  if (!res.ok) {
    throw new Error(`Crime API failed: ${res.status}`);
  }

  return res.json();
}

export async function getGridCellStats(lat: number, lon: number, signal?: AbortSignal): Promise<GridStat> {
  const search = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString()
  });

  const res = await fetch(`${API_BASE_URL}/crime/grid-stats?${search}`, { signal });

  if (!res.ok) {
    throw new Error(`Crime Grid Stats API failed: ${res.status}`);
  }

  return res.json();
}
