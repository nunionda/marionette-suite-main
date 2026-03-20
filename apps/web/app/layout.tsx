import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../lib/auth-context";

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
    <html lang="en" className="dark">
      <body className="bg-gray-950 text-white antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
