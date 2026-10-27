import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ItemThumb, KindBadge, StatusBadge } from "@/components/item-parts";
import { DetailSkeleton } from "@/components/skeletons";
import { TradeRequest } from "@/components/trade-request";
import { ViewCounter } from "@/components/view-counter";
import { getItem, getItems } from "@/lib/items";
import { listHref } from "@/lib/list-filters";
import { itemTitle } from "@/lib/types";
import styles from "./page.module.scss";

export async function generateMetadata({ params }: PageProps<"/items/[id]">): Promise<Metadata> {
  const { id } = await params;
  const item = await getItem(id);
  return { title: item ? `${item.genre} ${itemTitle(item)}` : "見つかりません" };
}

export default function ItemPage({ params }: PageProps<"/items/[id]">) {
  return (
    <main className={styles.main}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.back}>
          ← 一覧に戻る
        </Link>
      </nav>
      {/* 굿즈 정보는 접속할 때마다 Supabase 에서 읽어 온다 */}
      <Suspense fallback={<DetailSkeleton />}>
        {params.then(({ id }) => (
          <ItemDetail id={id} />
        ))}
      </Suspense>
    </main>
  );
}

async function ItemDetail({ id }: { id: string }) {
  const item = await getItem(id);
  if (!item) notFound();

  // 求 굿즈에 신청할 때 고를 수 있는 내 譲 목록
  const suggestions =
    item.kind === "motome"
      ? (await getItems())
          .filter((i) => i.kind === "yuzuri" && i.status === "available")
          .map((i) => `${i.genre} ${itemTitle(i)}`)
      : [];

  return (
    <>
      <div className={styles.photo}>
        <ItemThumb item={item} className={styles.thumb} />
      </div>

      <article className={styles.article}>
        <div className={styles.heading}>
          <div className={styles.badges}>
            <KindBadge kind={item.kind} />
            <StatusBadge status={item.status} />
            <ViewCounter itemId={item.id} initial={item.viewCount} className={styles.views} />
          </div>
          <p className={styles.genre}>{item.genre}</p>
          <h1 className={styles.title}>{itemTitle(item)}</h1>
        </div>

        <dl className={styles.info}>
          <dt>タイトル</dt>
          <dd>
            <Link href={listHref({ kind: item.kind, genre: item.genre })} className={styles.infoLink}>
              {item.genre}
            </Link>
          </dd>
          {item.event && (
            <>
              <dt>イベント</dt>
              <dd>{item.event}</dd>
            </>
          )}
          <dt>種類</dt>
          <dd>
            <Link href={listHref({ kind: item.kind, type: item.goodsType })} className={styles.infoLink}>
              {item.goodsType}
            </Link>
          </dd>
          <dt>数量</dt>
          <dd>{item.quantity}</dd>
        </dl>

        {item.tags.length > 0 && (
          <ul className={styles.tags}>
            {item.tags.map((tag) => (
              <li key={tag}>
                <Link href={listHref({ kind: item.kind, tag })} className={styles.tag}>
                  #{tag}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {item.note && <p className={styles.note}>{item.note}</p>}
      </article>

      <TradeRequest item={item} suggestions={suggestions} />
    </>
  );
}
