import { Suspense } from "react";
import { ItemBrowser } from "@/components/item-browser";
import { ProfileHeader } from "@/components/profile-header";
import { ListSkeleton } from "@/components/skeletons";
import { getItems } from "@/lib/items";
import styles from "./page.module.scss";

export default function Home() {
  return (
    <main className={styles.main}>
      <ProfileHeader />
      {/* 목록은 접속할 때마다 Supabase 에서 읽어 온다. 읽는 동안은 스켈레톤을 보여준다 */}
      <Suspense fallback={<ListSkeleton />}>
        <ItemsSection />
      </Suspense>
    </main>
  );
}

async function ItemsSection() {
  const items = await getItems();
  // 등록·수정·상태 변경 중 가장 최근 시각. 일본 날짜로 표시한다
  const latest = items.map((i) => i.updatedAt).sort().at(-1);
  const updatedAt = latest && toJstDate(latest);

  return (
    <>
      <ItemBrowser items={items} />
      {updatedAt && <p className={styles.updated}>最終更新 {updatedAt}</p>}
    </>
  );
}

const jstDate = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" });

/** "2026-10-27T15:00:00+00:00" → "2026-10-28" (일본 시간 기준 YYYY-MM-DD) */
function toJstDate(iso: string) {
  return jstDate.format(new Date(iso));
}
