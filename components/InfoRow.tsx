export function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-[#eee5dc] py-3 last:border-0">
      <span className="shrink-0 text-xs text-[#9a897f]">{label}</span>
      <span className="text-right text-[13px] font-semibold leading-5 text-[#554139]">{value}</span>
    </div>
  );
}
