import type { Item } from "@/lib/types";
import type { Suggestions } from "./item-form";

/** 이미 등록한 굿즈에서 자동완성 후보를 모은다 (자주 쓴 순) */
export function buildSuggestions(items: Item[]): Suggestions {
  const rank = (values: string[]) => {
    const count = new Map<string, number>();
    values.filter(Boolean).forEach((v) => count.set(v, (count.get(v) ?? 0) + 1));
    return [...count.entries()].sort((a, b) => b[1] - a[1]).map(([v]) => v);
  };
  return {
    genres: rank(items.map((i) => i.genre)),
    events: rank(items.map((i) => i.event ?? "")),
    goodsTypes: rank(items.map((i) => i.goodsType)),
    tags: rank(items.flatMap((i) => i.tags)),
  };
}
