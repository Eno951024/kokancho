"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./x-avatar.module.scss";

/**
 * X 프로필 아이콘을 자동으로 가져온다.
 * unavatar.io 가 @아이디로 현재 아이콘을 찾아주므로, X에서 아이콘을 바꾸면 여기도 따라 바뀐다.
 * 못 가져오면 이름 첫 글자를 보여준다.
 */
export function XAvatar({ handle, name, size = 48 }: { handle: string; name: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // 하이드레이션 전에 이미 로드에 실패한 경우는 onError 가 불리지 않으므로 직접 확인한다
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);
  const src = `https://unavatar.io/x/${encodeURIComponent(handle)}?fallback=false`;

  return (
    <div
      className={styles.avatar}
      style={{ width: size, height: size }}
    >
      <span aria-hidden>{name.slice(0, 1)}</span>
      {!failed && (
        // 외부 이미지라 next/image 대신 img 를 쓴다
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={src}
          alt={`${name}のアイコン`}
          width={size}
          height={size}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className={styles.image}
        />
      )}
    </div>
  );
}
