import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

/** 브라우저용 Supabase 클라이언트 (사진 업로드에 사용). 로그인 쿠키를 그대로 쓴다 */
export function createBrowserSupabase() {
  const { url, key } = getSupabaseEnv();
  return createBrowserClient(url, key);
}
