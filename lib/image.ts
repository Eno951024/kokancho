/**
 * 업로드 전에 브라우저에서 사진을 줄인다.
 * 긴 변을 maxSize 픽셀로 맞추고 WebP(지원하지 않는 브라우저는 JPEG)로 압축한다.
 * 스마트폰 사진(수 MB)이 보통 200~400KB 정도가 된다.
 */
export async function compressImage(file: File, maxSize = 1280): Promise<Blob> {
  const source = await loadImage(file);
  const scale = Math.min(1, maxSize / Math.max(source.width, source.height));
  const width = Math.round(source.width * scale);
  const height = Math.round(source.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("이미지를 처리할 수 없습니다.");
  ctx.drawImage(source, 0, 0, width, height);
  if ("close" in source) source.close();

  const webp = await toBlob(canvas, "image/webp", 0.85);
  if (webp && webp.type === "image/webp") return webp;
  const jpeg = await toBlob(canvas, "image/jpeg", 0.85);
  if (!jpeg) throw new Error("이미지를 압축하지 못했습니다.");
  return jpeg;
}

async function loadImage(file: File): Promise<ImageBitmap | HTMLImageElement> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    // createImageBitmap 을 못 쓰는 브라우저용
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    await img.decode();
    // 그리기가 끝난 뒤에 해제되도록 조금 늦춘다
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    return img;
  }
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

export function extensionOf(blob: Blob) {
  return blob.type === "image/webp" ? "webp" : "jpg";
}
