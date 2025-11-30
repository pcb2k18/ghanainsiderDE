import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Ghana Insider - Aktuelle Nachrichten aus Ghana",
    template: "%s | Ghana Insider",
  },
  description: "Ihre Quelle für aktuelle Nachrichten, Promi-News und Breaking Stories aus Ghana und der Welt.",
  keywords: ["Ghana", "Nachrichten", "News", "Breaking News", "Promi", "Tod", "Hochzeit"],
  authors: [{ name: "Ghana Insider" }],
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: "https://ghanainsider.com",
    siteName: "Ghana Insider",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="de">
        <body className="antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
