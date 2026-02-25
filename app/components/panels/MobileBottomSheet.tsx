import type { CrimeDetail } from '~/types/crime';
import type { GridStat } from '~/types/crime';

import CrimeDetailsPanel from './CrimeDetailsPanel/CrimeDetailsPanel';
import GridStatsPanel from './GridStatsPanel/GridStatsPanel';

type MobileBottomSheetProps = {
  crime: CrimeDetail | null;
  grid: GridStat | null;
  selectionType: 'CRIME' | 'GRID' | 'NONE';
  open: boolean;
  onClose: () => void;
};

export function MobileBottomSheet({
  crime,
  grid,
  selectionType,
  open,
  onClose
}: MobileBottomSheetProps) {
  return (
    <>
      <aside
        className={`
        md:hidden
        z-50
        fixed bottom-0 left-0 w-full h-[min(40vh,500px)]
        rounded-t-2xl
        bg-neutral-900/95 backdrop-blur
        border-t border-white/10
        text-white shadow-2xl
        transform transition-transform duration-300 ease-out
        ${open ? 'translate-y-0' : 'translate-y-full'}
      `}>
        {/* Grab handler */}
        <div onClick={onClose} className="flex justify-center pt-3">
          <div className="h-1.5 w-10 rounded-full bg-neutral-600/60" />
        </div>

        <div className="px-5 pb-5 overflow-y-auto space-y-5 h-full">
          <CrimeDetailsPanel crime={crime} open={selectionType === 'CRIME'} embedded />
          <GridStatsPanel stats={grid} open={selectionType === 'GRID'} embedded />
        </div>
      </aside>
    </>
  );
}
