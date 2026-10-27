import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { getItems } from "@/lib/items";
import { ItemForm } from "../../../item-form";
import { buildSuggestions } from "../../../suggestions";
import styles from "../../../admin.module.scss";

export const metadata: Metadata = { title: "굿즈 수정" };

export default function EditItemPage({ params }: PageProps<"/admin/items/[id]/edit">) {
  return (
    <Suspense fallback={<p className={styles.loading}>불러오는 중…</p>}>
      {params.then(({ id }) => (
        <EditItem id={id} />
      ))}
    </Suspense>
  );
}

async function EditItem({ id }: { id: string }) {
  await requireAdmin();
  const items = await getItems();
  const item = items.find((i) => i.id === id);
  if (!item) notFound();

  // 같은 화면에서 다시 저장할 때 폼이 예전 값으로 남지 않도록 key 를 둔다
  return <ItemForm key={`${item.id}-${item.status}`} item={item} suggestions={buildSuggestions(items)} />;
}
