import QRCode from 'qrcode'

/**
 * QR code style types
 */
export type QrStyle =
  | 'standard'
  | 'rounded'
  | 'dots'
  | 'gradient'
  | 'logo'
  | 'liquid'
  | 'mini'
  | 'random'
  | 'frame'

/**
 * QR code style options
 */
export interface QrStyleOptions {
  style: QrStyle
  size: number
  fgColor: string
  bgColor: string
  gradientStart?: string
  gradientEnd?: string
  logoImage?: HTMLImageElement | string
  logoSize?: number
  frameColor?: string
  errorCorrection?: 'L' | 'M' | 'Q' | 'H'
}

/**
 * Display names for each QR style
 */
export const QR_STYLE_NAMES: Record<QrStyle, string> = {
  standard: 'Standard',
  rounded: 'Rounded',
  dots: 'Dots',
  gradient: 'Gradient',
  logo: 'Logo',
  liquid: 'Liquid',
  mini: 'Mini',
  random: 'Random',
  frame: 'Frame'
}

/**
 * Renders a QR code with the specified style
 */
export async function renderQRCode(
  canvas: HTMLCanvasElement,
  text: string,
  options: QrStyleOptions
): Promise<void> {
  const {
    style,
    size,
    fgColor,
    bgColor,
    gradientStart,
    gradientEnd,
    logoImage,
    logoSize = size * 0.2,
    frameColor = '#333333',
    errorCorrection = 'M'
  } = options

  // Generate QR code matrix
  const qrData = QRCode.create(text, {
    errorCorrectionLevel: errorCorrection
  })

  const moduleCount = qrData.modules.size
  const moduleSize = size / moduleCount
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Unable to get 2D context from canvas')
  }

  // Set canvas size
  canvas.width = size
  canvas.height = size

  // Clear and fill background
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, size, size)

  // Get modules array
  const modules: boolean[][] = []
  for (let row = 0; row < moduleCount; row++) {
    modules[row] = []
    for (let col = 0; col < moduleCount; col++) {
      modules[row][col] = qrData.modules.get(row, col)
    }
  }

  // Set up fill color or gradient
  let fillStyle: string | CanvasGradient = fgColor
  if (style === 'gradient' && gradientStart && gradientEnd) {
    const gradient = ctx.createLinearGradient(0, 0, size, size)
    gradient.addColorStop(0, gradientStart)
    gradient.addColorStop(1, gradientEnd)
    fillStyle = gradient
  }

  // Render based on style
  switch (style) {
    case 'standard':
      renderStandard(ctx, modules, moduleSize, fillStyle)
      break
    case 'rounded':
      renderRounded(ctx, modules, moduleSize, fillStyle)
      break
    case 'dots':
      renderDots(ctx, modules, moduleSize, fillStyle)
      break
    case 'gradient':
      renderStandard(ctx, modules, moduleSize, fillStyle)
      break
    case 'logo':
      await renderLogo(ctx, modules, moduleSize, fillStyle, size, logoImage, logoSize)
      break
    case 'liquid':
      renderLiquid(ctx, modules, moduleSize, fillStyle)
      break
    case 'mini':
      renderMini(ctx, modules, moduleSize, fillStyle)
      break
    case 'random':
      renderRandom(ctx, modules, moduleSize, fillStyle)
      break
    case 'frame':
      renderFrame(ctx, modules, moduleSize, fillStyle, size, frameColor)
      break
    default:
      renderStandard(ctx, modules, moduleSize, fillStyle)
  }
}

/**
 * Standard square modules
 */
function renderStandard(
  ctx: CanvasRenderingContext2D,
  modules: boolean[][],
  moduleSize: number,
  fillStyle: string | CanvasGradient
): void {
  ctx.fillStyle = fillStyle
  for (let row = 0; row < modules.length; row++) {
    for (let col = 0; col < modules[row].length; col++) {
      if (modules[row][col]) {
        ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize)
      }
    }
  }
}

/**
 * Rounded corner modules
 */
function renderRounded(
  ctx: CanvasRenderingContext2D,
  modules: boolean[][],
  moduleSize: number,
  fillStyle: string | CanvasGradient
): void {
  ctx.fillStyle = fillStyle
  const radius = moduleSize * 0.4

  for (let row = 0; row < modules.length; row++) {
    for (let col = 0; col < modules[row].length; col++) {
      if (modules[row][col]) {
        const x = col * moduleSize
        const y = row * moduleSize
        ctx.beginPath()
        ctx.roundRect(x, y, moduleSize, moduleSize, radius)
        ctx.fill()
      }
    }
  }
}

/**
 * Circular dots
 */
function renderDots(
  ctx: CanvasRenderingContext2D,
  modules: boolean[][],
  moduleSize: number,
  fillStyle: string | CanvasGradient
): void {
  ctx.fillStyle = fillStyle
  const radius = moduleSize * 0.45

  for (let row = 0; row < modules.length; row++) {
    for (let col = 0; col < modules[row].length; col++) {
      if (modules[row][col]) {
        const x = col * moduleSize + moduleSize / 2
        const y = row * moduleSize + moduleSize / 2
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }
}

/**
 * Standard QR with centered logo
 */
async function renderLogo(
  ctx: CanvasRenderingContext2D,
  modules: boolean[][],
  moduleSize: number,
  fillStyle: string | CanvasGradient,
  size: number,
  logoImage?: HTMLImageElement | string,
  logoSize?: number
): Promise<void> {
  // Render standard QR first
  renderStandard(ctx, modules, moduleSize, fillStyle)

  // Draw logo if provided
  if (logoImage && logoSize) {
    let img: HTMLImageElement

    if (typeof logoImage === 'string') {
      img = new Image()
      img.src = logoImage
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('Failed to load logo image'))
      })
    } else {
      img = logoImage
    }

    const x = (size - logoSize) / 2
    const y = (size - logoSize) / 2

    // Draw white background for logo
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(x - 4, y - 4, logoSize + 8, logoSize + 8)

    // Draw logo
    ctx.drawImage(img, x, y, logoSize, logoSize)
  }
}

