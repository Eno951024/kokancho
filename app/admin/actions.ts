"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { ITEM_IMAGE_BUCKET } from "@/lib/supabase/env";
import { createServerSupabase } from "@/lib/supabase/server";
import type { ItemKind, ItemStatus } from "@/lib/types";

// ---------------------------------------------------------------------
// 로그인 / 로그아웃
// ---------------------------------------------------------------------

export type SignInState = { error?: string; email?: string };

export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "메일 주소와 비밀번호를 입력해 주세요.", email };

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "메일 주소 또는 비밀번호가 맞지 않습니다.", email };

  const { data: isOwner } = await supabase.rpc("is_owner");
  if (!isOwner) {
    await supabase.auth.signOut();
    return { error: "관리자 계정이 아닙니다. schema.sql 의 메일 주소를 확인해 주세요.", email };
  }

  redirect("/admin");
}

export async function signOut() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ---------------------------------------------------------------------
// 굿즈 등록 / 수정 / 상태 변경 / 삭제
// ---------------------------------------------------------------------

export type ItemInput = {
  kind: ItemKind;
  genre: string;
  event: string;
  goodsType: string;
  variant: string;
  quantity: number;
  tags: string[];
  note: string;
  status: ItemStatus;
  /** 새로 올린 사진의 Storage 경로. null 이면 사진 없음 */
  imagePath: string | null;
};

export type SaveResult = { error?: string };

const KINDS: ItemKind[] = ["yuzuri", "motome"];
const STATUSES: ItemStatus[] = ["available", "trading", "done"];

function validate(input: ItemInput) {
  const errors: string[] = [];
  if (!KINDS.includes(input.kind)) errors.push("譲 / 求 를 선택해 주세요.");
  if (!input.genre.trim()) errors.push("작품명을 입력해 주세요.");
  if (!input.goodsType.trim()) errors.push("굿즈 종류를 입력해 주세요.");
  if (!Number.isInteger(input.quantity) || input.quantity < 1) errors.push("수량은 1 이상이어야 합니다.");
  if (!STATUSES.includes(input.status)) errors.push("상태가 올바르지 않습니다.");
  return errors;
}

function toRow(input: ItemInput) {
  const clean = (s: string) => s.trim().replace(/\s+/g, " ");
  return {
    kind: input.kind,
    genre: clean(input.genre),
    event: clean(input.event) || null,
    goods_type: clean(input.goodsType),
    variant: clean(input.variant) || null,
    quantity: input.quantity,
    tags: [...new Set(input.tags.map(clean).filter(Boolean))],
    note: input.note.trim() || null,
    status: input.status,
    image_path: input.imagePath,
  };
}

export async function saveItem(id: string | null, input: ItemInput): Promise<SaveResult> {
  await requireAdmin();
  const errors = validate(input);
  if (errors.length > 0) return { error: errors.join("\n") };

  const supabase = await createServerSupabase();
  const row = toRow(input);

  if (id) {
    const { data: before } = await supabase.from("items").select("image_path").eq("id", id).maybeSingle();
    const { error } = await supabase.from("items").update(row).eq("id", id);
    if (error) return { error: `저장하지 못했습니다: ${error.message}` };

    // 사진을 바꾸거나 지웠으면 예전 파일은 정리한다
    const oldPath = before?.image_path as string | null | undefined;
    if (oldPath && oldPath !== row.image_path) {
      await supabase.storage.from(ITEM_IMAGE_BUCKET).remove([oldPath]);
    }
  } else {
    const { error } = await supabase.from("items").insert(row);
    if (error) return { error: `등록하지 못했습니다: ${error.message}` };
  }

  redirect("/admin");
}

export async function updateStatus(id: string, status: ItemStatus): Promise<SaveResult> {
  await requireAdmin();
  if (!STATUSES.includes(status)) return { error: "상태가 올바르지 않습니다." };

  const supabase = await createServerSupabase();
  const { error } = await supabase.from("items").update({ status }).eq("id", id);
  if (error) return { error: `상태를 바꾸지 못했습니다: ${error.message}` };

  refresh();
  return {};
}

export async function deleteItem(id: string): Promise<SaveResult> {
  await requireAdmin();
  const supabase = await createServerSupabase();

  const { data: before } = await supabase.from("items").select("image_path").eq("id", id).maybeSingle();
  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) return { error: `삭제하지 못했습니다: ${error.message}` };

  const path = before?.image_path as string | null | undefined;
  if (path) await supabase.storage.from(ITEM_IMAGE_BUCKET).remove([path]);

  redirect("/admin");
}

/** 등록 화면에서 사진을 올리기 전에 버린 파일을 정리할 때 쓴다 */
export async function discardUploadedImage(path: string) {
  await requireAdmin();
  const supabase = await createServerSupabase();
  await supabase.storage.from(ITEM_IMAGE_BUCKET).remove([path]);
}
