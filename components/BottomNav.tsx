"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "首页", icon: "⌂" },
  { href: "/articles", label: "经验", icon: "卷" },
  { href: "/alumni", label: "枣友", icon: "友" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-4 left-1/2 z-50 grid w-[calc(100%-32px)] max-w-[416px] -translate-x-1/2 grid-cols-3 rounded-[24px] border border-white/80 bg-[#fffdf8]/95 p-1.5 shadow-[0_14px_35px_rgba(73,44,35,0.16)] backdrop-blur-xl">
      {items.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex h-14 items-center justify-center gap-2 rounded-[18px] text-sm font-semibold transition ${active ? "bg-[#7b2d26] text-white shadow-[0_6px_18px_rgba(123,45,38,0.25)]" : "text-[#81736b] hover:bg-[#f4ece2]"}`}
          >
            <span className="text-base" aria-hidden>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
