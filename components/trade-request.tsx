"use client";

import { useEffect, useId, useState } from "react";
import { buildDmText, buildDmUrl } from "@/lib/dm";
import { siteConfig } from "@/lib/site-config";
import { cx } from "@/lib/cx";
import type { Item } from "@/lib/types";
import styles from "./trade-request.module.scss";

type Props = {
  item: Item;
  /** 求 아이템일 때, 방문자가 고를 수 있는 내 譲 목록 */
  suggestions: string[];
};

export function TradeRequest({ item, suggestions }: Props) {
  const [open, setOpen] = useState(false);
  const done = item.status === "done";
  const label = item.kind === "yuzuri" ? "DMで交換を申し込む" : "持っています（DMで連絡）";

  return (
    <>
      <div className={styles.bar}>
        <div className={styles.barInner}>
          <button
            onClick={() => setOpen(true)}
            disabled={done}
            className={cx(styles.cta, item.kind === "yuzuri" ? styles.yuzuri : styles.motome)}
          >
            {done ? "交換済みです" : label}
          </button>
        </div>
      </div>
      {open && <TradeSheet item={item} suggestions={suggestions} onClose={() => setOpen(false)} />}
    </>
  );
}

function TradeSheet({ item, suggestions, onClose }: Props & { onClose: () => void }) {
  const [counterpart, setCounterpart] = useState("");
  const [copied, setCopied] = useState(false);
  // 「XのDMを開く」를 눌렀을 때의 복사 결과. X 가 주소로 넘긴 문장을 넣어주지 않아서 붙여넣기 안내에 쓴다
  const [dmCopy, setDmCopy] = useState<"idle" | "ok" | "fail">("idle");
  const titleId = useId();
  const listId = useId();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const pageUrl = typeof window === "undefined" ? "" : window.location.origin + window.location.pathname;
  const text = buildDmText({ item, counterpart, pageUrl });
  const dmUrl = siteConfig.xUserId ? buildDmUrl(siteConfig.xUserId, text) : "";

  async function writeClipboard() {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  async function copy() {
    const ok = await writeClipboard();
    setCopied(ok);
    if (ok) setTimeout(() => setCopied(false), 2000);
  }

  // 링크 기본 동작(새 탭으로 X 열기)은 그대로 두고, 같은 클릭에서 문장을 복사해 둔다
  function onOpenDm() {
    void writeClipboard().then((ok) => setDmCopy(ok ? "ok" : "fail"));
  }

  const isYuzuri = item.kind === "yuzuri";

  return (
    <div className={styles.overlay}>
      <button aria-label="閉じる" onClick={onClose} className={styles.backdrop} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={styles.sheet}
      >
        <div aria-hidden className={styles.handle} />
        <div className={styles.head}>
          <h2 id={titleId} className={styles.title}>
            {isYuzuri ? "交換を申し込む" : "持っていることを伝える"}
          </h2>
          <button onClick={onClose} className={styles.close}>
            閉じる
          </button>
        </div>

        <label className={styles.group}>
          <span className={styles.label}>{isYuzuri ? "お譲りいただけるもの" : "ご希望のもの（任意）"}</span>
          <input
            value={counterpart}
            onChange={(e) => setCounterpart(e.target.value)}
            list={isYuzuri ? undefined : listId}
            placeholder={isYuzuri ? "例：タイトル名 アクリルスタンド（キャラ名）" : "譲リストから選ぶか自由に入力"}
            className={styles.input}
          />
          {!isYuzuri && (
            <datalist id={listId}>
              {suggestions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          )}
        </label>

        <div className={styles.group}>
          <span className={styles.label}>送信される文章</span>
          <pre className={styles.preview}>
            {text}
          </pre>
          <p className={styles.note}>
            「XのDMを開く」を押すと、この文章が自動でコピーされます。DM画面で貼り付け（⌘+V / Ctrl+V / 長押し）してから送信してください。
          </p>
        </div>

        <div className={styles.actions}>
          <button onClick={copy} className={styles.copy}>
            {copied ? "コピーしました" : "文章をコピー"}
          </button>
          {dmUrl ? (
            <a
              href={dmUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onOpenDm}
              className={cx(styles.dm, isYuzuri ? styles.yuzuri : styles.motome)}
            >
              XのDMを開く
            </a>
          ) : (
            <span className={styles.noId}>X IDが未設定です</span>
          )}
        </div>

        {dmCopy !== "idle" && (
          <p role="status" className={cx(styles.copyResult, dmCopy === "fail" && styles.copyFail)}>
            {dmCopy === "ok"
              ? "✓ 文章をコピーしました。DM画面に貼り付けて送信してください。"
              : "文章をコピーできませんでした。上の文章を選択してコピーしてください。"}
          </p>
        )}
      </div>
    </div>
  );
}
