export type CompressImageOptions = {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  maxBytes?: number
}

const DEFAULT_OPTIONS: Required<CompressImageOptions> = {
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 0.82,
  maxBytes: 4 * 1024 * 1024,
}

export async function compressImageForUpload(file: File, options: CompressImageOptions = {}): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file
  if (file.size <= opts.maxBytes && file.type === 'image/webp') return file

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, opts.maxWidth / bitmap.width, opts.maxHeight / bitmap.height)
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return file

  ctx.drawImage(bitmap, 0, 0, width, height)

  const preferredType = file.type === 'image/png' && file.size < opts.maxBytes ? 'image/png' : 'image/webp'
  let quality = opts.quality
  let blob = await canvasToBlob(canvas, preferredType, quality)

  while (blob.size > opts.maxBytes && quality > 0.55) {
    quality -= 0.08
    blob = await canvasToBlob(canvas, 'image/webp', quality)
  }

  if (blob.size >= file.size && file.size <= opts.maxBytes) return file

  const ext = blob.type === 'image/png' ? 'png' : 'webp'
  const safeName = file.name.replace(/\.[^.]+$/, '') || 'photo'
  return new File([blob], `${safeName}.${ext}`, { type: blob.type, lastModified: Date.now() })
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Не вдалося стиснути фото'))
    }, type, quality)
  })
}
