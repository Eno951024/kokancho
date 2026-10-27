/** 譲 = 내놓을 것 / 求 = 원하는 것 */
export type ItemKind = "yuzuri" | "motome";

/** 교환 상태 */
export type ItemStatus = "available" | "trading" | "done";

export type Item = {
  id: string;
  kind: ItemKind;
  /** 필수: 장르명 (작품·게임 타이틀) */
  genre: string;
  /** 선택: 받은 행사명 */
  event?: string;
  /** 필수: 굿즈 종류 (아크릴 스탠드, 캔뱃지 등) */
  goodsType: string;
  /** 선택: 캐릭터명·그림 종류 등 */
  variant?: string;
  quantity: number;
  tags: string[];
  note?: string;
  status: ItemStatus;
  imageUrl?: string;
  /** Storage 안의 사진 경로 (관리 화면에서 사용) */
  imagePath?: string;
  /** 상세 화면 조회수 */
  viewCount: number;
  createdAt: string;
  /** 마지막으로 내용·상태를 바꾼 시각 (ISO). 조회수 증가는 포함하지 않는다 */
  updatedAt: string;
};

export const KIND_LABEL: Record<ItemKind, string> = {
  yuzuri: "譲",
  motome: "求",
};

export const STATUS_LABEL: Record<ItemStatus, string> = {
  available: "交換可",
  trading: "交換中",
  done: "交換済",
};

export function itemTitle(item: Pick<Item, "goodsType" | "variant">) {
  return item.variant ? `${item.goodsType}（${item.variant}）` : item.goodsType;
}
