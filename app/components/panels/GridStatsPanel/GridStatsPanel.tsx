import type { GridStat } from '~/types/crime';
import StatBox from './StatBox';
import InfoRow from '../InfoRow';
import PanelSection from '../PanelSection';

type GridStatsPanelProps = {
  stats: GridStat | null;
  open: boolean;
};
export default function GridStatsPanel({ stats, open }: GridStatsPanelProps) {
  return (
    <aside
      className={`
        fixed right-3 bottom-10 z-50
        w-95 h-[47vh]
        rounded-2xl
        bg-neutral-900/95 backdrop-blur
        border border-white/10
        text-white
        shadow-2xl
        transform transition-transform duration-300 ease-out
        ${open ? 'translate-x-0' : 'translate-x-105'}
      `}>
      <div className="p-5 h-full overflow-y-auto space-y-4">
        {stats && (
          <>
            {/* Header */}
            <div>
              <h3 className="text-lg font-semibold tracking-wide">Area Crime Statistics</h3>
              <div className="mt-1 h-px w-14 bg-cyan-500/60" />
            </div>

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
          </>
        )}
      </div>
    </aside>
  );
}
