import { useState } from 'react';
import type { Route } from './+types/map';
import MapCanvas from '~/components/MapCanvas/MapCanvas';
import CrimeDetailsPanel from '~/components/panels/CrimeDetailsPanel/CrimeDetailsPanel';
import GridStatsPanel from '~/components/panels/GridStatsPanel/GridStatsPanel';
import { getCrimeDetails, getGridCellStats } from '~/services/crimeApi';
import { ClosePanelsButton } from '~/components/panels/ClosePanelsButton';
import { useQuery } from '@tanstack/react-query';

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
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <MapCanvas onCrimeClick={handleCrimeClick} onGridClick={handleGridClick} selectedCrimeId={selectedCrimeId} selectedGridPoint={selectedGridPoint} />

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
