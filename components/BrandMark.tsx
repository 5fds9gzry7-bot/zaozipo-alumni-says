type BrandMarkProps = { size?: "sm" | "lg"; inverted?: boolean };

export function BrandMark({ size = "sm", inverted = false }: BrandMarkProps) {
  return (
    <div className={`brand-ring flex shrink-0 items-center justify-center rounded-full border ${size === "lg" ? "h-20 w-20 text-3xl" : "h-12 w-12 text-lg"} ${inverted ? "border-white/35 bg-white/12 text-white" : "border-[#7b2d26]/20 bg-[#7b2d26] text-white"} font-serif font-bold shadow-lg`}>
      枣
    </div>
  );
}
