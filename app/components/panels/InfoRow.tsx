type InfoRowProps = {
  label: string;
  value: string | number | null;
  highlight?: boolean;
  multiline?: boolean;
};

export default function InfoRow({
  label,
  value,
  highlight = false,
  multiline = false
}: InfoRowProps) {
  if (value === null || value === undefined || value === '') return null;

  return (
    <div className={`flex gap-3 text-sm ${multiline ? 'flex-col items-start' : 'justify-between'}`}>
      <span className="text-neutral-400">{label}</span>

      <span
        className={`
          ${multiline ? 'text-left break-words' : 'text-right'}
          ${highlight ? 'text-red-400 font-medium' : 'text-neutral-200'}
        `}>
        {value}
      </span>
    </div>
  );
}
