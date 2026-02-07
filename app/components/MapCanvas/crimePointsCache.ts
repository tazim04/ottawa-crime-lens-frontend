import type { FeatureCollection, Point } from 'geojson';
import type maplibregl from 'maplibre-gl';
import type { CrimeFilter } from '~/types/filters';

export type CrimePointsCacheKey = string;

// Simple in-memory cache for crime points, keyed by a string that encodes the map viewport and zoom level
export class CrimePointsCache {
  private cache = new Map<CrimePointsCacheKey, FeatureCollection<Point>>();

  constructor(private readonly tileSize: number) {}

  makeKey(bounds: maplibregl.LngLatBounds, zoom: number, filter?: CrimeFilter): CrimePointsCacheKey {
    const center = bounds.getCenter();
    const tileX = Math.floor(center.lng / this.tileSize);
    const tileY = Math.floor(center.lat / this.tileSize);
    const startDate = filter?.dateRange.startDate ?? 'NONE';
    const endDate = filter?.dateRange.endDate ?? 'NONE';
    const category = filter?.category ?? 'ALL';

    return `z:${zoom}|x:${tileX}|y:${tileY}|sd:${startDate}|ed:${endDate}|cat:${category}`;
  }

  get(key: CrimePointsCacheKey) {
    return this.cache.get(key);
  }

  has(key: CrimePointsCacheKey) {
    console.log(
      `[CrimePointsCache] Checking for key: ${key} → ${this.cache.has(key) ? 'HIT' : 'MISS'}`
    );
    return this.cache.has(key);
  }

  set(key: CrimePointsCacheKey, data: FeatureCollection<Point>) {
    console.log(`[CrimePointsCache] Storing data for key: ${key}`);
    this.cache.set(key, data);
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}
