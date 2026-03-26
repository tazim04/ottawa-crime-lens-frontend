import { useEffect, useRef, useState } from 'react';
import type { GridStat } from '~/types/crime';
import StatBox from './StatBox';
import InfoRow from '../InfoRow';
import PanelSection from '../PanelSection';

type GridStatsPanelProps = {
  stats: GridStat | null;
  open: boolean;
  embedded?: boolean;
};

export default function GridStatsPanel({ stats, open, embedded }: GridStatsPanelProps) {
  const [triageOpen, setTriageOpen] = useState(false);
  const triageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTriageOpen(false);
  }, [stats?.id, stats?.anomaly]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (triageRef.current && !triageRef.current.contains(event.target as Node)) {
        setTriageOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function formatScoredDate(date: string | null | undefined) {
    if (!date) return null;

    const parsed = /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T00:00:00`) : new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function getTriageTone(triageLabel: string | null | undefined) {
    const normalized = triageLabel?.trim().toLowerCase() ?? '';

    if (normalized.includes('high')) {
      return {
        pillClassName: 'border-red-500/40 bg-red-500/15 text-red-200 hover:bg-red-500/20',
        dotClassName: 'bg-red-400'
      };
    }

    if (normalized.includes('medium')) {
      return {
        pillClassName:
          'border-orange-500/40 bg-orange-500/15 text-orange-200 hover:bg-orange-500/20',
        dotClassName: 'bg-orange-400'
      };
    }

    return {
      pillClassName:
        'border-emerald-500/40 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/20',
      dotClassName: 'bg-emerald-400'
    };
  }

  const triageTone = stats?.anomaly
    ? getTriageTone(stats.anomaly.triageLabel)
    : {
        pillClassName:
          'border-neutral-500/40 bg-neutral-500/10 text-neutral-200 hover:bg-neutral-500/15',
        dotClassName: 'bg-neutral-400'
      };

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

                {/* Anomaly triage */}
                <div ref={triageRef} className="relative shrink-0">
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
                      Anomaly triage
                    </span>
                    <button
                      type="button"
                      onClick={() => setTriageOpen((value) => !value)}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors ${triageTone.pillClassName}`}>
                      <span className={`h-2 w-2 rounded-full ${triageTone.dotClassName}`} />
                      {stats.anomaly ? `${stats.anomaly.triageLabel} anomaly` : 'Unscored'}
                    </button>
                  </div>

                  {triageOpen && (
                    <div className="absolute right-0 top-full z-10 mt-2 w-72 rounded-xl border border-white/10 bg-neutral-950/95 p-4 shadow-2xl backdrop-blur">
                      {stats.anomaly ? (
                        <>
                          <div className="mb-3 flex items-center gap-2">
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${triageTone.dotClassName}`}
                            />
                            <p className="text-sm font-semibold text-white">
                              {stats.anomaly.triageLabel}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <InfoRow
                              label="Explanation"
                              value={stats.anomaly.triageExplanation}
                              multiline
                            />
                            <InfoRow
                              label="Scored date"
                              value={formatScoredDate(stats.anomaly.date)}
                            />
                            <InfoRow label="Model version" value={stats.anomaly.modelVersion} />
                            <InfoRow label="Percentile" value={stats.anomaly.triagePercentile} />
                            <InfoRow label="Anomaly score" value={stats.anomaly.anomalyScore} />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="mb-3 flex items-center gap-2">
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${triageTone.dotClassName}`}
                            />
                            <p className="text-sm font-semibold text-white">Unscored</p>
                          </div>

                          <p className="text-sm leading-6 text-neutral-300">
                            Not scored yet: this area did not have enough recent activity to build a
                            reliable anomaly baseline.
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>
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
