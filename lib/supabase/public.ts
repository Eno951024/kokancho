import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

export { ITEM_IMAGE_BUCKET } from "./env";

/** 로그인 없이 공개 데이터를 읽기 위한 Supabase 클라이언트 */
export function createPublicClient() {
  const { url, key } = getSupabaseEnv();
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
