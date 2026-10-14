import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://sharifwaqas.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Muhammad Sharif — AI Systems Engineer | CS + Mathematics",
    template: "%s | Muhammad Sharif",
  },
  description:
    "Muhammad Sharif is a Computer Science and Mathematics student focused on AI systems engineering: multimodal model orchestration, reliable backend infrastructure, observability, and distributed systems.",
  applicationName: "Muhammad Sharif Portfolio",
  authors: [{ name: "Muhammad Sharif", url: siteUrl }],
  creator: "Muhammad Sharif",
  publisher: "Muhammad Sharif",
  keywords: [
    "Muhammad Sharif",
    "AI systems engineer",
    "AI infrastructure",
    "model orchestration",
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
    title: "Muhammad Sharif — AI Systems Engineer | CS + Mathematics",
    description:
      "Model orchestration, validated AI outputs, backend reliability, observability, and mathematical systems.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Muhammad Sharif — AI Systems Engineer portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Muhammad Sharif — AI Systems Engineer | CS + Mathematics",
    description:
      "Model orchestration, validated AI outputs, backend reliability, observability, and mathematical systems.",
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

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Muhammad Sharif",
  url: siteUrl,
  sameAs: [
    "https://github.com/SharifWaqas",
    "https://www.linkedin.com/in/muhammad-sharif-77494139b",
  ],
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "University of Southern Mississippi",
  },
  knowsAbout: [
    "AI Systems Engineering",
    "AI Model Orchestration",
    "Observability",
    "Backend Engineering",
    "Distributed Systems",
    "Python",
    "FastAPI",
    "PostgreSQL",
    "Docker",
    "Computer Science",
    "Mathematics",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        {children}
      </body>
    </html>
  );
}
