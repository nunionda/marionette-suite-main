import "./globals.css";

export const metadata = {
  title: "Post Studio · Marionette",
  description: "Post-production workspace — edit · VFX · sound · color · delivery",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
