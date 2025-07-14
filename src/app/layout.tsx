import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Track Down - Real-Time Countdown Timer",
  description: "Track Down is a real-time countdown timer app powered by Supabase. Start, pause, resume, and reset your countdown with live updates.",
  metadataBase: new URL("https://trackdown.example.com"), // Update to your real domain
  openGraph: {
    title: "Track Down - Real-Time Countdown Timer",
    description: "Track Down is a real-time countdown timer app powered by Supabase. Start, pause, resume, and reset your countdown with live updates.",
    url: "https://trackdown.example.com/",
    siteName: "Track Down",
    images: [
      {
        url: "/vercel.svg", // Replace with a real social image if available
        width: 1200,
        height: 630,
        alt: "Track Down Countdown Timer App",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Track Down - Real-Time Countdown Timer",
    description: "Track Down is a real-time countdown timer app powered by Supabase. Start, pause, resume, and reset your countdown with live updates.",
    site: "@yourtwitterhandle", // Update to your Twitter handle
    creator: "@yourtwitterhandle", // Update to your Twitter handle
    images: [
      {
        url: "/vercel.svg", // Replace with a real social image if available
        alt: "Track Down Countdown Timer App",
      },
    ],
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      maxVideoPreview: -1,
      maxImagePreview: "large",
      maxSnippet: -1,
    },
  },
  themeColor: "#171717",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
