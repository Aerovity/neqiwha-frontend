const OK_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** Downscale to ≤ maxDim and re-encode as JPEG (browsers apply EXIF orientation in createImageBitmap). */
export async function compressImage(file: Blob, maxDim = 1600, quality = 0.8): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return await new Promise((resolve, reject) =>
      canvas.toBlob(b => (b ? resolve(b) : reject(new Error('compress failed'))), 'image/jpeg', quality));
  } catch {
    if (OK_TYPES.includes(file.type) && file.size <= 6 * 1024 * 1024) return file;
    throw new Error("We couldn't read this photo. Try taking it again.");
  }
}

/** DEV_TOOLS sample photo from the backend (test-assets). */
export async function fetchSample(name: string): Promise<Blob> {
  const res = await fetch(`/api/dev/sample/${name}`);
  if (!res.ok) throw new Error('Sample photo unavailable.');
  return res.blob();
}
