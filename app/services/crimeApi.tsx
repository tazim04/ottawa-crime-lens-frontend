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

export async function getGridStatsById(gridId: number, signal?: AbortSignal): Promise<GridStat> {
  const res = await fetch(`${API_BASE_URL}/crime/grid/${gridId}/stats`, { signal });

  if (!res.ok) {
    throw new Error(`Grid stats API failed: ${res.status}`);
  }

  return res.json();
}

export async function getGridStatsByPoint(gridId: number, signal?: AbortSignal): Promise<GridStat> {
  const search = new URLSearchParams({
    gridId: gridId.toString()
  });

  const res = await fetch(`${API_BASE_URL}/crime/grid/stats?${search}`, { signal });

  if (!res.ok) {
    throw new Error(`Grid lookup API failed: ${res.status}`);
  }

  return res.json();
}
