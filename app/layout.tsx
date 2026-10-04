import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://sharifwaqas.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Muhammad Sharif — Software Engineer | CS + Mathematics",
    template: "%s | Muhammad Sharif",
  },
  description:
    "Muhammad Sharif is a Computer Science and Mathematics student building backend systems, distributed infrastructure, and production AI applications.",
  applicationName: "Muhammad Sharif Portfolio",
  authors: [{ name: "Muhammad Sharif", url: siteUrl }],
  creator: "Muhammad Sharif",
  publisher: "Muhammad Sharif",
  keywords: [
    "Muhammad Sharif",
    "software engineer",
    "backend engineer",
    "computer science",
    "mathematics",
    "FastAPI",
    "Python",
    "PostgreSQL",
    "distributed systems",
    "portfolio",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Muhammad Sharif",
    title: "Muhammad Sharif — Software Engineer | CS + Mathematics",
    description:
      "Backend systems, distributed infrastructure, production AI applications, and mathematical systems.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Muhammad Sharif — Software Engineer portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Muhammad Sharif — Software Engineer | CS + Mathematics",
    description:
      "Backend systems, distributed infrastructure, production AI applications, and mathematical systems.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
