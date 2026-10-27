"use client";

import Link from "next/link";
import { useEffect, useId, useState, useTransition } from "react";
import { compressImage, extensionOf } from "@/lib/image";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { ITEM_IMAGE_BUCKET } from "@/lib/supabase/env";
import { STATUS_LABEL, type Item, type ItemKind, type ItemStatus } from "@/lib/types";
import { cx } from "@/lib/cx";
import { deleteItem, discardUploadedImage, saveItem, type ItemInput } from "./actions";
import styles from "./form.module.scss";

export type Suggestions = {
  genres: string[];
  events: string[];
  goodsTypes: string[];
  tags: string[];
};

const PRESET_GOODS_TYPES = [
  "アクリルスタンド",
  "アクリルキーホルダー",
  "缶バッジ",
  "クリアファイル",
  "ステッカー",
  "ポストカード",
  "ブロマイド",
  "ポスター",
  "ショッパー",
];
const PRESET_TAGS = ["ゲームショウ", "コミケ", "企業ブース", "個人ブース"];

type Photo =
  | { type: "keep" } // 기존 사진 그대로
  | { type: "none" } // 사진 없음
  | { type: "new"; file: File; preview: string };

function merge(preset: string[], extra: string[]) {
  return [...new Set([...preset, ...extra])];
}

