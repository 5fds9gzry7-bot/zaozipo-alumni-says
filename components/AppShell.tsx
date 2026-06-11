import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

type AppShellProps = {
  children: ReactNode;
  showNav?: boolean;
};

export function AppShell({ children, showNav = true }: AppShellProps) {
  return (
    <main className="min-h-screen bg-[#ebe5da] text-[#34251f]">
      <div className={`relative mx-auto min-h-screen w-full max-w-md overflow-hidden bg-[#f8f4ec] px-5 pt-6 shadow-[0_0_55px_rgba(74,44,34,0.10)] ${showNav ? "pb-28" : "pb-10"}`}>
        <div className="paper-texture pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative">{children}</div>
        {showNav && <BottomNav />}
      </div>
    </main>
  );
}
