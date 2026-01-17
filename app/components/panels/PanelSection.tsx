type PanelSectionProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

export default function PanelSection({ title, children, className = '' }: PanelSectionProps) {
  return (
    <section
      className={`
        rounded-xl
        bg-white/3
        border border-white/10
        px-4 py-3
        space-y-1
        text-sm
        ${className}
      `}>
      <h4 className="text-xs uppercase tracking-wide text-neutral-500 mb-1">{title}</h4>

      {children}
    </section>
  );
}
