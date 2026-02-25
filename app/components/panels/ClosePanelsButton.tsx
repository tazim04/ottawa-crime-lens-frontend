type ClosePanelsButtonProps = {
  visible: boolean;
  hasCrime: boolean;
  hasGrid: boolean;
  onClear: () => void;
};

export function ClosePanelsButton({ visible, hasCrime, hasGrid, onClear }: ClosePanelsButtonProps) {
  return (
    <button
      onClick={onClear}
      aria-label="Clear selection"
      className={`
        fixed
        z-10

        ${hasGrid ? '2xl:top-[50vh] md:top-[48vh]' : ''}
        ${hasCrime ? 'top-[1.8vh]' : ''}

        2xl:right-100
        md:right-92

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
