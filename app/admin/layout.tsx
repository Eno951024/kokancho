import type { Metadata } from "next";
import Link from "next/link";
import styles from "./admin.module.scss";

export const metadata: Metadata = {
  title: { default: "관리", template: "%s｜kokancho 관리" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link href="/admin" className={styles.brand}>
          kokancho <span className={styles.accent}>관리</span>
        </Link>
        <Link href="/" className={styles.siteLink}>
          사이트 보기 →
        </Link>
      </header>
      {children}
    </div>
  );
}
