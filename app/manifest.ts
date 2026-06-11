import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "枣子坡校友说",
    short_name: "枣子坡",
    description: "溆浦一中非官方校友经验分享平台",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f4ec",
    theme_color: "#7b2d26",
    icons: [
      { src: "/zaozipo-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/zaozipo-icon-maskable.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
