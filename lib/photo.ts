// Client-side image utilities — resize uploads to a small square JPEG so
// they fit comfortably in localStorage (which is the source of truth for
// profile data in this app).

/**
 * Read an image File, crop to a centred square, resize to `size`×`size`, and
 * return a JPEG data URL. ~50–80KB at 256/0.7.
 */
export async function fileToSquareDataUrl(
  file: File,
  size = 256,
  quality = 0.7,
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Not an image file.");
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not available.");

    // Centre-crop to square.
    const side = Math.min(img.width, img.height);
    const sx = (img.width - side) / 2;
    const sy = (img.height - side) / 2;
    ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);

    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    // Defer revoke so any pending async users (rare) can finish.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Couldn't read that image."));
    img.src = src;
  });
}
