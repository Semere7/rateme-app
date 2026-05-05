// Crops and compresses an image to a square Blob ready for avatar upload.
// Large source images are handled automatically: the function tries progressively
// smaller canvas sizes and JPEG quality levels until the output is under MAX_BYTES.

const MAX_BYTES = 2 * 1024 * 1024

type CropArea = { x: number; y: number; width: number; height: number }

// Ordered attempts: prefer high quality / large size, fall back as needed.
const COMPRESSION_STEPS = [
  { size: 400, quality: 0.92 },
  { size: 400, quality: 0.80 },
  { size: 400, quality: 0.65 },
  { size: 300, quality: 0.80 },
  { size: 300, quality: 0.65 },
  { size: 200, quality: 0.80 },
  { size: 200, quality: 0.65 },
]

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', () => reject(new Error('Failed to load image')))
    img.src = src
  })
}

function renderToCanvas(
  image: HTMLImageElement,
  crop: CropArea,
  size: number,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas context unavailable')
  ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, size, size)
  return canvas
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
      'image/jpeg',
      quality,
    ),
  )
}

export async function cropImageToBlob(
  imageSrc: string,
  cropAreaPixels: CropArea,
): Promise<Blob> {
  const image = await loadImage(imageSrc)

  for (const { size, quality } of COMPRESSION_STEPS) {
    const canvas = renderToCanvas(image, cropAreaPixels, size)
    const blob = await canvasToBlob(canvas, quality)
    if (blob.size <= MAX_BYTES) return blob
  }

  throw new Error(
    'Image could not be compressed below 2 MB. Please select a different image.',
  )
}
