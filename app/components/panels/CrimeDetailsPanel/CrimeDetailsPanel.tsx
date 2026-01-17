import type { CrimeDetail } from '~/types/crime';
import InfoRow from '../InfoRow';
import PanelSection from '../PanelSection';

type CrimeDetailsPanelProps = {
  crime: CrimeDetail | null;
  open: boolean;
};

export default function CrimeDetailsPanel({ crime, open }: CrimeDetailsPanelProps) {
  return (
    <aside
      className={`
        fixed right-3 top-4 z-50
        w-95 h-[48vh]
        rounded-2xl
        bg-neutral-900/95 backdrop-blur
        border border-white/10
        text-white
        shadow-2xl
        transform transition-transform duration-300 ease-out
        ${open ? 'translate-x-0' : 'translate-x-105'}
      `}>
      <div className="p-5 h-full overflow-y-auto space-y-5">
        {crime && (
          <>
            {/* Header */}
            <div>
              <h2 className="text-xl font-semibold tracking-wide">Crime Details</h2>
              <div className="mt-1 h-px w-16 bg-red-500/60" />
            </div>

            {/* Summary */}
            <PanelSection title="Offence">
              <InfoRow label="Category" value={crime.offenceCategory}></InfoRow>
              <InfoRow label="Summary" value={crime.offenceSummary}></InfoRow>
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
          </>
        )}
      </div>
    </aside>
  );
}
