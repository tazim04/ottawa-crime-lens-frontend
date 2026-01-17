import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';
import { useEffect, useRef } from 'react';
import type { GridCell, CrimeMapPoint, MapDataRequestParams } from '~/types/map';
import type { FeatureCollection, Point } from 'geojson';
import { getMapData } from '~/services/mapApi';

type MapCanvasProps = {
  onCrimeClick: (id: number, lat: number, lon: number) => void;
  onGridClick: (lat: number, lon: number) => void;
};

export default function MapCanvas({ onCrimeClick, onGridClick }: MapCanvasProps) {
  const GRID_COLOURS = {
    veryLow: '#052e16',
    low: '#22c55e',
    medium: '#a3e635',
    high: '#facc15',
    veryHigh: '#f97316',
    extreme: '#dc2626'
  };

  const mapContainerRef = useRef<HTMLDivElement>(null); // Ref to the map container div
  const mapRef = useRef<maplibregl.Map | null>(null); // Ref to store the map instance
  const mapReadyRef = useRef(false); // Ref to track if the map is ready
  const didInitialFetchRef = useRef(false); // Ref to track if the initial fetch has been done
  const lastGridGeoJsonRef = useRef<FeatureCollection<Point> | null>(null); // Ref to store last grid GeoJSON

  // Function to fetch map data based on current bounds and zoom
  async function fetchMapData(bounds: maplibregl.LngLatBounds, zoom: number, force = false) {
    const params: MapDataRequestParams = {
      minLon: bounds.getWest(),
      minLat: bounds.getSouth(),
      maxLon: bounds.getEast(),
      maxLat: bounds.getNorth(),
      zoom
    };

    const response = await getMapData(params);

    const map = mapRef.current;
    if (!map) return;

    if (response.type === 'GRID') {
      const geojson = gridCellsToGeoJSON(response.data);

      lastGridGeoJsonRef.current = geojson;

      getGeoJSONSource(map, 'crime-grids').setData(geojson);

      map.setLayoutProperty('crime-grid-layer', 'visibility', 'visible');
      map.setLayoutProperty('crime-point-layer', 'visibility', 'none');
    }

    if (response.type === 'POINTS') {
      getGeoJSONSource(map, 'crime-points').setData(crimePointsToGeoJSON(response.data));

      map.setLayoutProperty('crime-grid-layer', 'visibility', 'none');
      map.setLayoutProperty('crime-point-layer', 'visibility', 'visible');

      // Clear Grid highlight
      map.setFilter('crime-grid-highlight', ['==', ['id'], -1]);
    }
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
        map.setFilter('crime-grid-highlight', ['==', ['get', 'id'], -1]);
      });

      map.on('click', 'crime-grid-layer', (e) => {
        if (!e.features || e.features.length === 0) return;

        const feature = e.features[0];
        console.log('Grid feature clicked:', feature);
        if (!feature) return;
        if (!feature.id) return;

        const [lon, lat] = (feature.geometry as GeoJSON.Point).coordinates;
        onGridClick(lat, lon);

        console.log('Grid clicked:', feature.id);

        // Highlight grid
        map.setFilter('crime-grid-highlight', ['==', ['id'], feature.id]);

        // Clear crime highlight
        map.setFilter('crime-point-highlight', ['==', ['id'], -1]);
      });

      map.on('zoom', () => {
        const map = mapRef.current;
        if (!map) return;

        const geojson = lastGridGeoJsonRef.current;
        if (!geojson) return;
        getGeoJSONSource(map, 'crime-grids').setData(geojson);
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

// ---------- Helper Functions --------

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

function getGeoJSONSource(map: maplibregl.Map, id: string): maplibregl.GeoJSONSource {
  const source = map.getSource(id);
  if (!source) {
    throw new Error(`Source ${id} not found`);
  }
  return source as maplibregl.GeoJSONSource;
}
