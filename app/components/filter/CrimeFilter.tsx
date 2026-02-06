import { useState, useCallback } from 'react';
import ReportedDateFilter from './filters/ReportedDateFilter';
import type { CrimeDateFilter } from '~/types/filters';

type CrimeFilterProps = {
  value: CrimeDateFilter;
  onChange: (filters: { date: CrimeDateFilter }) => void;
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
      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="
          h-8
          px-3
          rounded-lg
          bg-white/10
          border border-white/20
          backdrop-blur
          text-xs
          text-neutral-200
          flex items-center gap-1
          hover:bg-white/15
          transition
        ">
        {open ? '✕' : 'Open Filters'}
      </button>

      {/* Filters panel */}
      {open && (
        <div
          className="
            bg-white/6
            border border-white/20
            backdrop-blur
            rounded-xl
            px-3
            py-2
            shadow-lg
          ">
          <ReportedDateFilter value={value} onChange={(date) => onChange({ date: date })} />
        </div>
      )}
    </div>
  );
}
