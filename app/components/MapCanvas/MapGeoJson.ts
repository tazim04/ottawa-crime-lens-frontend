// ---------- Helper Functions --------

import type { CrimeMapPoint, GridCell } from '~/types/map';
import type { FeatureCollection, Point } from 'geojson';

export function crimePointsToGeoJSON(points: CrimeMapPoint[]): FeatureCollection<Point> {
  return {
    type: 'FeatureCollection',
    features: points.map((p) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [p.lon, p.lat]
      },
      properties: {
        id: p.id,
        category: p.category,
        occurredDate: p.occurredDate
      }
    }))
  };
}

export function gridCellsToGeoJSON(cells: GridCell[]): FeatureCollection<Point> {
  console.log('Grid cells from backend:', cells);
  return {
    type: 'FeatureCollection',
    features: cells.map((c) => ({
      type: 'Feature',
      id: c.id,
      geometry: {
        type: 'Point',
        coordinates: [c.lon, c.lat]
      },
      properties: {
        id: c.id,
        crimeCount: c.crimeCount
      }
    }))
  };
}

export function getGeoJSONSource(map: maplibregl.Map, id: string): maplibregl.GeoJSONSource {
  const source = map.getSource(id);
  if (!source) {
    throw new Error(`Source ${id} not found`);
  }
  return source as maplibregl.GeoJSONSource;
}
