export default function StatBox({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg bg-neutral-800/60 p-3 border border-white/5">
      <p className="text-xs uppercase tracking-wider text-neutral-400">{label}</p>
      <p className="text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
