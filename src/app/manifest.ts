import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "KHANIVERSITY Learning Platform",
    short_name: "KHANIVERSITY",
    description: "Learn, build and demonstrate technology skills.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#faf9f5",
    theme_color: "#112c35",
    orientation: "any",
    categories: ["education", "productivity"],
    icons: [
      { src: "/icons/khaniversity.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
