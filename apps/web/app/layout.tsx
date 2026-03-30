import type { Metadata } from "next";
import { Anton, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../lib/auth-context";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Marionette Studio",
  description: "AI Film Production Pipeline",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${anton.variable} ${geistMono.variable}`}>
      <body
        className="antialiased"
        style={{ fontFamily: "var(--font-geist-mono), monospace" }}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
