import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "DevHelp AI — Debug Any Error in Seconds",
  description:
    "Paste any error, stack trace, log, SQL query, or JSON. Get instant root cause analysis and fix suggestions powered by AI.",
  keywords: [
    "debugging",
    "AI debugging",
    "error analysis",
    "stack trace analyzer",
    "SQL debugger",
    "JSON debugger",
    "log parser",
    "developer tools",
  ],
  openGraph: {
    title: "DevHelp AI — Debug Any Error in Seconds",
    description:
      "Paste any error. Get the root cause and fix instantly. Supports stack traces, logs, SQL, JSON, and API errors.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevHelp AI — Debug Any Error in Seconds",
    description:
      "Paste any error. Get the root cause and fix instantly.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
