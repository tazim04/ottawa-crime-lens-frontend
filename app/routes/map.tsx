import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
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
import type { CrimeDateFilter } from '~/types/filters';
import type { CrimeDetail, GridStat } from '~/types/crime';
import type { MapDataType } from '~/types/map';

export function meta(_: Route.MetaArgs) {
  return [
    { title: 'Map page for Ottawa CrimeLens' },
    { name: 'description', content: 'Explore crime data visualized on a map of Ottawa.' }
  ];
}

export default function Map() {
  // Selection state can be one of: no selection, crime selected, or grid cell selected
  type Selection =
    | { type: 'NONE' }
    | { type: 'CRIME'; crimeId: number; gridId?: number }
    | { type: 'GRID'; gridId: number };

  const [selection, setSelection] = useState<Selection>({ type: 'NONE' });
  const [mapMode, setMapMode] = useState<MapDataType>('GRID');

  // Store the raw date filter state
  const [dateFilterState, setDateFilterState] = useState<{
    startDate: string | null;
    endDate: string | null;
  }>({
    startDate: null,
    endDate: null
  });

  // Memoize the dateFilter object - only creates new object when dates actually change
  const dateFilter = useMemo<CrimeDateFilter>(
    () => ({
      startDate: dateFilterState.startDate,
      endDate: dateFilterState.endDate
    }),
    [dateFilterState.startDate, dateFilterState.endDate]
  );

  // Memoize the filter change handler
  const handleFilterChange = useCallback((filters: { date: CrimeDateFilter }) => {
    console.log('Map: Filter changed:', filters);
    setDateFilterState(filters.date);
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
        ? selection.gridId
        : selection.type === 'CRIME'
          ? selection.gridId
          : null
    ],

    queryFn: async () => {
      if (selection.type === 'GRID') {
        return getGridStatsById(selection.gridId);
      }
      if (selection.type === 'CRIME' && selection.gridId != null) {
        return getGridStatsById(selection.gridId);
      }
      throw new Error('Grid stats query called without gridId');
    },

    enabled: selection.type === 'GRID' || (selection.type === 'CRIME' && selection.gridId != null),

    staleTime: 1000 * 60 * 10
  });

  function handleCrimeClick(crimeId: number, gridId?: number) {
    setSelection({ type: 'CRIME', crimeId, gridId });
  }

  function handleGridClick(gridId: number) {
    setSelection({ type: 'GRID', gridId });
  }

  function clearSelection() {
    setSelection({ type: 'NONE' });
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <div className="absolute top-4 left-5 z-50 font-mono">
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

      <AddressSearchBar
        onSelect={async (lat, lon) => {
          mapRef.current?.flyTo(lat, lon, 14);

          const grid = await getGridStatsByPoint(lat, lon);
          if (!grid.empty) {
            setSelection({ type: 'GRID', gridId: grid.id });
          }
        }}
      />

      {mapMode === 'POINTS' && <CrimeFilter value={dateFilter} onChange={handleFilterChange} />}

      <MapCanvas
        ref={mapRef}
        onCrimeClick={handleCrimeClick}
        onGridClick={handleGridClick}
        onModeChange={setMapMode}
        selectedCrimeId={selection.type === 'CRIME' ? selection.crimeId : null}
        selectedGridId={
          selection.type === 'GRID'
            ? selection.gridId
            : selection.type === 'CRIME'
              ? (selection.gridId ?? null)
              : null
        }
        dateFilter={dateFilter}
      />

      <CrimeDetailsPanel crime={crimeQuery.data ?? null} open={selection.type === 'CRIME'} />
      <GridStatsPanel stats={gridStatsQuery.data ?? null} open={selection.type === 'GRID'} />
      <ClosePanelsButton
        visible={selection.type === 'CRIME' || selection.type === 'GRID'}
        hasCrime={selection.type === 'CRIME'}
        hasGrid={selection.type === 'GRID'}
        onClear={clearSelection}
      />
    </div>
  );
}
