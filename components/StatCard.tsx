export function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[20px] border border-[#eadfd3] bg-[#fffdf8] px-3 py-4 text-center shadow-[0_7px_20px_rgba(76,47,37,0.05)]">
      <p className="font-serif text-2xl font-bold text-[#7b2d26]">{value}</p>
      <p className="mt-1 text-[11px] text-[#8b7b71]">{label}</p>
    </div>
  );
}
