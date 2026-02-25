import { useState, useRef, useMemo, useCallback } from 'react';
import type { Route } from './+types/map';
import CrimeDetailsPanel from '~/components/panels/CrimeDetailsPanel/CrimeDetailsPanel';
import GridStatsPanel from '~/components/panels/GridStatsPanel/GridStatsPanel';
import { getCrimeDetails, getGridStatsByPoint, getGridStatsById } from '~/services/crimeApi';
import { ClosePanelsButton } from '~/components/panels/ClosePanelsButton';
import { useQuery } from '@tanstack/react-query';
import SourceCodeDropdown from '~/components/SourceCodeDropdown/SourceCodeDropdown';
import MapCanvas from '~/components/MapCanvas/MapCanvas';
import type { MapCanvasRef } from '~/components/MapCanvas/MapCanvas';
import AddressSearchBar from '~/components/AddressSearchBar/AddressSerachBar';
import CrimeFilter from '~/components/filter/CrimeFilter';
import type { CrimeFilter as CrimeFilterModel } from '~/types/filters';
import type { CrimeDetail, GridStat } from '~/types/crime';
import type { MapDataType } from '~/types/map';
import { MobileBottomSheet } from '~/components/panels/MobileBottomSheet';

export function meta(_: Route.MetaArgs) {
  return [
    { title: 'Ottawa CrimeLens' },
    { name: 'description', content: 'Explore crime data visualized on a map of Ottawa.' }
  ];
}

export default function Map() {
  // Selection state can be one of: no selection, crime selected, or grid cell selected
  type Selection =
    | { type: 'NONE' }
    | { type: 'CRIME'; crimeId: number; lat: number; lon: number }
    | { type: 'GRID'; gridId: number };

  const [selection, setSelection] = useState<Selection>({ type: 'NONE' });
  const [mapMode, setMapMode] = useState<MapDataType>('GRID');

  // Store the raw date filter state
  const [crimeFilter, setCrimeFilter] = useState<CrimeFilterModel>({
    dateRange: {
      startDate: null,
      endDate: null
    },
    category: null
  });

  // Memoize the dateFilter object - only creates new object when dates actually change
  const memoizedCrimeFilter = useMemo<CrimeFilterModel>(
    () => ({
      dateRange: {
        startDate: crimeFilter.dateRange.startDate,
        endDate: crimeFilter.dateRange.endDate
      },
      category: crimeFilter.category
    }),
    [crimeFilter.dateRange.startDate, crimeFilter.dateRange.endDate, crimeFilter.category]
  );

  // Memoize the filter change handler
  const handleFilterChange = useCallback((filters: { filter: CrimeFilterModel }) => {
    console.log('Map: Filter changed:', filters);
    setCrimeFilter(filters.filter);
  }, []);

  const mapRef = useRef<MapCanvasRef>(null);

  // ----- Crime details -----
  const crimeQuery = useQuery<CrimeDetail>({
    queryKey: ['crimeDetail', selection.type === 'CRIME' ? selection.crimeId : null],
    queryFn: () => {
      if (selection.type !== 'CRIME') {
        throw new Error('Crime query called without CRIME selection');
      }
      return getCrimeDetails(selection.crimeId);
    },
    enabled: selection.type === 'CRIME',
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60
  });

  // ----- Grid stats (by ID) -----
  const gridStatsQuery = useQuery<GridStat>({
    queryKey: [
      'gridStats',
      selection.type === 'GRID'
        ? `grid:${selection.gridId}`
        : selection.type === 'CRIME'
          ? `point:${selection.lat},${selection.lon}`
          : null
    ],

    queryFn: async () => {
      if (selection.type === 'GRID') {
        return getGridStatsById(selection.gridId);
      }

      if (selection.type === 'CRIME') {
        return getGridStatsByPoint(selection.lat, selection.lon);
      }

      throw new Error('Grid stats query called without selection');
    },

    enabled: selection.type !== 'NONE',
    staleTime: 1000 * 60 * 10
  });

  // Determine if grid stats panel should be open based on selection and data availability
  const gridStats = gridStatsQuery.data ?? null;
  const gridStatsOpen = gridStats !== null && selection.type !== 'NONE';

  function handleCrimeClick(crimeId: number, lat: number, lon: number) {
    setSelection({ type: 'CRIME', crimeId, lat, lon });
  }

  function handleGridClick(gridId: number) {
    setSelection({ type: 'GRID', gridId });
  }

  function clearSelection() {
    setSelection({ type: 'NONE' });
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Title and Source - Desktop */}
      <div className="hidden md:block absolute top-4 left-4 z-50 font-mono">
        <h1 className="text-stone-300 font-semibold text-2xl">Ottawa CrimeLens</h1>
        <a
          className="text-stone-400"
          href="https://tazim04.github.io/personal-website/"
          target="_blank"
          rel="noopener noreferrer">
          By{' '}
          <span className="hover:cursor-pointer underline underline-offset-4 hover:text-white">
            Tazim Khan
          </span>
        </a>
        <br />
        <SourceCodeDropdown />
      </div>

      {/* Title and Source - Mobile */}
      <div className="md:hidden absolute bottom-2 left-2 z-50 font-mono bg-black/50 backdrop-blur px-3 py-2 rounded-xl">
        <h1 className="text-stone-200 font-semibold text-sm leading-tight">Ottawa CrimeLens</h1>

        <a
          className="text-stone-400 text-xs"
          href="https://tazim04.github.io/personal-website/"
          target="_blank"
          rel="noopener noreferrer">
          By <span className="underline underline-offset-2 hover:text-white">Tazim Khan</span>
        </a>
        <br />
        <SourceCodeDropdown mobile />
      </div>

      <div className="text-stone-500 text-xs absolute bottom-2 md:left-4 right-11 z-50">
        Flaticon by{' '}
        <a
          href="https://www.flaticon.com/authors/arkinasi"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-stone-300">
          Arkinasi
        </a>{' '}
      </div>

      <AddressSearchBar
        onSelect={async (lat, lon) => {
          mapRef.current?.flyTo(lat, lon, 14);

          const grid = await getGridStatsByPoint(lat, lon);
          if (!grid.empty) {
            setSelection({ type: 'GRID', gridId: grid.id });
          }
        }}
      />

      {mapMode === 'POINTS' && (
        <CrimeFilter value={memoizedCrimeFilter} onChange={handleFilterChange} />
      )}

      <MapCanvas
        ref={mapRef}
        onCrimeClick={handleCrimeClick}
        onGridClick={handleGridClick}
        onModeChange={setMapMode}
        selectedCrimeId={selection.type === 'CRIME' ? selection.crimeId : null}
        selectedGridId={selection.type === 'GRID' ? selection.gridId : null}
        filter={memoizedCrimeFilter}
      />

      {/* Panels on desktop */}
      <div className="hidden md:block">
        <CrimeDetailsPanel crime={crimeQuery.data ?? null} open={selection.type === 'CRIME'} />
        <GridStatsPanel stats={gridStats} open={gridStatsOpen} />
        <ClosePanelsButton
          visible={selection.type === 'CRIME' || selection.type === 'GRID'}
          hasCrime={selection.type === 'CRIME'}
          hasGrid={selection.type === 'GRID'}
          onClear={clearSelection}
        />
      </div>

      <MobileBottomSheet
        crime={crimeQuery.data ?? null}
        grid={gridStats}
        selectionType={selection.type}
        open={selection.type !== 'NONE'}
        onClose={clearSelection}
      />
    </div>
  );
}
