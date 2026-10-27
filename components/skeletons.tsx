import { cx } from "@/lib/cx";
import styles from "./skeletons.module.scss";

/** 데이터를 읽는 동안 보여주는 자리표시 */
export function ListSkeleton() {
  return (
    <div aria-busy="true" aria-label="読み込み中" className={styles.list}>
      <div className={cx(styles.block, styles.tabs)} />
      <div className={cx(styles.block, styles.search)} />
      <div className={styles.grid}>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className={cx(styles.block, styles.card)} />
        ))}
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="読み込み中" className={styles.detail}>
      <div className={cx(styles.block, styles.photo)} />
      <div className={cx(styles.block, styles.line, styles.short)} />
      <div className={cx(styles.block, styles.line, styles.medium)} />
      <div className={cx(styles.block, styles.box)} />
    </div>
  );
}
