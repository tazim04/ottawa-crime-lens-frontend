type ClosePanelsButtonProps = {
  visible: boolean;
  hasCrime: boolean;
  hasGrid: boolean;
  onClear: () => void;
};

export function ClosePanelsButton({ visible, hasCrime, hasGrid, onClear }: ClosePanelsButtonProps) {
  const positionClass = (() => {
    // Crime panel open
    if (hasCrime) {
      return 'top-[1.8vh] right-[25rem]';
    }

    // Only grid stats open
    if (hasGrid) {
      return 'top-[50vh] right-[25rem]';
    }

    return '';
  })();

  return (
    <button
      onClick={onClear}
      aria-label="Clear selection"
      className={`
        fixed
        z-10

        ${positionClass}

        w-9 h-9
        rounded-full
        bg-neutral-800/90
        border border-white/10
        text-neutral-300
        shadow-xl

        flex items-center justify-center

        transform transition-all duration-300 ease-out
        hover:bg-neutral-700 hover:text-white
        hover:cursor-pointer

        ${
          visible
            ? 'translate-x-0 opacity-100'
            : 'translate-x-[120vw] opacity-0 pointer-events-none'
        }
      `}>
      ✕
    </button>
  );
}
