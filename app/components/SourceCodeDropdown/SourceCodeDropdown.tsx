import { useState, useRef, useEffect } from 'react';

type Props = {
  mobile?: boolean;
};

export default function SourceCodeDropdown({ mobile }: Props) {
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
    <div ref={ref} className="relative inline-flex md:text-base text-xs">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-stone-400 hover:text-stone-200 transition-colors hover:cursor-pointer underline underline-offset-4">
        Source Code
      </button>

      {open && (
        <div
          className={`
            absolute rounded-md -top-11 shadow-lg space-y-1 bg-neutral-900/70 backdrop-blur-md p-2
            ${mobile ? 'left-34 w-20 mb-20' : 'mt-2 left-0 w-40'}
          `}>
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
