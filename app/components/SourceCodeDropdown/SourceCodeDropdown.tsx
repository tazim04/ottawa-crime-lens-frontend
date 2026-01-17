import { useState, useRef, useEffect } from 'react';

export default function SourceCodeDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-block text-sm">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-stone-400 hover:text-stone-200 transition-colors hover:cursor-pointer underline underline-offset-4">
        Source Code
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-40 rounded-md shadow-lg space-y-1">
          <a
            href="https://github.com/tazim04/ottawa-crime-lens-frontend"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-stone-300 hover:text-white transition-colors">
            Frontend
          </a>
          <a
            href="https://github.com/tazim04/Ottawa-Crime-Lens-Query"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-stone-300 hover:text-white transition-colors">
            Backend
          </a>
          <a
            href="https://github.com/tazim04/Ottawa-Crime-Lens-Pipeline"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-stone-300 hover:text-white transition-colors">
            Pipeline
          </a>
        </div>
      )}
    </div>
  );
}
