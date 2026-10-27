import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createServerSupabase } from "./supabase/server";

/**
 * 지금 로그인한 사람이 관리자(나)인지 확인한다.
 * 관리자 판정은 DB 의 is_owner() 함수(schema.sql)를 그대로 쓰므로, 메일 주소를 코드에 두 번 적지 않아도 된다.
 */
export async function getAdmin() {
  // 로그인 확인은 요청마다 해야 하는 처리라서, 미리 렌더링(prerender) 대상에서 뺀다.
  // (Supabase 가 세션 만료를 확인할 때 Date.now() 를 써서, 이게 없으면 개발 서버가 에러를 낸다)
  await connection();
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;

  const { data: isOwner, error } = await supabase.rpc("is_owner");
  if (error || !isOwner) return null;

  return { email: data.user.email ?? "" };
}

/** 관리자가 아니면 로그인 화면으로 보낸다. 관리자 페이지와 Server Action 의 맨 앞에서 부른다 */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
