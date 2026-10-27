import Link from "next/link";
import { cx } from "@/lib/cx";
import { itemTitle, type Item } from "@/lib/types";
import styles from "./item-card.module.scss";
import { ItemThumb, KindBadge, StatusBadge } from "./item-parts";

export function ItemCard({ item }: { item: Item }) {
  return (
    <Link href={`/items/${item.id}`} className={cx(styles.card, item.status === "done" && styles.done)}>
      <div className={styles.photo}>
        <ItemThumb item={item} className={styles.thumb} />
        <div className={styles.badges}>
          <KindBadge kind={item.kind} />
          <StatusBadge status={item.status} />
        </div>
      </div>
      <div className={styles.body}>
        <p className={styles.genre}>{item.genre}</p>
        <p className={styles.title}>{itemTitle(item)}</p>
        {item.event && <p className={styles.event}>{item.event}</p>}
      </div>
    </Link>
  );
}
