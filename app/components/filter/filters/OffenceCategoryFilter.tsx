import { OffenceCategory } from '~/types/filters';

type OffenceCategoryFilterProps = {
  category: OffenceCategory | null;
  onChange: (value: OffenceCategory | null) => void;
};

export default function OffenceCategoryFilter({ category, onChange }: OffenceCategoryFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-neutral-400 whitespace-nowrap">Offence Category</span>

      <select
        value={category ?? ''}
        onChange={(e) =>
          onChange(e.target.value === '' ? null : (e.target.value as OffenceCategory))
        }
        className="
          h-7
          bg-neutral-900
          border border-white/10
          rounded-md
          px-2
          text-xs text-neutral-200
          focus:outline-none
          focus:ring-1
          focus:ring-emerald-500
        ">
        <option value="">All</option>

        {Object.values(OffenceCategory).map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      {category && (
        <button
          onClick={() => onChange(null)}
          aria-label="Clear category filter"
          className="
            h-5 w-5
            flex items-center justify-center
            rounded
            text-xs
            text-neutral-500
            hover:text-neutral-200
            hover:bg-white/5
            transition
          ">
          ✕
        </button>
      )}
    </div>
  );
}
