import type { ItemKind } from "./types";

/** 목록 화면의 필터. URL 쿼리(/?kind=…&type=…&tag=…)로 주고받는다 */
export type ListFilters = {
  kind: ItemKind;
  genre: string;
  /** 굿즈 종류 (goodsType) */
  type: string;
  tag: string;
};

/** 필터 조건으로 목록 화면의 주소를 만든다. 비어 있는 조건과 기본값(譲)은 생략한다 */
export function listHref(filters: Partial<ListFilters>) {
  const params = new URLSearchParams();
  if (filters.kind === "motome") params.set("kind", "motome");
  if (filters.genre) params.set("genre", filters.genre);
  if (filters.type) params.set("type", filters.type);
  if (filters.tag) params.set("tag", filters.tag);
  const query = params.toString();
  return query ? `/?${query}` : "/";
}
