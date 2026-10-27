import { cx } from "@/lib/cx";
import { KIND_LABEL, STATUS_LABEL, type Item, type ItemKind, type ItemStatus } from "@/lib/types";
import styles from "./item-parts.module.scss";

/** 譲 / 求 라벨. 색과 글자를 같이 써서 색만으로 구분하지 않게 한다 */
export function KindBadge({ kind, className }: { kind: ItemKind; className?: string }) {
  return (
    <span className={cx(styles.badge, kind === "yuzuri" ? styles.yuzuri : styles.motome, className)}>
      {KIND_LABEL[kind]}
    </span>
  );
}

export function StatusBadge({ status }: { status: ItemStatus }) {
  if (status === "available") return null;
  return (
    <span className={cx(styles.badge, status === "trading" ? styles.trading : styles.done)}>
      {STATUS_LABEL[status]}
    </span>
  );
}

/**
 * 사진. 없으면 굿즈 종류를 적은 자리표시 블록을 보여준다.
 * 크기와 모서리는 쓰는 쪽에서 className 으로 정한다.
 */
export function ItemThumb({ item, className }: { item: Item; className?: string }) {
  if (item.imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={item.imageUrl} alt={`${item.genre} ${item.goodsType}`} className={cx(styles.image, className)} />
    );
  }
  return (
    <div
      className={cx(
        styles.placeholder,
        item.kind === "yuzuri" ? styles.placeholderYuzuri : styles.placeholderMotome,
        className,
      )}
    >
      {item.goodsType}
    </div>
  );
}
