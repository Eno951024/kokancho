"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { listHref, type ListFilters } from "@/lib/list-filters";
import { KIND_LABEL, type Item, type ItemKind } from "@/lib/types";
import { cx } from "@/lib/cx";
import styles from "./item-browser.module.scss";
import { ItemCard } from "./item-card";

const KIND_HINT: Record<ItemKind, string> = {
  yuzuri: "お譲りできるもの",
  motome: "探しているもの",
};

/** 처음에 보여줄 태그 수. 나머지는 「もっと見る」로 펼친다 */
const TAG_LIMIT = 8;

/** 태그를 많이 쓰인 순으로 정렬한다. 교환이 끝난 굿즈의 태그는 세지 않아 뒤로 간다 */
function rankTags(items: Item[]) {
  const count = new Map<string, number>();
  for (const item of items) {
    for (const t of item.tags) {
      count.set(t, (count.get(t) ?? 0) + (item.status === "done" ? 0 : 1));
    }
  }
  return [...count.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ja"))
    .map(([t]) => t);
}

function uniqueSorted(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, "ja"));
}

export function ItemBrowser({ items }: { items: Item[] }) {
  // 譲/求·타이틀·종류·태그는 URL 에 둔다. 상세 화면의 태그 링크로 걸러진 목록을 열 수 있고, 뒤로 가기도 자연스럽다
  const searchParams = useSearchParams();
  const router = useRouter();
  const kind: ItemKind = searchParams.get("kind") === "motome" ? "motome" : "yuzuri";
  const genre = searchParams.get("genre") ?? "";
  const type = searchParams.get("type") ?? "";
  const tag = searchParams.get("tag") ?? "";

  // 검색어와 交換済み 표시는 이 화면 안에서만 쓰는 상태
  const [query, setQuery] = useState("");
  const [showDone, setShowDone] = useState(false);

  function update(next: Partial<ListFilters>) {
    router.replace(listHref({ kind, genre, type, tag, ...next }), { scroll: false });
  }

  const ofKind = useMemo(() => items.filter((i) => i.kind === kind), [items, kind]);
  const genres = useMemo(() => uniqueSorted(ofKind.map((i) => i.genre)), [ofKind]);
  const types = useMemo(() => uniqueSorted(ofKind.map((i) => i.goodsType)), [ofKind]);
  // URL 로 받은 태그가 이 탭에 없어도 칩이 보이도록 같이 넣는다 (눌러서 해제할 수 있게)
  const rankedTags = useMemo(() => rankTags(ofKind), [ofKind]);
  const [showAllTags, setShowAllTags] = useState(false);
  const visibleTags = useMemo(() => {
    const list = showAllTags ? rankedTags : rankedTags.slice(0, TAG_LIMIT);
    // 지금 고른 태그는 순위가 낮거나 이 탭에 없어도 항상 보이게 한다 (눌러서 해제할 수 있도록)
    return tag && !list.includes(tag) ? [...list, tag] : list;
  }, [rankedTags, showAllTags, tag]);
  const hiddenTagCount = Math.max(0, rankedTags.length - TAG_LIMIT);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ofKind
      .filter((i) => showDone || i.status !== "done")
      .filter((i) => !genre || i.genre === genre)
      .filter((i) => !type || i.goodsType === type)
      .filter((i) => !tag || i.tags.includes(tag))
      .filter((i) => {
        if (!q) return true;
        const haystack = [i.genre, i.event ?? "", i.goodsType, i.variant ?? "", i.note ?? "", ...i.tags].join(" ").toLowerCase();
        return haystack.includes(q);
      })
      // 교환 완료는 맨 뒤로
      .sort((a, b) => Number(a.status === "done") - Number(b.status === "done"));
  }, [ofKind, query, genre, type, tag, showDone]);

  const doneCount = ofKind.filter((i) => i.status === "done").length;
  const filtered = Boolean(query || genre || type || tag);

  function switchKind(next: ItemKind) {
    update({ kind: next, genre: "", type: "", tag: "" });
  }

  function reset() {
    setQuery("");
    update({ genre: "", type: "", tag: "" });
  }

  return (
    <section className={styles.section}>
      {/* 譲 / 求 탭 */}
      <div role="tablist" aria-label="リストの種類" className={styles.tabs}>
        {(["yuzuri", "motome"] as const).map((k) => {
          const active = kind === k;
          const count = items.filter((i) => i.kind === k && i.status !== "done").length;
          return (
            <button
              key={k}
              role="tab"
              aria-selected={active}
              onClick={() => switchKind(k)}
              className={cx(styles.tab, active && styles.tabActive, active && (k === "yuzuri" ? styles.tabYuzuri : styles.tabMotome))}
            >
              <span className={styles.tabLabel}>
                {KIND_LABEL[k]} <span className={styles.tabCount}>{count}</span>
              </span>
              <span className={styles.tabHint}>{KIND_HINT[k]}</span>
            </button>
          );
        })}
      </div>

      {/* 검색과 필터 */}
      <div className={styles.filters}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="タイトル名・イベント名・グッズの種類で検索"
          className={styles.search}
        />
        <div className={styles.chips}>
          <FilterSelect label="タイトル" value={genre} options={genres} onChange={(v) => update({ genre: v })} />
          <FilterSelect label="種類" value={type} options={types} onChange={(v) => update({ type: v })} />
          {filtered && (
            <button onClick={reset} className={styles.textButton}>
              クリア
            </button>
          )}
        </div>
        {visibleTags.length > 0 && (
          <div className={styles.tagList} aria-label="タグで絞り込む">
            {visibleTags.map((t) => (
              <button
                key={t}
                aria-pressed={tag === t}
                onClick={() => update({ tag: tag === t ? "" : t })}
                className={cx(styles.tag, tag === t && styles.tagActive)}
              >
                #{t}
              </button>
            ))}
            {hiddenTagCount > 0 && (
              <button onClick={() => setShowAllTags((v) => !v)} className={styles.textButton}>
                {showAllTags ? "閉じる" : `もっと見る（+${hiddenTagCount}）`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* 목록 */}
      {visible.length > 0 ? (
        <div className={styles.grid}>
          {visible.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className={styles.empty}>条件に合うグッズがありません。</p>
      )}

      {doneCount > 0 && (
        <button onClick={() => setShowDone((v) => !v)} className={styles.toggleDone}>
          {showDone ? "交換済みを隠す" : `交換済み ${doneCount}件を表示`}
        </button>
      )}
    </section>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label
      className={cx(styles.filter, value && styles.filterActive)}
    >
      <span>{value || label} ▾</span>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={styles.filterSelect}
      >
        <option value="">すべての{label}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
