import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://sharifwaqas.vercel.app";

  return [
    {
      url: base,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/resume`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
