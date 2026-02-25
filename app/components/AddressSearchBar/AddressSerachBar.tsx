import { useEffect, useState } from 'react';

type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
  namedetails?: {
    name?: string;
  };
  address?: {
    house_number?: string;
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    town?: string;
    municipality?: string;
    state?: string;
    postcode?: string;
  };
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

  // Helper to format address display
  function formatAddress(r: NominatimResult): string {
    const name = r.namedetails?.name || r.name;
    const a = r.address;

    const street = [a?.house_number, a?.road].filter(Boolean).join(' ');
    const city = a?.city || a?.town || a?.municipality;

    // POI + address
    if (name && street) {
      return [name, street, city].filter(Boolean).join(', ');
    }

    // Street-only result
    if (street) {
      return [street, city].filter(Boolean).join(', ');
    }

    // POI-only fallback
    if (name) {
      return city ? `${name}, ${city}` : name;
    }

    // Last-resort fallback
    return r.display_name;
  }

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
    <div className="absolute top-4 left-1/2 z-50 md:w-[40vw] w-11/12 -translate-x-1/2 font-mono">
      {/* Search container */}
      <div
        className="
        rounded-xl
        bg-white/6
        border border-white/20
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
            ps-4 pe-11 py-3
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
        hover:bg-white/5
        p-1
        rounded
        transition
      "
            aria-label="Clear search">
            ✕
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
                  setQuery(formatAddress(r));
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
