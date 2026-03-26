import type { GridStat } from '~/types/crime';
import StatBox from './StatBox';
import InfoRow from '../InfoRow';
import PanelSection from '../PanelSection';
import TriageLabel from './TriageLabel';

type GridStatsPanelProps = {
  stats: GridStat | null;
  open: boolean;
  embedded?: boolean;
};

export default function GridStatsPanel({ stats, open, embedded }: GridStatsPanelProps) {
  return (
    <aside
      className={`
        ${embedded ? 'w-full relative' : 'fixed 2xl:right-3 right-1 bottom-4 2xl:w-95 md:w-90 h-[50vh]'}
        ${embedded ? '' : 'rounded-2xl shadow-2xl'}
        ${embedded ? '' : 'bg-neutral-900/95 border border-white/10 backdrop-blur'}
        text-white
        transform transition-transform duration-300 ease-out
        ${embedded ? '' : open ? 'translate-x-0' : 'translate-x-105'}
      `}>
      <div className="flex h-full flex-col">
        {stats && (
          <>
            {/* Header */}
            <div className="ps-5 pe-5 pt-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold tracking-wide">Area Crime Statistics</h3>
                  <div className="mt-2 h-px w-14 bg-cyan-500/60" />
                </div>

                <TriageLabel anomaly={stats.anomaly} resetKey={stats.id} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {/* Core numbers */}
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-neutral-500">
                  Crime count by time window
                </p>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <StatBox label="All" value={stats.totalCrimes} />
                  <StatBox label="1y" value={stats.crimesLastYear} />
                  <StatBox label="5y" value={stats.crimesLast5Years} />
                  <StatBox label="10y" value={stats.crimesLast10Years} />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-2 border border-white/10">
                <span className="text-sm text-neutral-400">Avg / year</span>
                <span className="text-lg font-semibold text-cyan-400">
                  {stats.avgCrimesPerYear.toFixed(1)}
                </span>
              </div>

              {/* Common crimes */}

              <PanelSection title="Common offences">
                <InfoRow label="All time" value={stats.mostCommonCrimeAllTime} />
                <InfoRow label="Last year" value={stats.mostCommonCrimeLastYear} />
                <InfoRow label="Last 5 years" value={stats.mostCommonCrimeLast5Years} />
                <InfoRow label="Last 10 years" value={stats.mostCommonCrimeLast10Years} />
              </PanelSection>

              <PanelSection title="Data range">
                <InfoRow label="First reported" value={stats.firstReported} />
                <InfoRow label="Last reported" value={stats.lastReported} />
              </PanelSection>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
