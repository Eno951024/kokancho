import { itemTitle, type Item } from "./types";

type DmInput = {
  item: Item;
  /** 방문자가 내놓을 것(譲 아이템일 때) 또는 원하는 것(求 아이템일 때) */
  counterpart: string;
  pageUrl: string;
};

/** X DM에 미리 넣을 문장을 만든다 */
export function buildDmText({ item, counterpart, pageUrl }: DmInput) {
  const target = `${item.genre}「${itemTitle(item)}」${item.event ? `（${item.event}）` : ""}`;
  const other = counterpart.trim() || "ご相談させてください";

  const lines =
    item.kind === "yuzuri"
      ? ["はじめまして。kokanchoを見てご連絡しました。", "", `【求】${target}`, `【譲】${other}`]
      : ["はじめまして。kokanchoを見てご連絡しました。", "お探しのグッズを持っています。", "", `【譲】${target}`, `【求】${other}`];

  return [...lines, "", pageUrl, "", "よろしくお願いいたします。"].join("\n");
}

/** 문장이 채워진 X DM 작성 화면의 URL */
export function buildDmUrl(xUserId: string, text: string) {
  // URLSearchParams 는 공백을 "+" 로 바꾸므로 encodeURIComponent 를 쓴다
  return `https://x.com/messages/compose?recipient_id=${encodeURIComponent(xUserId)}&text=${encodeURIComponent(text)}`;
}
