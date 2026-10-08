import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VISAD Construction",
    short_name: "VISAD",
    description: "Sisteme alumini dhe PVC. Prodhim dhe montim në Shkodër.",
    start_url: "/",
    display: "standalone",
    background_color: "#0E0F11",
    theme_color: "#0E0F11",
    icons: [
      { src: "/brand/logo/png/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/logo/png/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
