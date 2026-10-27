import Link from "next/link";
import styles from "./not-found.module.scss";

export default function NotFound() {
  return (
    <main className={styles.main}>
      <p className={styles.title}>ページが見つかりません</p>
      <p className={styles.text}>削除されたか、URLが間違っている可能性があります。</p>
      <Link href="/" className={styles.back}>
        一覧に戻る
      </Link>
    </main>
  );
}
