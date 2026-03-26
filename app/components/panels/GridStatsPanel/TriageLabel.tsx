import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { GridAnomaly } from '~/types/crime';

type TriageLabelProps = {
  anomaly: GridAnomaly | null;
  resetKey?: string | number | null;
};

function formatScoredDate(date: string | null | undefined) {
  // Format dates like "2024-05-01" or ISO strings, fallback to raw value if invalid

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
  // Determine pill and dot colors based on triage label, default to neutral if unrecognized

  const normalized = triageLabel?.trim().toLowerCase() ?? '';

  if (normalized.includes('high')) {
    return {
      pillClassName: 'border-red-500/40 bg-red-500/15 text-red-200 hover:bg-red-500/20',
      dotClassName: 'bg-red-400'
    };
  }

  if (normalized.includes('medium')) {
    return {
      pillClassName: 'border-orange-500/40 bg-orange-500/15 text-orange-200 hover:bg-orange-500/20',
      dotClassName: 'bg-orange-400'
    };
  }

  // low
  return {
    pillClassName:
      'border-emerald-500/40 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/20',
    dotClassName: 'bg-emerald-400'
  };
}

function formatMetricValue(
  value: string | number | null | undefined,
  options?: { percent?: boolean }
) {
  // Format numeric values with up to 3 decimals, optionally as percentages,
  // return non-numeric values as-is, and return null for empty values
  if (value === null || value === undefined || value === '') return null;

  if (typeof value === 'number') {
    if (options?.percent) {
      return `${(value * 100).toFixed(1)}%`;
    }

    return Number.isInteger(value) ? value.toString() : value.toFixed(3);
  }

  // Try to parse numeric strings, but return original value if it's not a valid number
  const parsed = Number(value);
  if (!Number.isNaN(parsed) && value.trim() !== '') {
    if (options?.percent) {
      return `${(parsed * 100).toFixed(1)}%`;
    }

    return Number.isInteger(parsed) ? parsed.toString() : parsed.toFixed(3);
  }

  return value;
}

type TriageContentProps = {
  anomaly: GridAnomaly | null;
  triageTone: {
    pillClassName: string;
    dotClassName: string;
  };
  mobile?: boolean;
  headerAction?: React.ReactNode;
};

function TriageContent({
  anomaly,
  triageTone,
  mobile = false,
  headerAction
}: TriageContentProps) {
  if (anomaly) {
    return (
      <>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-500">
              Anomaly status
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${triageTone.dotClassName}`} />
              <p className="text-base font-semibold capitalize text-white">{anomaly.triageLabel}</p>
            </div>
          </div>

          {headerAction}
        </div>

        <div className="mb-4 rounded-xl border border-white/10 bg-white/4 p-3">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
            Explanation
          </p>
          <p className="text-sm leading-6 text-neutral-100">{anomaly.triageExplanation}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <div className="space-y-3">
            {mobile ? (
              <>
                <div className="space-y-1 text-sm">
                  <p className="text-neutral-400">Scored date</p>
                  <p className="font-medium text-neutral-100">{formatScoredDate(anomaly.date)}</p>
                </div>

                <div className="space-y-1 text-sm">
                  <p className="text-neutral-400">Percentile</p>
                  <p className="font-medium text-neutral-100">
                    {formatMetricValue(anomaly.triagePercentile, { percent: true })}
                  </p>
                </div>

                <div className="space-y-1 text-sm">
                  <p className="text-neutral-400">Anomaly score</p>
                  <p className="font-medium text-neutral-100">
                    {formatMetricValue(anomaly.anomalyScore)}
                  </p>
                </div>

                <div className="space-y-1 text-sm">
                  <p className="text-neutral-400">Model version</p>
                  <p className="font-medium text-neutral-100 break-all">{anomaly.modelVersion}</p>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-[100px_1fr] items-start gap-3 text-sm">
                  <span className="text-neutral-400">Scored date</span>
                  <span className="text-right font-medium text-neutral-100">
                    {formatScoredDate(anomaly.date)}
                  </span>
                </div>

                <div className="grid grid-cols-[100px_1fr] items-start gap-3 text-sm">
                  <span className="text-neutral-400">Percentile</span>
                  <span className="text-right font-medium text-neutral-100">
                    {formatMetricValue(anomaly.triagePercentile, { percent: true })}
                  </span>
                </div>

                <div className="grid grid-cols-[100px_1fr] items-start gap-3 text-sm">
                  <span className="text-neutral-400">Anomaly score</span>
                  <span className="text-right font-medium text-neutral-100">
                    {formatMetricValue(anomaly.anomalyScore)}
                  </span>
                </div>

                <div className="grid grid-cols-[100px_1fr] items-start gap-3 text-sm">
                  <span className="text-neutral-400">Model version</span>
                  <span className="text-right font-medium text-neutral-100 break-all">
                    {anomaly.modelVersion}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mb-3 flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${triageTone.dotClassName}`} />
        <p className="text-sm font-semibold text-white">Unscored</p>
      </div>

      <p className="text-sm leading-6 text-neutral-300">
        Not scored yet: this area did not have enough recent activity to build a reliable anomaly
        baseline.
      </p>
    </>
  );
}

export default function TriageLabel({ anomaly, resetKey }: TriageLabelProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triageRef = useRef<HTMLDivElement>(null);

  // Close the triage details when anomaly changes or when resetKey changes (e.g. new grid cell selected)
  useEffect(() => {
    setOpen(false);
  }, [resetKey, anomaly]);

  // Mark as mounted after first render to enable portal rendering on mobile
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close the triage details when clicking outside of the component
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (triageRef.current && !triageRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open]);

  // Determine the visual tone of the triage label based on the anomaly's triage label, with a default for unscored cases
  const triageTone = anomaly
    ? getTriageTone(anomaly.triageLabel)
    : {
        pillClassName:
          'border-neutral-500/40 bg-neutral-500/10 text-neutral-200 hover:bg-neutral-500/15',
        dotClassName: 'bg-neutral-400'
      };

  return (
    <div ref={triageRef} className="relative shrink-0">
      <div className="flex flex-col items-end gap-1">
        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
          Anomaly triage
        </span>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors ${triageTone.pillClassName}`}>
          <span className={`h-2 w-2 rounded-full ${triageTone.dotClassName}`} />
          {anomaly ? `${anomaly.triageLabel} anomaly` : 'Unscored'}
        </button>
      </div>

      {/* Triage details popover */}
      {open && (
        <>
          <div className="absolute right-0 top-full z-10 mt-2 hidden w-80 rounded-2xl border border-white/10 bg-neutral-950/95 p-4 shadow-2xl backdrop-blur md:block">
            <TriageContent anomaly={anomaly} triageTone={triageTone} />
          </div>

          {mounted &&
            createPortal(
              <div className="fixed inset-0 z-[80] md:hidden">
                <button
                  type="button"
                  aria-label="Close anomaly details"
                  onClick={() => setOpen(false)}
                  className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
                />

                <div className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-white/10 bg-neutral-950/98 px-4 pb-5 pt-4 shadow-2xl">
                  <div className="max-h-[70vh] overflow-y-auto pb-[env(safe-area-inset-bottom)]">
                    <TriageContent
                      anomaly={anomaly}
                      triageTone={triageTone}
                      mobile
                      headerAction={
                        <button
                          type="button"
                          onClick={() => setOpen(false)}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-neutral-300">
                          Close
                        </button>
                      }
                    />
                  </div>
                </div>
              </div>,
              document.body
            )}
        </>
      )}
    </div>
  );
}
