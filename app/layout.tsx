import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "枣子坡校友说｜溆浦一中非官方校友经验分享平台", template: "%s · 枣子坡校友说" },
  description: "听学长学姐讲大学、专业、高考、留学与成长经验。",
  applicationName: "枣子坡校友说",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "枣子坡校友说｜溆浦一中非官方校友经验分享平台",
    description: "听学长学姐讲大学、专业、高考、留学与成长经验。",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#7b2d26",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
