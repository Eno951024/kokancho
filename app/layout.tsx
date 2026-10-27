import type { Metadata, Viewport } from "next";
import "./globals.scss";

export const metadata: Metadata = {
  title: {
    default: "kokancho｜グッズ交換リスト",
    template: "%s｜kokancho",
  },
  description: "イベントでいただいたノベルティ・グッズの交換リストです。",
};

export const viewport: Viewport = {
  themeColor: "#f4f6f9",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
