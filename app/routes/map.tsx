import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';
import { useEffect, useRef } from 'react';
import type { GridCell, CrimeMapPoint, MapCrimeRequestParams } from '~/types/map';
import type { FeatureCollection, Point } from 'geojson';
import { getMapData } from '~/services/mapApi';
import type { CrimeDetail } from '~/types/crime';
import { getCrimeDetails } from '~/services/crimeApi';

export default function Map() {
  const mapContainerRef = useRef<HTMLDivElement>(null); // Ref to the map container div
  const mapRef = useRef<maplibregl.Map | null>(null); // Ref to store the map instance
  const mapReadyRef = useRef(false); // Ref to track if the map is ready

  const lastBoundsRef = useRef<maplibregl.LngLatBounds | null>(null); // Ref to store the last known bounds
  const abortRef = useRef<AbortController | null>(null); // Ref to store the abort controller for fetch requests

  const didInitialFetchRef = useRef(false); // Ref to track if the initial fetch has been done

  // Function to fetch map data based on current bounds and zoom
  async function fetchMapData(
    bounds: maplibregl.LngLatBounds,
    zoom: number,
    force: boolean = false
  ) {
    if (!force && lastBoundsRef.current && !boundsChangedEnough(lastBoundsRef.current, bounds)) {
      console.log('Bounds have not changed enough, skipping fetch');
      return;
    }

    lastBoundsRef.current = bounds; // Update last bounds

    // Abort any ongoing request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    const params: MapCrimeRequestParams = {
      minLon: bounds.getWest(),
      minLat: bounds.getSouth(),
      maxLon: bounds.getEast(),
      maxLat: bounds.getNorth(),
      zoom
    };

    console.log('Fetching map data with params:', params);

    // Get response from the client-side API function
    const response = await getMapData(params, abortRef.current.signal);

    const map = mapRef.current;
    if (!map) return;

    // Update map sources based on response type
    if (response.type === 'GRID') {
      getGeoJSONSource(map, 'crime-grids').setData(gridCellsToGeoJSON(response.data));

      map.setLayoutProperty('crime-grid-layer', 'visibility', 'visible');
      map.setLayoutProperty('crime-point-layer', 'visibility', 'none');
    }

    if (response.type === 'POINTS') {
      getGeoJSONSource(map, 'crime-points').setData(crimePointsToGeoJSON(response.data));

      map.setLayoutProperty('crime-grid-layer', 'visibility', 'none');
      map.setLayoutProperty('crime-point-layer', 'visibility', 'visible');
    }
  }

  async function handleCrimeClick(id: number): Promise<CrimeDetail> {
    const details: CrimeDetail = await getCrimeDetails(id);

    // For demonstration, just log the details
    console.log('Crime details:', details);

    return details;
  }

  // -------- Map Initialization --------
  useEffect(() => {
    if (!mapContainerRef.current) return; // Ensure the ref is assigned
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      center: [-75.6972, 45.34], // Ottawa center
      zoom: 10,
      minZoom: 9,
      maxZoom: 18,
      style: {
        version: 8,
        sources: {
          dark: {
            type: 'raster',
            tiles: ['https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'], // OpenStreetMap tile server
            tileSize: 256
          }
        },
        layers: [
          {
            id: 'dark-base',
            type: 'raster',
            source: 'dark'
          }
        ]
      },
      maxBounds: [
        [-76.4, 44.9],
        [-75.0, 45.8]
      ]
    });

    mapRef.current = map;

    map.on('load', () => {
      // Source for crime points (closer zooms)
      map.addSource('crime-points', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      // Source for crime grids (farther zooms)
      map.addSource('crime-grids', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      // GRID LAYER
      map.addLayer({
        id: 'crime-grid-layer',
        type: 'heatmap',
        source: 'crime-grids',
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'crimeCount'],
            0,
            0,
            300,
            0.6,
            800,
            1.2,
            2000,
            2.0
          ],

          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 9, 1.1, 12, 1.7],

          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 9, 55, 11, 65, 13, 75, 15, 85],

          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0.0,
            'rgba(0,0,0,0)',
            0.2,
            '#ffffcc',
            0.4,
            '#ffeda0',
            0.6,
            '#feb24c',
            0.8,
            '#f03b20',
            1.0,
            '#bd0026'
          ],

          'heatmap-opacity': 0.7
        }
      });

      // POINT LAYER
      map.addLayer({
        id: 'crime-point-layer',
        type: 'circle',
        source: 'crime-points',
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10,
            4, // zoom 10 → small
            12,
            6,
            14,
            9,
            16,
            13 // zoom 16 → larger
          ],
          'circle-color': '#ff0000'
        }
      });

      map.on('click', 'crime-point-layer', (e) => {
        if (!e.features || e.features.length === 0) return;

        const feature = e.features[0];

        const props = feature.properties;
        const coords = (feature.geometry as GeoJSON.Point).coordinates;

        console.log('Clicked crime:', props);

        // Example action
        handleCrimeClick(props.id);
      });

      mapReadyRef.current = true; // Mark the map as ready

      // Initial fetch
      fetchMapData(map.getBounds(), Math.floor(map.getZoom()), true);
      didInitialFetchRef.current = true;
    });

    return () => map.remove(); // Clean up on unmount
  }, []);

  // Update crime points data when it changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleViewportChange = () => {
      // Only fetch if the map is ready and initial fetch has been done
      if (!didInitialFetchRef.current) return;

      const bounds = map.getBounds();
      const zoom = Math.floor(map.getZoom());

      fetchMapData(bounds, zoom);
    };

    map.on('moveend', handleViewportChange);
    map.on('zoomend', handleViewportChange);

    return () => {
      map.off('moveend', handleViewportChange);
      map.off('zoomend', handleViewportChange);
    };
  }, []);

  return <div ref={mapContainerRef} style={{ width: '100vw', height: '100vh' }} />;
}

// Utils

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

function gridCellsToGeoJSON(cells: GridCell[]): FeatureCollection<Point> {
  return {
    type: 'FeatureCollection',
    features: cells.map((c) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [c.lon, c.lat]
      },
      properties: {
        crimeCount: c.crimeCount
      }
    }))
  };
}

function getGeoJSONSource(map: maplibregl.Map, id: string): maplibregl.GeoJSONSource {
  const source = map.getSource(id);
  if (!source) {
    throw new Error(`Source ${id} not found`);
  }
  return source as maplibregl.GeoJSONSource;
}

// Utility to determine if bounds have changed enough to warrant a new fetch
function boundsChangedEnough(prev: maplibregl.LngLatBounds | null, next: maplibregl.LngLatBounds) {
  if (!prev) return true; // Always fetch if no previous bounds

  const threshold = 0.15; // 15% change threshold
  const lngSpan = next.getEast() - next.getWest();
  const latSpan = next.getNorth() - next.getSouth();

  return (
    Math.abs(next.getWest() - prev.getWest()) > lngSpan * threshold ||
    Math.abs(next.getSouth() - prev.getSouth()) > latSpan * threshold
  );
}
