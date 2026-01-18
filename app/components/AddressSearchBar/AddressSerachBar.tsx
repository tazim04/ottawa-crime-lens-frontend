import { useEffect, useState } from 'react';

type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
};

export default function AddressSearchBar({
  onSelect
}: {
  onSelect: (lat: number, lon: number) => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // To manage results visibility

  useEffect(() => {
    // Minimum 3 characters to search
    if (query.length < 3) {
      setResults([]);
      setIsLoading(false);
      setIsOpen(false); // Close results if query is too short
      return;
    }

    const controller = new AbortController();
    setIsLoading(true); // Set loading state

    const timeout = setTimeout(async () => {
      // Fetch from Nominatim API with Ottawa bounding box
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search` +
          `?format=json` +
          `&q=${encodeURIComponent(query)}` +
          `&addressdetails=1` +
          `&namedetails=1` +
          `&extratags=1` +
          `&limit=8` +
          `&countrycodes=ca` +
          `&viewbox=-76.4,45.8,-75.0,44.9` +
          `&bounded=1`,
        { signal: controller.signal }
      );

      const data = await res.json();
      setIsLoading(false); // Clear loading state
      setResults(data);
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [query]);

  return (
    <div className="absolute top-4 left-1/2 z-50 w-[40vw] -translate-x-1/2 font-mono">
      {/* Search container */}
      <div
        className="
        rounded-xl
        bg-white/6
        border border-white/10
        backdrop-blur
        shadow-lg
      ">
        <input
          placeholder="Search address..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          className="
            w-full
            bg-transparent
            px-4 py-3
            text-sm
            text-white
            placeholder-neutral-400
            outline-none
          "
        />

        {/* Clear button */}
        {query.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsLoading(false);
              setIsOpen(false);
            }}
            className="
        absolute
        right-5
        top-1/2
        -translate-y-1/2
        text-neutral-400
        hover:text-white
        hover:cursor-pointer
        transition
      "
            aria-label="Clear search">
            X
          </button>
        )}
      </div>

      {/* Results */}
      {isOpen && (isLoading || results.length > 0) && (
        <ul
          className="
          mt-2
          overflow-hidden
          rounded-xl
          bg-white/3
          border border-white/10
          backdrop-blur
          shadow-xl
        ">
          {isLoading && (
            <li className="px-4 py-2 text-sm text-neutral-400 animate-pulse">Searching...</li>
          )}

          {!isLoading &&
            results.map((r) => (
              <li
                key={`${r.lat}-${r.lon}`}
                onClick={() => {
                  onSelect(Number(r.lat), Number(r.lon));
                  setResults([]);
                  setQuery(r.display_name);
                  setIsOpen(false); // Close results on selection
                }}
                className="
                cursor-pointer
                px-4 py-2
                text-sm
                text-neutral-200
                transition
                hover:bg-white/5
                hover:text-white
              ">
                {r.display_name}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
