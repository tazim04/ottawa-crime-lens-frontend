import type { CrimeDetail } from '~/types/crime';
import InfoRow from '../InfoRow';
import PanelSection from '../PanelSection';

type CrimeDetailsPanelProps = {
  crime: CrimeDetail | null;
  open: boolean;
  embedded?: boolean;
};

export default function CrimeDetailsPanel({ crime, open, embedded }: CrimeDetailsPanelProps) {
  return (
    <aside
      className={`
        ${embedded ? 'w-full relative' : 'fixed right-3 bottom-10 w-95 h-[47vh]'}
        ${embedded ? '' : 'rounded-2xl shadow-2xl'}
        ${embedded ? '' : 'bg-neutral-900/95 border border-white/10 backdrop-blur'}
        text-white
        transform transition-transform duration-300 ease-out
        ${embedded ? '' : open ? 'translate-x-0' : 'translate-x-105'}
      `}>
      {crime && (
        <div className="flex h-full flex-col">
          {/* ===== Header ===== */}
          <div className="px-5 pt-5 pb-2">
            <h2 className="text-xl font-semibold tracking-wide">Crime Details</h2>
            <div className="mt-1 h-px w-16 bg-red-500/60" />
          </div>

          {/* ===== Scrollable body ===== */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Summary */}
            <PanelSection title="Offence">
              <InfoRow label="Category" value={crime.offenceCategory} />
              <InfoRow label="Summary" value={crime.offenceSummary} />
            </PanelSection>

            {/* Location */}
            <PanelSection title="Location">
              <InfoRow label="Neighbourhood" value={crime.neighbourhood} />
              <InfoRow label="Intersection" value={crime.intersection} />
            </PanelSection>

            {/* Time */}
            <PanelSection title="Time">
              <InfoRow label="Occurred date" value={crime.occurredDate} />
              <InfoRow label="Occurred hour" value={`${crime.occurredHour}:00`} />
              <InfoRow label="Reported date" value={crime.reportedDate} />
              <InfoRow label="Reported hour" value={`${crime.reportedHour}:00`} />
            </PanelSection>

            {/* Metadata */}
            <PanelSection title="Metadata">
              <InfoRow label="GO number" value={crime.goNumber} />
              <InfoRow
                label="Source"
                value={crime.source}
                highlight={crime.source === 'OFFICIAL'}
              />
            </PanelSection>
          </div>
        </div>
      )}
    </aside>
  );
}
