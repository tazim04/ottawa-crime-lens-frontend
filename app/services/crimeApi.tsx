import type { CrimeDetail } from '~/types/crime';
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
