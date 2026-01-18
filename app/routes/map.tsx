import { useState, useRef } from 'react';
import type { Route } from './+types/map';
import CrimeDetailsPanel from '~/components/panels/CrimeDetailsPanel/CrimeDetailsPanel';
import GridStatsPanel from '~/components/panels/GridStatsPanel/GridStatsPanel';
import { getCrimeDetails, getGridCellStats } from '~/services/crimeApi';
import { ClosePanelsButton } from '~/components/panels/ClosePanelsButton';
import { useQuery } from '@tanstack/react-query';
import SourceCodeDropdown from '~/components/SourceCodeDropdown/SourceCodeDropdown';
import MapCanvas from '~/components/MapCanvas/MapCanvas';
import type { MapCanvasRef } from '~/components/MapCanvas/MapCanvas';
import AddressSearchBar from '~/components/AddressSearchBar/AddressSerachBar';

export function meta(_: Route.MetaArgs) {
  return [
    { title: 'Map page for Ottawa CrimeLens' },
    { name: 'description', content: 'Explore crime data visualized on a map of Ottawa.' }
  ];
}

export default function Map() {
  const [selectedCrimeId, setSelectedCrimeId] = useState<number | null>(null);
  const [selectedGridPoint, setSelectedGridPoint] = useState<{ lat: number; lon: number } | null>(
    null
  );

  // Ref to control the MapCanvas component - used for flying to addresses
  const mapRef = useRef<MapCanvasRef>(null);

  const crimeQuery = useQuery({
    queryKey: ['crimeDetail', selectedCrimeId],
    queryFn: () => getCrimeDetails(selectedCrimeId!),
    enabled: selectedCrimeId !== null
  });

  const gridStatsQuery = useQuery({
    queryKey: ['gridStats', selectedGridPoint?.lat, selectedGridPoint?.lon],
    queryFn: () => getGridCellStats(selectedGridPoint!.lat, selectedGridPoint!.lon),
    enabled: selectedGridPoint !== null
  });

  function handleCrimeClick(id: number, lat: number, lon: number) {
    setSelectedCrimeId(id);
    setSelectedGridPoint({ lat, lon });
  }

  function handleGridClick(lat: number, lon: number) {
    setSelectedCrimeId(null);
    setSelectedGridPoint({ lat, lon });
  }

  function clearSelection() {
    setSelectedCrimeId(null);
    setSelectedGridPoint(null);
  }

  function fetchGridStats(lat: number, lon: number) {
    setSelectedCrimeId(null);
    setSelectedGridPoint({ lat, lon });
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <div className="absolute top-4 left-5 z-50 font-mono">
        <h1 className="text-stone-300 font-semibold text-2xl">Ottawa CrimeLens</h1>
        <p className="text-stone-400">By Tazim Khan</p>
        <SourceCodeDropdown />
      </div>

      <AddressSearchBar
        onSelect={(lat, lon) => {
          mapRef.current?.flyTo(lat, lon, 14);

          fetchGridStats(lat, lon);
        }}
      />

      <MapCanvas
        ref={mapRef}
        onCrimeClick={handleCrimeClick}
        onGridClick={handleGridClick}
        selectedCrimeId={selectedCrimeId}
        selectedGridPoint={selectedGridPoint}
      />

      <CrimeDetailsPanel crime={crimeQuery.data ?? null} open={!!selectedCrimeId} />
      <GridStatsPanel stats={gridStatsQuery.data ?? null} open={!!selectedGridPoint} />
      <ClosePanelsButton
        visible={!!selectedCrimeId || !!selectedGridPoint}
        hasCrime={!!selectedCrimeId}
        hasGrid={!!selectedGridPoint}
        onClear={clearSelection}
      />
    </div>
  );
}
