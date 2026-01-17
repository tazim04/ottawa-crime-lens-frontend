import { useState } from 'react';
import type { Route } from './+types/map';
import type { CrimeDetail, GridStat } from '~/types/crime';
import MapCanvas from '~/components/MapCanvas/MapCanvas';
import CrimeDetailsPanel from '~/components/panels/CrimeDetailsPanel/CrimeDetailsPanel';
import GridStatsPanel from '~/components/panels/GridStatsPanel/GridStatsPanel';
import { getCrimeDetails, getGridCellStats } from '~/services/crimeApi';
import { ClosePanelsButton } from '~/components/panels/ClosePanelsButton';

export function meta(_: Route.MetaArgs) {
  return [
    { title: 'Map page for Ottawa CrimeLens' },
    { name: 'description', content: 'Explore crime data visualized on a map of Ottawa.' }
  ];
}

export default function Map() {
  const [selectedCrime, setSelectedCrime] = useState<CrimeDetail | null>(null);
  const [gridStats, setGridStats] = useState<GridStat | null>(null);

  async function handleCrimeClick(id: number, lat: number, lon: number): Promise<void> {
    const details: CrimeDetail = await getCrimeDetails(id);
    const cellStats: GridStat = await getGridCellStats(lat, lon);

    // For demonstration, just log the details
    console.log('Crime details:', details);
    console.log('Grid cell stats:', cellStats);

    // Update parent state
    setSelectedCrime(details);
    setGridStats(cellStats);
  }

  async function handleGridClick(lat: number, lon: number): Promise<void> {
    const cellStats: GridStat = await getGridCellStats(lat, lon);

    setGridStats(cellStats);
    setSelectedCrime(null);
  }

  function clearSelection() {
    setSelectedCrime(null);
    setGridStats(null);
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <MapCanvas onCrimeClick={handleCrimeClick} onGridClick={handleGridClick} />

      <CrimeDetailsPanel crime={selectedCrime} open={!!selectedCrime} />
      <GridStatsPanel stats={gridStats} open={!!gridStats} />
      <ClosePanelsButton
        visible={!!selectedCrime || !!gridStats}
        hasCrime={!!selectedCrime}
        hasGrid={!!gridStats}
        onClear={clearSelection}
      />
    </div>
  );
}
