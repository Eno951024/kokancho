import Link from "next/link";
import { Suspense } from "react";
import { ItemThumb, KindBadge } from "@/components/item-parts";
import { requireAdmin } from "@/lib/auth";
import { getItems } from "@/lib/items";
import { itemTitle, KIND_LABEL, type Item, type ItemKind } from "@/lib/types";
import { cx } from "@/lib/cx";
import { signOut } from "./actions";
import styles from "./admin.module.scss";
import { StatusSelect } from "./status-select";

export default function AdminPage() {
  return (
    <Suspense fallback={<p className={styles.loading}>불러오는 중…</p>}>
      <AdminItems />
    </Suspense>
  );
}

async function AdminItems() {
  const admin = await requireAdmin();
  const items = await getItems();

  return (
    <div className={styles.page}>
      <div className={styles.top}>
        <div className={styles.topText}>
          <h1 className={styles.title}>굿즈 관리</h1>
          <p className={styles.email}>{admin.email}</p>
        </div>
        <div className={styles.topActions}>
          <form action={signOut}>
            <button className={styles.logout}>로그아웃</button>
          </form>
          <Link href="/admin/items/new" className={styles.newButton}>
            + 새로 등록
          </Link>
        </div>
      </div>

      {(["yuzuri", "motome"] as const).map((kind) => (
        <ItemSection key={kind} kind={kind} items={items.filter((i) => i.kind === kind)} />
      ))}
    </div>
  );
}

function ItemSection({ kind, items }: { kind: ItemKind; items: Item[] }) {
  const label = kind === "yuzuri" ? "내놓을 것" : "원하는 것";
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>
        <KindBadge kind={kind} /> {label} <span className={styles.count}>{items.length}건</span>
      </h2>
      {items.length === 0 ? (
        <p className={styles.empty}>
          아직 {KIND_LABEL[kind]} 굿즈가 없습니다.
        </p>
      ) : (
        <ul className={styles.list}>
          {items.map((item) => (
            <li
              key={item.id}
              className={cx(styles.row, item.status === "done" && styles.rowDone)}
            >
              <ItemThumb item={item} className={styles.thumb} />
              <Link href={`/admin/items/${item.id}/edit`} className={styles.rowLink}>
                <p className={styles.rowTitle}>{itemTitle(item)}</p>
                <p className={styles.rowMeta}>
                  {item.event ? `${item.genre} · ${item.event}` : item.genre}
                </p>
                <p className={styles.rowViews}>조회 {item.viewCount.toLocaleString()}</p>
              </Link>
              <StatusSelect id={item.id} status={item.status} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
