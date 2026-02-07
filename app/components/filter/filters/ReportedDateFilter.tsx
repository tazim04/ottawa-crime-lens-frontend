import type { CrimeDateRange } from '~/types/filters';

type ReportedDateFilterProps = {
  dateRange: CrimeDateRange;
  onChange: (value: CrimeDateRange) => void;
};

export default function ReportedDateFilter({ dateRange, onChange }: ReportedDateFilterProps) {
  const { startDate, endDate } = dateRange; // Destructure for easier access

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-neutral-400 whitespace-nowrap">Reported Date</span>

      <input
        type="date"
        value={startDate ?? ''}
        onChange={(e) => onChange({ startDate: e.target.value || null, endDate })}
        className="
          h-7
          w-30
          bg-neutral-900
          border border-white/10
          rounded-md
          px-2
          text-xs text-neutral-200
          focus:outline-none
          focus:ring-1
          focus:ring-emerald-500
        "
      />

      <span className="text-xs text-neutral-500">–</span>

      <input
        type="date"
        value={endDate ?? ''}
        onChange={(e) => onChange({ startDate, endDate: e.target.value || null })}
        className="
          h-7
          w-30
          bg-neutral-900
          border border-white/10
          rounded-md
          px-2
          text-xs text-neutral-200
          focus:outline-none
          focus:ring-1
          focus:ring-emerald-500
        "
      />

      {(startDate || endDate) && (
        <button
          onClick={() => {
            onChange({ startDate: null, endDate: null });
          }}
          aria-label="Clear date filter"
          className="
      ml-1
      h-5 w-5
      flex items-center justify-center
      rounded
      text-xs
      text-neutral-500
      hover:text-neutral-200
      hover:bg-white/5
      hover:cursor-pointer
      transition
    ">
          ✕
        </button>
      )}
    </div>
  );
}
