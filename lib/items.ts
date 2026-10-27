import { createPublicClient, ITEM_IMAGE_BUCKET } from "./supabase/public";
import type { Item, ItemKind, ItemStatus } from "./types";

/** items 테이블의 한 행 (DB는 snake_case) */
type ItemRow = {
  id: string;
  kind: ItemKind;
  genre: string;
  event: string | null;
  goods_type: string;
  variant: string | null;
  quantity: number;
  tags: string[];
  note: string | null;
  status: ItemStatus;
  image_path: string | null;
  /** 조회수. SQL 을 실행하기 전에는 컬럼이 없어서 undefined */
  view_count?: number;
  created_at: string;
  updated_at: string;
};

// view_count 컬럼이 아직 없어도 에러가 나지 않도록 전체(*)를 읽는다
const COLUMNS = "*";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function toItem(row: ItemRow, imageUrlOf: (path: string) => string): Item {
  return {
    id: row.id,
    kind: row.kind,
    genre: row.genre,
    event: row.event ?? undefined,
    goodsType: row.goods_type,
    variant: row.variant ?? undefined,
    quantity: row.quantity,
    tags: row.tags,
    note: row.note ?? undefined,
    status: row.status,
    imageUrl: row.image_path ? imageUrlOf(row.image_path) : undefined,
    imagePath: row.image_path ?? undefined,
    viewCount: row.view_count ?? 0,
    createdAt: row.created_at.slice(0, 10),
    updatedAt: row.updated_at ?? row.created_at,
  };
}

export async function getItems(): Promise<Item[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("items")
    .select(COLUMNS)
    .order("created_at", { ascending: false })
    .returns<ItemRow[]>();
  if (error) throw new Error(`굿즈 목록을 불러오지 못했습니다: ${error.message}`);

  const imageUrlOf = (path: string) => supabase.storage.from(ITEM_IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
  return (data ?? []).map((row) => toItem(row, imageUrlOf));
}

export async function getItem(id: string): Promise<Item | undefined> {
  // uuid 형식이 아니면 DB가 에러를 내므로 먼저 걸러서 「없음」으로 처리한다
  if (!UUID_PATTERN.test(id)) return undefined;

  const supabase = createPublicClient();
  const { data, error } = await supabase.from("items").select(COLUMNS).eq("id", id).maybeSingle<ItemRow>();
  if (error) throw new Error(`굿즈를 불러오지 못했습니다: ${error.message}`);
  if (!data) return undefined;

  const imageUrlOf = (path: string) => supabase.storage.from(ITEM_IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
  return toItem(data, imageUrlOf);
}
