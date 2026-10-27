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
  const updatedAt = items.map((i) => i.createdAt).sort().at(-1);

  return (
    <>
      <ItemBrowser items={items} />
      {updatedAt && <p className={styles.updated}>最終更新 {updatedAt}</p>}
    </>
  );
}
