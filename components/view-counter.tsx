"use client";

import { useEffect, useRef, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";

const STORAGE_PREFIX = "kokancho:viewed:";

function today() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * 상세 화면의 조회수를 보여주고, 브라우저에서 화면이 열렸을 때 1 늘린다.
 * - 같은 브라우저에서 같은 굿즈는 하루에 한 번만 센다
 * - 관리자로 로그인한 상태의 조회는 DB 함수(increment_view)가 세지 않는다
 * - 서버나 링크 미리보기 봇은 이 코드를 실행하지 않으므로 세어지지 않는다
 */
export function ViewCounter({ itemId, initial, className }: { itemId: string; initial: number; className?: string }) {
  const [count, setCount] = useState(initial);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return; // 개발 모드에서 두 번 실행되는 것 방지
    started.current = true;

    const key = STORAGE_PREFIX + itemId;
    try {
      if (localStorage.getItem(key) === today()) return;
    } catch {
      // 저장소를 쓸 수 없는 환경(시크릿 모드 등)에서는 그냥 센다
    }

    createBrowserSupabase()
      .rpc("increment_view", { target: itemId })
      .then(({ data, error }) => {
        if (error) {
          console.warn("[kokancho] 조회수를 기록하지 못했습니다:", error.message);
          return;
        }
        // 관리자의 조회는 DB 가 세지 않고 null 을 돌려준다. 이때는 「오늘 봤음」도 기록하지 않는다
        if (typeof data !== "number") return;
        setCount(data);
        try {
          localStorage.setItem(key, today());
        } catch {
          // 무시
        }
      });
  }, [itemId]);

  return <span className={className}>閲覧 {count.toLocaleString("ja-JP")}</span>;
}
