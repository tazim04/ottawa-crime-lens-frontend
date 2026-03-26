import type { CrimeDetail } from '~/types/crime';
import InfoRow from '../InfoRow';
import PanelSection from '../PanelSection';

type CrimeDetailsPanelProps = {
  crime: CrimeDetail | null;
  open: boolean;
  embedded?: boolean;
};

export default function CrimeDetailsPanel({ crime, open, embedded }: CrimeDetailsPanelProps) {
  function formatHour(hour: number | string | null | undefined) {
    if (!hour) return '-';

    const hourStr = hour.toString().padStart(4, '0');
    const hh = parseInt(hourStr.slice(0, 2), 10); // get the hour part, convert to int with base 10
    const mm = hourStr.slice(2, 4); // get the minute part as string

    // convert to 12-hour format
    const period = hh >= 12 ? 'PM' : 'AM';
    const hour12 = hh % 12 === 0 ? 12 : hh % 12;

    return `${hour12}:${mm} ${period}`;
  }

  return (
    <aside
      className={`
        ${embedded ? 'w-full relative' : 'fixed 2xl:right-3 right-1 top-3 2xl:w-95 md:w-90 2xl:h-[47.5vh] md:h-[46vh]'}
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
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
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
              <InfoRow label="Occurred hour" value={formatHour(crime.occurredHour)} />
              <InfoRow label="Reported date" value={crime.reportedDate} />
              <InfoRow label="Reported hour" value={formatHour(crime.reportedHour)} />
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
