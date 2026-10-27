"use client";

import { useOptimistic, useTransition } from "react";
import { STATUS_LABEL, type ItemStatus } from "@/lib/types";
import { cx } from "@/lib/cx";
import { updateStatus } from "./actions";
import styles from "./admin.module.scss";

const ARROW: Record<ItemStatus, string> = {
  available: styles.arrowAvailable,
  trading: styles.arrowTrading,
  done: styles.arrowDone,
};

/** 목록에서 바로 교환 상태를 바꾸는 셀렉트 */
export function StatusSelect({ id, status }: { id: string; status: ItemStatus }) {
  const [optimistic, setOptimistic] = useOptimistic(status);
  const [pending, startTransition] = useTransition();

  return (
    // 브라우저 기본 화살표는 위치를 조절할 수 없어서 숨기고, 안쪽에 직접 그린다
    <span className={styles.statusWrap}>
      <select
        aria-label="교환 상태"
        value={optimistic}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as ItemStatus;
          startTransition(async () => {
            setOptimistic(next);
            const result = await updateStatus(id, next);
            if (result.error) alert(result.error);
          });
        }}
        className={cx(styles.statusSelect, styles[optimistic])}
      >
        {(Object.keys(STATUS_LABEL) as ItemStatus[]).map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 12 12"
        className={cx(styles.statusArrow, ARROW[optimistic])}
      >
        <path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
