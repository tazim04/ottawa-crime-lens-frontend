import { useState, useCallback } from 'react';
import ReportedDateFilter from './filters/ReportedDateFilter';
import type { CrimeFilter } from '~/types/filters';
import OffenceCategoryFilter from './filters/OffenceCategoryFilter';

type CrimeFilterProps = {
  value: CrimeFilter;
  onChange: (filters: { filter: CrimeFilter }) => void;
};

export default function CrimeFilter({ value, onChange }: CrimeFilterProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="
        absolute
        left-1/2
        -translate-x-1/2
        top-18
        z-10
        flex
        items-center
        gap-2
      ">
      {/* Filter button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="
          flex
          h-8
          px-3
          rounded-lg
          bg-white/10
          border border-white/20
          backdrop-blur-xl
          text-xs
          text-neutral-200
          items-center gap-1
          hover:bg-white/15
          transition
        ">
          Open Filters
        </button>
      )}

      {/* Close button (only for desktop) */}
      {open && (
        <button
          onClick={() => setOpen(false)}
          className="
          hidden md:flex
          h-8
          px-3
          rounded-lg
          bg-white/10
          border border-white/20
          backdrop-blur-xl
          text-xs
          text-neutral-200
          items-center gap-1
          hover:bg-white/15
          transition
        ">
          ✕
        </button>
      )}

      {/* Filters panel */}
      {open && (
        <div
          className="
            bg-white/6
            border border-white/20
            backdrop-blur-xl
            rounded-xl
            px-3
            py-2
            space-y-4
            shadow-lg
          ">
          <ReportedDateFilter
            dateRange={value.dateRange}
            onChange={(dateRange) => onChange({ filter: { ...value, dateRange } })}
          />
          <OffenceCategoryFilter
            category={value.category}
            onChange={(category) => onChange({ filter: { ...value, category } })}
          />

          {/* Mobile close button UNDER filters */}
          <button
            onClick={() => setOpen(false)}
            className="
              md:hidden
              w-full
              h-10
              rounded-lg
              bg-white/10
              border border-white/20
              text-sm
              text-neutral-200
              hover:bg-white/15
              transition
            ">
            Close
          </button>
        </div>
      )}
    </div>
  );
}
