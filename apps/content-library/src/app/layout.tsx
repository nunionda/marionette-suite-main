import "./globals.css";

export const metadata = {
  title: "Content Library · Marionette",
  description: "완성작 카탈로그 · 영화 · 드라마 · 광고 · 유튜브",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