/**
 * Liquid/bubble style with bezier curves
 */
function renderLiquid(
  ctx: CanvasRenderingContext2D,
  modules: boolean[][],
  moduleSize: number,
  fillStyle: string | CanvasGradient
): void {
  ctx.fillStyle = fillStyle

  for (let row = 0; row < modules.length; row++) {
    for (let col = 0; col < modules[row].length; col++) {
      if (modules[row][col]) {
        const x = col * moduleSize
        const y = row * moduleSize

        // Create organic blob shape with random variance
        const variance = moduleSize * 0.15
        const seed = (row * modules.length + col) % 10
        const random = (n: number) => ((Math.sin(seed * n * 123.456) + 1) / 2) * variance

        ctx.beginPath()
        ctx.moveTo(x + random(1), y + random(2))

        // Draw blob with bezier curves
        ctx.bezierCurveTo(
          x + random(3),
          y + random(4),
          x + moduleSize + random(5),
          y + random(6),
          x + moduleSize + random(7),
          y + moduleSize / 2 + random(8)
        )
        ctx.bezierCurveTo(
          x + moduleSize + random(9),
          y + moduleSize + random(10),
          x + random(11),
          y + moduleSize + random(12),
          x + random(13),
          y + moduleSize / 2 + random(14)
        )
        ctx.closePath()
        ctx.fill()
      }
    }
  }
}

/**
 * Mini squares (outer square with inner mini square cutout effect)
 */
function renderMini(
  ctx: CanvasRenderingContext2D,
  modules: boolean[][],
  moduleSize: number,
  fillStyle: string | CanvasGradient
): void {
  ctx.fillStyle = fillStyle
  const innerSize = moduleSize * 0.5
  const offset = (moduleSize - innerSize) / 2

  for (let row = 0; row < modules.length; row++) {
    for (let col = 0; col < modules[row].length; col++) {
      if (modules[row][col]) {
        const x = col * moduleSize
        const y = row * moduleSize

        // Draw outer square
        ctx.fillRect(x, y, moduleSize, moduleSize)

        // Cut out inner mini square (use background color)
        ctx.save()
        ctx.fillStyle = ctx.fillStyle === fillStyle ? '#ffffff' : fillStyle
        ctx.globalCompositeOperation = 'destination-out'
        ctx.fillRect(x + offset, y + offset, innerSize, innerSize)
        ctx.restore()

        // Re-fill to ensure proper color
        ctx.fillStyle = fillStyle
      }
    }
  }
}

/**
 * Random mix of squares and circles
 */
function renderRandom(
  ctx: CanvasRenderingContext2D,
  modules: boolean[][],
  moduleSize: number,
  fillStyle: string | CanvasGradient
): void {
  ctx.fillStyle = fillStyle

  for (let row = 0; row < modules.length; row++) {
    for (let col = 0; col < modules[row].length; col++) {
      if (modules[row][col]) {
        const x = col * moduleSize
        const y = row * moduleSize

        // Deterministic random based on position
        const isCircle = ((row * modules.length + col) % 3) === 0

        if (isCircle) {
          const radius = moduleSize * 0.45
          ctx.beginPath()
          ctx.arc(x + moduleSize / 2, y + moduleSize / 2, radius, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.fillRect(x, y, moduleSize, moduleSize)
        }
      }
    }
  }
}

/**
 * Standard QR with decorative frame/border
 */
function renderFrame(
  ctx: CanvasRenderingContext2D,
  modules: boolean[][],
  _moduleSize: number,
  fillStyle: string | CanvasGradient,
  size: number,
  frameColor: string
): void {
  // Draw decorative frame
  const frameWidth = size * 0.05
  const innerPadding = frameWidth * 2

  ctx.fillStyle = frameColor
  ctx.fillRect(0, 0, size, frameWidth) // Top
  ctx.fillRect(0, size - frameWidth, size, frameWidth) // Bottom
  ctx.fillRect(0, 0, frameWidth, size) // Left
  ctx.fillRect(size - frameWidth, 0, frameWidth, size) // Right

  // Corner decorations
  const cornerSize = frameWidth * 2
  ctx.fillRect(0, 0, cornerSize, cornerSize)
  ctx.fillRect(size - cornerSize, 0, cornerSize, cornerSize)
  ctx.fillRect(0, size - cornerSize, cornerSize, cornerSize)
  ctx.fillRect(size - cornerSize, size - cornerSize, cornerSize, cornerSize)

  // Create clipped area for QR code
  ctx.save()
  ctx.beginPath()
  ctx.rect(innerPadding, innerPadding, size - innerPadding * 2, size - innerPadding * 2)
  ctx.clip()

  // Scale and center QR code within frame
  const qrSize = size - innerPadding * 2
  const scaledModuleSize = qrSize / modules.length
  const offsetX = innerPadding
  const offsetY = innerPadding

  ctx.translate(offsetX, offsetY)
  renderStandard(ctx, modules, scaledModuleSize, fillStyle)
  ctx.restore()
}

export default renderQRCode
