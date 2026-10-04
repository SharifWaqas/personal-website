import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Muhammad Sharif Portfolio",
    short_name: "Muhammad Sharif",
    description:
      "Software engineering portfolio focused on backend systems, distributed infrastructure, and mathematical systems.",
    start_url: "/",
    display: "standalone",
    background_color: "#010203",
    theme_color: "#010203",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