export function ItemForm({ item, suggestions }: { item?: Item; suggestions: Suggestions }) {
  const editing = Boolean(item);
  const [kind, setKind] = useState<ItemKind>(item?.kind ?? "yuzuri");
  const [genre, setGenre] = useState(item?.genre ?? "");
  const [event, setEvent] = useState(item?.event ?? "");
  const [goodsType, setGoodsType] = useState(item?.goodsType ?? "");
  const [variant, setVariant] = useState(item?.variant ?? "");
  const [quantity, setQuantity] = useState(item?.quantity ?? 1);
  const [tags, setTags] = useState<string[]>(item?.tags ?? []);
  const [note, setNote] = useState(item?.note ?? "");
  const [status, setStatus] = useState<ItemStatus>(item?.status ?? "available");
  const [photo, setPhoto] = useState<Photo>(item?.imageUrl ? { type: "keep" } : { type: "none" });
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const ids = { genre: useId(), event: useId(), goods: useId() };

  // 미리보기용 URL 정리
  useEffect(() => {
    return () => {
      if (photo.type === "new") URL.revokeObjectURL(photo.preview);
    };
  }, [photo]);

  const tagOptions = merge(PRESET_TAGS, suggestions.tags);
  const goodsOptions = merge(PRESET_GOODS_TYPES, suggestions.goodsTypes);

  function onPickFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("이미지 파일을 선택해 주세요.");
      return;
    }
    setPhoto({ type: "new", file, preview: URL.createObjectURL(file) });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      let imagePath: string | null = photo.type === "keep" ? (item?.imagePath ?? null) : null;
      let uploaded: string | null = null;

      if (photo.type === "new") {
        try {
          const blob = await compressImage(photo.file);
          const path = `${crypto.randomUUID()}.${extensionOf(blob)}`;
          const { error: uploadError } = await createBrowserSupabase()
            .storage.from(ITEM_IMAGE_BUCKET)
            .upload(path, blob, { contentType: blob.type, cacheControl: "31536000" });
          if (uploadError) throw new Error(uploadError.message);
          imagePath = uploaded = path;
        } catch (err) {
          setError(`사진을 올리지 못했습니다: ${err instanceof Error ? err.message : String(err)}`);
          return;
        }
      }

      const input: ItemInput = {
        kind,
        genre,
        event,
        goodsType,
        variant,
        quantity,
        tags,
        note,
        status,
        imagePath,
      };
      // 성공하면 서버에서 /admin 으로 이동한다
      const result = await saveItem(item?.id ?? null, input);
      if (result?.error) {
        if (uploaded) await discardUploadedImage(uploaded);
        setError(result.error);
      }
    });
  }

  function remove() {
    if (!item) return;
    if (!confirm("이 굿즈를 삭제할까요? 되돌릴 수 없습니다.")) return;
    startTransition(async () => {
      const result = await deleteItem(item.id);
      if (result?.error) setError(result.error);
    });
  }

  const previewUrl = photo.type === "new" ? photo.preview : photo.type === "keep" ? item?.imageUrl : undefined;

  return (
    <form onSubmit={submit} className={styles.form}>
      <div className={styles.head}>
        <h1 className={styles.title}>{editing ? "굿즈 수정" : "새 굿즈 등록"}</h1>
        <Link href="/admin" className={styles.cancel}>
          취소
        </Link>
      </div>

      {/* 譲 / 求 */}
      <div role="radiogroup" aria-label="종류" className={styles.kinds}>
        {(["yuzuri", "motome"] as const).map((k) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={kind === k}
            onClick={() => setKind(k)}
            className={cx(styles.kind, kind === k && (k === "yuzuri" ? styles.kindYuzuri : styles.kindMotome))}
          >
            {k === "yuzuri" ? "譲 내놓을 것" : "求 원하는 것"}
          </button>
        ))}
      </div>

      {/* 사진 */}
      <Field label="사진">
        <div className={styles.photoRow}>
          <div className={styles.preview}>
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="미리보기" className={styles.previewImage} />
            ) : (
              "사진 없음"
            )}
          </div>
          <div className={styles.photoActions}>
            <label className={styles.pickButton}>
              {previewUrl ? "사진 바꾸기" : "사진 선택·촬영"}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => onPickFile(e.target.files?.[0])}
              />
            </label>
            {previewUrl && (
              <button type="button" onClick={() => setPhoto({ type: "none" })} className={styles.textButton}>
                사진 빼기
              </button>
            )}
          </div>
        </div>
      </Field>

      {/* 필수 3항목 */}
      <Field label="작품명" required>
        <TextInput id={ids.genre} value={genre} onChange={setGenre} list={`${ids.genre}-list`} placeholder="작품·게임 타이틀" />
        <DataList id={`${ids.genre}-list`} options={suggestions.genres} />
      </Field>

      <Field label="받은 행사명 (선택)">
        <TextInput id={ids.event} value={event} onChange={setEvent} list={`${ids.event}-list`} placeholder="예: 東京ゲームショウ2026" />
        <DataList id={`${ids.event}-list`} options={suggestions.events} />
      </Field>

      <Field label="굿즈 종류" required>
        <TextInput id={ids.goods} value={goodsType} onChange={setGoodsType} list={`${ids.goods}-list`} placeholder="예: アクリルスタンド" />
        <DataList id={`${ids.goods}-list`} options={goodsOptions} />
      </Field>

      <Field label="캐릭터명">
        <TextInput value={variant} onChange={setVariant} placeholder="예: キャラ名" />
      </Field>

      <Field label="수량">
          <input
            type="number"
            inputMode="numeric"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
            className={styles.input}
          />
      </Field>

      <Field label="태그">
        <TagInput value={tags} onChange={setTags} options={tagOptions} />
      </Field>

      <Field label="메모">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="예: 未開封です。"
          className={styles.input}
        />
      </Field>

      {editing && (
        <Field label="상태">
          <div className={styles.chipRow}>
            {(Object.keys(STATUS_LABEL) as ItemStatus[]).map((s) => (
              <Pill key={s} active={status === s} onClick={() => setStatus(s)} grow>
                {STATUS_LABEL[s]}
              </Pill>
            ))}
          </div>
        </Field>
      )}

      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}

      <div className={styles.footer}>
        <button
          type="submit"
          disabled={pending}
          className={styles.submit}
        >
          {pending ? "저장 중…" : editing ? "저장" : "등록"}
        </button>
        {editing && (
          <button type="button" onClick={remove} disabled={pending} className={styles.delete}>
            이 굿즈 삭제
          </button>
        )}
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------
// 작은 부품들
// ---------------------------------------------------------------------

