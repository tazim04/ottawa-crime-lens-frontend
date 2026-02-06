import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';
import { useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';
import type { MapDataRequestParams, MapDataType } from '~/types/map';
import {
  crimePointsToGeoJSON,
  gridCellsToGeoJSON,
  getGeoJSONSource,
  mergeGridGeoJSON
} from './MapGeoJson';
import type { FeatureCollection, Point } from 'geojson';
import { CrimePointsCache } from './crimePointsCache';

import { getMapData } from '~/services/mapApi';
import type { CrimeDateFilter } from '~/types/filters';

export type MapCanvasRef = {
  flyTo: (lat: number, lon: number, zoom?: number) => void;
};

type MapCanvasProps = {
  onCrimeClick: (id: number, lat: number, lon: number) => void;
  onGridClick: (gridId: number, lat: number, lon: number) => void;
  selectedCrimeId: number | null;
  selectedGridId: number | null;
  dateFilter?: CrimeDateFilter;
  onModeChange?: (mode: MapDataType) => void;
};

const MapCanvas = forwardRef<MapCanvasRef, MapCanvasProps>(
  (
    { onCrimeClick, onGridClick, selectedCrimeId, selectedGridId, dateFilter, onModeChange },
    ref
  ) => {
    const GRID_COLOURS = {
      veryLow: '#052e16',
      low: '#22c55e',
      medium: '#a3e635',
      high: '#facc15',
      veryHigh: '#f97316',
      extreme: '#dc2626'
    };

    const POINTS_MODE_ZOOM = 12;

    const TILE_SIZE = 0.01; // ~1.1km latitude, for simple grid tiling in cache keys
    const crimePointCacheRef = useRef(new CrimePointsCache(TILE_SIZE)); // Cache instance for crime points

    const mapContainerRef = useRef<HTMLDivElement>(null); // Ref to the map container div
    const mapRef = useRef<maplibregl.Map | null>(null); // Ref to store the map instance
    const mapReadyRef = useRef(false); // Ref to track if the map is ready
    const didInitialFetchRef = useRef(false); // Ref to track if the initial fetch has been done
    const lastGridGeoJsonRef = useRef<FeatureCollection<Point> | null>(null); // Ref to store last grid GeoJSON
    const isProgrammaticFetchRef = useRef(false); // Ref to avoid fetch loops on programmatic moves
    const currentModeRef = useRef<MapDataType | null>(null); // Ref to track current map mode (GRID or POINTS)

    // Expose flyTo method to parent components - allows external control of the map
    useImperativeHandle(ref, () => ({
      flyTo(lat: number, lon: number, zoom = 14) {
        const map = mapRef.current;
        if (!map) return;

        map.flyTo({
          center: [lon, lat],
          zoom,
          essential: true
        });
      }
    }));

    // Helper to determine current map mode based on zoom level
    function getMapMode(zoom: number): MapDataType {
      return zoom >= POINTS_MODE_ZOOM ? 'POINTS' : 'GRID';
    }

    // Function to fetch map data based on current bounds and zoom
    const fetchMapData = useCallback(
      async (bounds: maplibregl.LngLatBounds, zoom: number) => {
        const map = mapRef.current;
        if (!map) return;

        const mode = getMapMode(zoom);
        const cache = crimePointCacheRef.current;

        // ---------- POINTS CACHE SHORT-CIRCUIT ----------
        if (mode === 'POINTS') {
          const cacheKey = crimePointCacheRef.current.makeKey(bounds, zoom);

          if (cache.has(cacheKey)) {
            const cached = cache.get(cacheKey)!;
            getGeoJSONSource(map, 'crime-points').setData(cached);

            map.setLayoutProperty('crime-grid-layer', 'visibility', 'none');
            map.setLayoutProperty('crime-point-layer', 'visibility', 'visible');
            map.setLayoutProperty('crime-grid-highlight', 'visibility', 'none');

            return; // NO BACKEND CALL
          }
        }

        // ---------- BACKEND FETCH (no cache, write to cache) ----------
        isProgrammaticFetchRef.current = true;

        const params: MapDataRequestParams = {
          minLon: bounds.getWest(),
          minLat: bounds.getSouth(),
          maxLon: bounds.getEast(),
          maxLat: bounds.getNorth(),
          zoom
        };

        if (dateFilter?.startDate) params.startDate = dateFilter.startDate;
        if (dateFilter?.endDate) params.endDate = dateFilter.endDate;

        const response = await getMapData(params);

        isProgrammaticFetchRef.current = false;

        // ---------- HANDLE RESPONSE ----------
        if (response.type === 'POINTS') {
          const cacheKey = cache.makeKey(bounds, zoom);
          const geojson = crimePointsToGeoJSON(response.data);

          cache.set(cacheKey, geojson); // Write to cache

          getGeoJSONSource(map, 'crime-points').setData(geojson);

          map.setLayoutProperty('crime-grid-layer', 'visibility', 'none');
          map.setLayoutProperty('crime-point-layer', 'visibility', 'visible');
          map.setLayoutProperty('crime-grid-highlight', 'visibility', 'none');
        }

        if (response.type === 'GRID') {
          const incomingGeojson = gridCellsToGeoJSON(response.data);
          const merged = mergeGridGeoJSON(lastGridGeoJsonRef.current, incomingGeojson);

          lastGridGeoJsonRef.current = merged;
          getGeoJSONSource(map, 'crime-grids').setData(merged);

          map.setLayoutProperty('crime-grid-layer', 'visibility', 'visible');
          map.setLayoutProperty('crime-grid-highlight', 'visibility', 'visible');
          map.setLayoutProperty('crime-point-layer', 'visibility', 'none');
        }
      },
      [dateFilter]
    );

    // Function to fetch map data for the current viewport
    const fetchForCurrentViewport = useCallback(() => {
      const map = mapRef.current;
      if (!map || !mapReadyRef.current) return;

      const bounds = map.getBounds();
      const zoom = Math.floor(map.getZoom());

      fetchMapData(bounds, zoom);
    }, [fetchMapData]);

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
        // ----------- DATA SOURCES -----------
        // Source for crime points (closer zooms)
        map.addSource('crime-points', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        });

        // Source for crime grids (farther zooms)
        map.addSource('crime-grids', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
          promoteId: 'id' // Use 'id' property for feature IDs
        });

        // ----------- DATA LAYERS -----------
        // GRID LAYER
        map.addLayer({
          id: 'crime-grid-layer',
          type: 'circle',
          source: 'crime-grids',
          paint: {
            // Fixed, intentional sizing (grid-like)
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              9,
              7,
              10,
              8,
              11,
              12,
              12,
              14,
              13,
              16,
              18,
              16
            ],

            'circle-color': [
              'step',
              ['get', 'crimeCount'],
              GRID_COLOURS.veryLow, // 0
              50,
              GRID_COLOURS.low, // low
              150,
              GRID_COLOURS.medium, // moderate
              400,
              GRID_COLOURS.high, // elevated
              800,
              GRID_COLOURS.veryHigh, // high
              1500,
              GRID_COLOURS.extreme // critical
            ],

            // Solid, confident presence
            'circle-opacity': 0.9,

            // NO blur — sharp edges
            'circle-blur': 0,

            // Optional: subtle stroke for clarity
            'circle-stroke-width': 1,
            'circle-stroke-color': '#000000'
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
            'circle-color': '#ff0000',
            'circle-opacity': 0.8
          }
        });

        // ----------- HIGHLIGHT LAYERS -----------
        map.addLayer({
          id: 'crime-point-highlight',
          type: 'circle',
          source: 'crime-points',
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 8, 14, 14, 16, 18],
            'circle-color': '#ffffff',
            'circle-opacity': 0.9,
            'circle-stroke-width': 3,
            'circle-stroke-color': '#ef4444' // Tailwind red-500
          },
          filter: ['==', ['id'], -1] // nothing selected initially
        });

        map.addLayer(
          {
            id: 'crime-grid-highlight',
            type: 'circle',
            source: 'crime-grids',
            paint: {
              'circle-radius': ['interpolate', ['linear'], ['zoom'], 9, 9, 11, 13, 13, 17],
              'circle-color': 'rgba(0,0,0,0)',
              'circle-stroke-width': 3,
              'circle-stroke-color': '#ffffff',
              'circle-opacity': 1
            },
            filter: ['==', ['id'], -1]
          },
          'crime-point-layer'
        );

        // ----------- INTERACTIONS -----------
        map.on('mouseenter', 'crime-point-layer', () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'crime-point-layer', () => {
          map.getCanvas().style.cursor = '';
        });

        map.on('mouseenter', 'crime-grid-layer', () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'crime-grid-layer', () => {
          map.getCanvas().style.cursor = '';
        });

        map.on('click', 'crime-point-layer', (e) => {
          if (!e.features || e.features.length === 0) return;

          const feature = e.features[0];
          if (!feature) return;

          const crimeId = feature.properties!.id;
          const [lon, lat] = (feature.geometry as GeoJSON.Point).coordinates;
          onCrimeClick(feature.properties!.id, lat, lon);

          // Highlight crime
          map.setFilter('crime-point-highlight', ['==', ['get', 'id'], crimeId]);

          // Clear grid highlight
          map.setFilter('crime-grid-highlight', ['==', ['id'], -1]);
        });

        map.on('click', 'crime-grid-layer', (e) => {
          if (!e.features || e.features.length === 0) return;

          const feature = e.features[0];
          if (!feature) return;
          if (!feature.id) return;

          const [lon, lat] = (feature.geometry as GeoJSON.Point).coordinates;
          onGridClick(feature.id as number, lat, lon);

          // Highlight grid
          map.setFilter('crime-grid-highlight', ['==', ['id'], feature.id]);

          // Clear crime highlight
          map.setFilter('crime-point-highlight', ['==', ['get', 'id'], -1]);
        });

        mapReadyRef.current = true; // Mark the map as ready

        // Initial fetch
        fetchForCurrentViewport();
        didInitialFetchRef.current = true;
      });

      return () => map.remove(); // Clean up on unmount
    }, []);

    // Update crime points data when viewport changes (move or zoom)
    useEffect(() => {
      const map = mapRef.current;
      if (!map) return;

      const handleViewportChange = () => {
        // Ignore if initial fetch not done or if programmatic fetch
        if (!didInitialFetchRef.current) return;
        if (isProgrammaticFetchRef.current) return;

        // Determine current zoom mode
        const zoom = Math.floor(map.getZoom());
        const nextMode = getMapMode(zoom);

        // If mode changed, notify parent and update current mode
        if (currentModeRef.current !== nextMode) {
          currentModeRef.current = nextMode;
          onModeChange?.(nextMode);
        }

        fetchForCurrentViewport();
      };

      map.on('moveend', handleViewportChange);
      map.on('zoomend', handleViewportChange);

      return () => {
        map.off('moveend', handleViewportChange);
        map.off('zoomend', handleViewportChange);
      };
    }, [fetchForCurrentViewport]);

    // Date filter change effect
    useEffect(() => {
      crimePointCacheRef.current.clear(); // Clear cache when date filter changes

      const map = mapRef.current;
      if (!map || !mapReadyRef.current || !didInitialFetchRef.current) return;

      const zoom = Math.floor(map.getZoom());

      // Only refetch if we're in POINTS mode
      if (getMapMode(zoom) !== 'POINTS') return;

      const bounds = map.getBounds();
      fetchMapData(bounds, zoom);
    }, [dateFilter, fetchMapData]);

    // Clear highlights when clear selection
    useEffect(() => {
      const map = mapRef.current;
      if (!map || !mapReadyRef.current) return;

      // Clear highlights when selection is cleared
      if (selectedCrimeId === null) {
        map.setFilter('crime-point-highlight', ['==', ['get', 'id'], -1]);
      }

      // Clear grid highlight when selection is cleared
      if (selectedGridId === null) {
        map.setFilter('crime-grid-highlight', ['==', ['id'], -1]);
      }
    }, [selectedCrimeId, selectedGridId]);

    // Update grid highlight when selectedGridId changes
    useEffect(() => {
      const map = mapRef.current;
      if (!map || !mapReadyRef.current) return;

      const gridVisible = map.getLayoutProperty('crime-grid-layer', 'visibility') === 'visible';

      if (!gridVisible) return;

      map.setFilter('crime-grid-highlight', ['==', ['id'], selectedGridId ?? -1]);
    }, [selectedGridId]);

    return <div ref={mapContainerRef} style={{ width: '100vw', height: '100vh' }} />;
  }
);

export default MapCanvas;
