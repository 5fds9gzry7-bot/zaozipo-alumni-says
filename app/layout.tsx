import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "枣子坡校友说", template: "%s · 枣子坡校友说" },
  description: "溆浦一中非官方校友经验分享平台",
  applicationName: "枣子坡校友说",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#7b2d26",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
