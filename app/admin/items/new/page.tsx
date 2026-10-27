import type { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { getItems } from "@/lib/items";
import { ItemForm } from "../../item-form";
import { buildSuggestions } from "../../suggestions";
import styles from "../../admin.module.scss";

export const metadata: Metadata = { title: "새 굿즈 등록" };

export default function NewItemPage() {
  return (
    <Suspense fallback={<p className={styles.loading}>불러오는 중…</p>}>
      <NewItem />
    </Suspense>
  );
}

async function NewItem() {
  await requireAdmin();
  const items = await getItems();
  // 화면 상태가 유지되는 구조라서, 들어올 때마다 빈 폼이 되도록 매번 새 key 를 준다
  return <ItemForm key={crypto.randomUUID()} suggestions={buildSuggestions(items)} />;
}
