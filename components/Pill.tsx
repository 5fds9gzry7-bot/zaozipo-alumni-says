import type { ReactNode } from "react";

export function Pill({ children, tone = "red" }: { children: ReactNode; tone?: "red" | "green" | "gold" }) {
  const tones = {
    red: "bg-[#f3e5df] text-[#7b2d26]",
    green: "bg-[#e7eeea] text-[#2f5d50]",
    gold: "bg-[#f4ecd9] text-[#7c6531]",
  };
  return <span className={`inline-flex rounded-full px-3 py-1.5 text-[11px] font-semibold leading-none ${tones[tone]}`}>{children}</span>;
}
