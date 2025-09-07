import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "The Bench - USports Basketball Statistics & Fantasy",
  description: "Your gateway to USports basketball statistics in a fun and engaging way. Sports parlay creation and fantasy sports platform.",
  keywords: ["Canadian university sports", "sports betting", "fantasy sports", "basketball", "football", "hockey", "campus sports", "university betting", "The Bench"],
  authors: [{ name: "The Bench" }],
  creator: "The Bench",
  publisher: "The Bench",
  category: "Sports & Recreation",
  openGraph: {
    title: "The Bench - USports Basketball Statistics & Fantasy",
    description: "Your gateway to USports basketball statistics in a fun and engaging way. Sports parlay creation and fantasy sports platform.",
    url: defaultUrl,
    siteName: "The Bench",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "The Bench - USports Basketball Statistics & Fantasy",
        type: "image/png",
      },
    ],
    locale: "en_CA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Bench - USports Basketball Statistics & Fantasy",
    description: "Your gateway to USports basketball statistics in a fun and engaging way. Sports parlay creation and fantasy sports platform.",
    images: ["/opengraph-image.png"],
    creator: "@thebench",
    site: "@thebench",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