/**
 * 태그 입력. 고른 태그는 위에 칩으로 보이고(×로 삭제),
 * 글자를 입력하면 그 글자가 들어간 기존 태그가 입력 칸 아래에 후보로 나온다.
 * - 후보를 누르거나 ↑↓ 로 고르고 Enter → 추가
 * - 후보에 없는 글자를 입력하고 Enter 또는 「추가」 → 새 태그로 추가
 */
function TagInput({
  value,
  onChange,
  options,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  options: string[];
}) {
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();

  const query = draft.trim().replace(/^#/, "");
  const matches = query
    ? options.filter((t) => !value.includes(t) && t.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : [];
  const isNew = query !== "" && !options.includes(query) && !value.includes(query);
  const showList = open && query !== "" && (matches.length > 0 || isNew);

  function add(tag: string) {
    const t = tag.trim().replace(/^#/, "");
    if (t && !value.includes(t)) onChange([...value, t]);
    setDraft("");
    setActive(-1);
  }

  function remove(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.nativeEvent.isComposing) return; // 일본어 변환 중의 Enter 는 무시
    if (e.key === "ArrowDown" && matches.length > 0) {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % matches.length);
    } else if (e.key === "ArrowUp" && matches.length > 0) {
      e.preventDefault();
      setActive((i) => (i <= 0 ? matches.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      add(active >= 0 ? matches[active] : query);
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      remove(value[value.length - 1]);
    }
  }

  return (
    <div className={styles.tagInput}>
      {value.length > 0 && (
        <ul className={styles.chipWrap} aria-label="고른 태그">
          {value.map((t) => (
            <li key={t}>
              <button type="button" onClick={() => remove(t)} className={styles.tagChip} aria-label={`${t} 태그 빼기`}>
                #{t} <span aria-hidden>×</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className={styles.addRow}>
        <div className={styles.comboBox}>
          <input
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setOpen(true);
              setActive(-1);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onKeyDown={onKeyDown}
            placeholder="태그 입력 (예: コミケ)"
            role="combobox"
            aria-expanded={showList}
            aria-controls={listId}
            aria-autocomplete="list"
            className={styles.input}
          />
          {showList && (
            <ul id={listId} role="listbox" className={styles.suggestions}>
              {matches.map((t, i) => (
                <li
                  key={t}
                  role="option"
                  aria-selected={i === active}
                  // blur 보다 먼저 처리되도록 mousedown 에서 추가한다
                  onMouseDown={(e) => {
                    e.preventDefault();
                    add(t);
                  }}
                  className={cx(styles.suggestion, i === active && styles.suggestionActive)}
                >
                  #{t}
                </li>
              ))}
              {isNew && (
                <li
                  role="option"
                  aria-selected={false}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    add(query);
                  }}
                  className={cx(styles.suggestion, styles.suggestionNew)}
                >
                  + 새 태그 「{query}」 추가
                </li>
              )}
            </ul>
          )}
        </div>
        <button type="button" onClick={() => add(query)} className={styles.addButton}>
          추가
        </button>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className={styles.field}>
      <span className={styles.label}>
        {label}
        {required && <span className={styles.required}>필수</span>}
      </span>
      {children}
    </div>
  );
}

function TextInput({
  id,
  value,
  onChange,
  placeholder,
  list,
  onEnter,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  list?: string;
  onEnter?: () => void;
}) {
  return (
    <input
      id={id}
      value={value}
      list={list}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (onEnter && e.key === "Enter" && !e.nativeEvent.isComposing) {
          e.preventDefault();
          onEnter();
        }
      }}
      className={styles.input}
    />
  );
}

function DataList({ id, options }: { id: string; options: string[] }) {
  return (
    <datalist id={id}>
      {options.map((o) => (
        <option key={o} value={o} />
      ))}
    </datalist>
  );
}

function Pill({
  active,
  onClick,
  grow,
  children,
}: {
  active: boolean;
  onClick: () => void;
  grow?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(styles.pill, grow && styles.pillGrow, active && styles.pillActive)}
    >
      {children}
    </button>
  );
}
