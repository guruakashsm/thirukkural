import img1 from '../assets/thiruvalluvar.png'
import img4 from '../assets/thiruvalluvar4-clean.png'
import img5 from '../assets/thiruvalluvar5-clean.png'
import img6 from '../assets/thiruvalluvar6-clean.png'
import img7 from '../assets/thiruvalluvar7-clean.png'
import img8 from '../assets/thiruvalluvar8-clean.png'

const valluvarImages = [img1, img4, img5, img6, img7, img8]

interface ShareCardData {
  kuralNumber: number
  tamil: string
  meaning: string
  englishMeaning: string
  tamilMeaning: string
  chapterName: string
  categoryName: string
  categoryColor: string
  lang: string
}

const CARD_W = 1400
const CARD_H = 840
const PAD = 60

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }
  if (currentLine) lines.push(currentLine)
  return lines
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function drawCard(
  canvas: HTMLCanvasElement,
  data: ShareCardData,
  valluvarImg: HTMLImageElement,
) {
  const ctx = canvas.getContext('2d')!
  canvas.width = CARD_W
  canvas.height = CARD_H

  // ===== BACKGROUND =====
  const bg = ctx.createLinearGradient(0, 0, CARD_W, CARD_H)
  bg.addColorStop(0, '#FDF8EE')
  bg.addColorStop(1, '#F5EDD6')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, CARD_W, CARD_H)

  // Subtle dot pattern
  ctx.fillStyle = 'rgba(139, 69, 19, 0.03)'
  for (let px = 9; px < CARD_W; px += 24) {
    for (let py = 9; py < CARD_H; py += 24) {
      ctx.beginPath()
      ctx.arc(px, py, 1, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // ===== THIRUVALLUVAR WATERMARK =====
  const wmBoxW = 380
  const wmBoxH = 440
  const wmScale = Math.min(wmBoxW / valluvarImg.width, wmBoxH / valluvarImg.height)
  const wmW = valluvarImg.width * wmScale
  const wmH = valluvarImg.height * wmScale
  const wmX = (CARD_W - wmW) / 2
  const wmY = (CARD_H - wmH) / 2 + 40
  ctx.globalAlpha = 0.06
  ctx.drawImage(valluvarImg, wmX, wmY, wmW, wmH)
  ctx.globalAlpha = 1.0

  // ===== BORDERS =====
  const goldStrip = ctx.createLinearGradient(0, 0, CARD_W, 0)
  goldStrip.addColorStop(0, 'rgba(198, 167, 94, 0.2)')
  goldStrip.addColorStop(0.5, 'rgba(198, 167, 94, 0.8)')
  goldStrip.addColorStop(1, 'rgba(198, 167, 94, 0.2)')
  ctx.fillStyle = goldStrip
  ctx.fillRect(0, 0, CARD_W, 5)
  ctx.fillRect(0, CARD_H - 5, CARD_W, 5)

  // Corner ornaments
  ctx.fillStyle = 'rgba(198, 167, 94, 0.35)'
  ctx.font = '24px serif'
  ctx.textAlign = 'left'
  ctx.fillText('❋', 20, 38)
  ctx.fillText('❋', 20, CARD_H - 16)
  ctx.textAlign = 'right'
  ctx.fillText('❋', CARD_W - 20, 38)
  ctx.fillText('❋', CARD_W - 20, CARD_H - 16)

  // ===== SECTION 1: HEADER =====
  let y = 30

  // Title badge
  const headerText = 'திருக்குறள் | Thirukkural'
  ctx.font = 'bold 26px "Noto Serif Tamil", serif'
  const headerW = ctx.measureText(headerText).width + 56
  const hbX = (CARD_W - headerW) / 2

  ctx.fillStyle = 'rgba(139, 26, 26, 0.92)'
  ctx.beginPath()
  ctx.roundRect(hbX, y, headerW, 46, 12)
  ctx.fill()

  ctx.fillStyle = '#F5D98E'
  ctx.textAlign = 'center'
  ctx.font = 'bold 22px "Noto Serif Tamil", serif'
  ctx.fillText(headerText, CARD_W / 2, y + 31)

  ctx.font = '18px serif'
  ctx.fillText('✿', hbX - 16, y + 30)
  ctx.fillText('✿', hbX + headerW + 16, y + 30)

  y += 76

  // Kural number + chapter + category row
  const kuralLabel = `Kural #${data.kuralNumber}`
  ctx.font = 'bold 24px "Inter", sans-serif'
  const kuralLabelW = ctx.measureText(kuralLabel).width

  const bPad = 18
  const bGap = 12
  ctx.font = '18px "Noto Serif Tamil", "Inter", sans-serif'
  const chW = ctx.measureText(data.chapterName).width + bPad * 2
  const caW = ctx.measureText(data.categoryName).width + bPad * 2
  const rowW = kuralLabelW + 18 + chW + bGap + caW
  let bx = (CARD_W - rowW) / 2

  ctx.fillStyle = '#8B1A1A'
  ctx.font = 'bold 24px "Inter", sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(kuralLabel, bx, y + 5)
  bx += kuralLabelW + 18

  // Chapter pill
  ctx.font = '18px "Noto Serif Tamil", "Inter", sans-serif'
  ctx.fillStyle = 'rgba(139, 26, 26, 0.1)'
  ctx.beginPath()
  ctx.roundRect(bx, y - 17, chW, 34, 17)
  ctx.fill()
  ctx.strokeStyle = 'rgba(139, 26, 26, 0.2)'
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.fillStyle = '#5C3310'
  ctx.textAlign = 'center'
  ctx.fillText(data.chapterName, bx + chW / 2, y + 5)
  bx += chW + bGap

  // Category pill
  ctx.fillStyle = data.categoryColor
  ctx.beginPath()
  ctx.roundRect(bx, y - 17, caW, 34, 17)
  ctx.fill()
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 18px "Inter", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(data.categoryName, bx + caW / 2, y + 5)

  y += 30

  // ===== SECTION 2: TAMIL COUPLET (full width, prominent) =====
  y += 50

  const tamilLines = data.tamil.split('\n').filter(l => l.trim())
  const fullTextMaxW = CARD_W - PAD * 2

  // Auto-fit font: start large, shrink until all lines fit
  let coupletFontSize = 44
  while (coupletFontSize > 24) {
    ctx.font = `${coupletFontSize}px "Noto Serif Tamil", serif`
    const allFit = tamilLines.every(
      line => ctx.measureText(line.trim()).width <= fullTextMaxW,
    )
    if (allFit) break
    coupletFontSize -= 2
  }
  const coupletLineH = Math.round(coupletFontSize * 1.55)

  ctx.fillStyle = '#3D1C00'
  ctx.font = `${coupletFontSize}px "Noto Serif Tamil", serif`
  ctx.textAlign = 'center'
  for (const line of tamilLines) {
    ctx.fillText(line.trim(), CARD_W / 2, y)
    y += coupletLineH
  }

  // Lotus separator after couplet
  y += 10
  ctx.fillStyle = 'rgba(139, 26, 26, 0.25)'
  ctx.font = '22px serif'
  ctx.textAlign = 'center'
  ctx.fillText('— ❀ —', CARD_W / 2, y)
  y += 20

  // Horizontal line
  ctx.strokeStyle = 'rgba(198, 167, 94, 0.35)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(PAD, y)
  ctx.lineTo(CARD_W - PAD, y)
  ctx.stroke()

  // ===== SECTION 3: TWO-COLUMN TRANSLATIONS =====
  const transTop = y + 14
  const transBottom = CARD_H - 50
  const transH = transBottom - transTop

  const divX = CARD_W / 2
  const colMargin = 40 // margin from divider and from edges
  const leftCenterX = PAD + (divX - PAD) / 2
  const leftMaxW = divX - PAD - colMargin
  const rightCenterX = divX + (CARD_W - PAD - divX) / 2
  const rightMaxW = CARD_W - PAD - divX - colMargin

  // Vertical divider
  ctx.strokeStyle = 'rgba(198, 167, 94, 0.3)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(divX, transTop + 4)
  ctx.lineTo(divX, transBottom - 4)
  ctx.stroke()

  // Lotus on divider
  ctx.fillStyle = 'rgba(139, 26, 26, 0.18)'
  ctx.font = '18px serif'
  ctx.textAlign = 'center'
  ctx.fillText('❀', divX, transTop + transH / 2)

  // --- LEFT: Tamil meaning ---
  const tmFontSize = 22
  const tmLineH = 32
  ctx.font = `${tmFontSize}px "Noto Serif Tamil", serif`
  const tmLines = data.tamilMeaning
    ? wrapText(ctx, data.tamilMeaning, leftMaxW)
    : []

  // Label
  const tmLabelH = 30
  const tmContentH = tmLabelH + tmLines.length * tmLineH
  let ty = transTop + Math.max(8, (transH - tmContentH) / 2)

  ctx.fillStyle = 'rgba(139, 26, 26, 0.6)'
  ctx.font = 'bold 14px "Inter", sans-serif'
  ctx.textAlign = 'center'
  ctx.letterSpacing = '1px'
  ctx.fillText('தமிழ் விளக்கம்', leftCenterX, ty)
  ctx.letterSpacing = '0px'
  ty += tmLabelH

  ctx.fillStyle = 'rgba(61, 28, 0, 0.92)'
  ctx.font = `${tmFontSize}px "Noto Serif Tamil", serif`
  for (const line of tmLines) {
    ctx.fillText(line, leftCenterX, ty)
    ty += tmLineH
  }

  // --- RIGHT: User's selected language meaning ---
  // Right column shows user's selected language meaning
  // When lang is 'ta', meaning = englishMeaning (fallback), so show English
  const langLabels: Record<string, string> = {
    en: 'ENGLISH',
    ta: 'ENGLISH',
    hi: 'हिन्दी',
    te: 'తెలుగు',
    kn: 'ಕನ್ನಡ',
    ml: 'മലയാളം',
    fr: 'FRANÇAIS',
    de: 'DEUTSCH',
    zh: '中文',
    ja: '日本語',
    ko: '한국어',
    ar: 'العربية',
    ru: 'РУССКИЙ',
    es: 'ESPAÑOL',
  }
  const meaningLabel = langLabels[data.lang] || data.lang.toUpperCase()

  const priFont = 22
  const priLineH = 32
  ctx.font = `${priFont}px "Inter", sans-serif`
  const priLines = wrapText(ctx, data.meaning, rightMaxW)
  const rightContentH = 30 + priLines.length * priLineH

  let ry = transTop + Math.max(8, (transH - rightContentH) / 2)

  // Label
  ctx.fillStyle = 'rgba(139, 26, 26, 0.6)'
  ctx.font = 'bold 14px "Inter", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(meaningLabel, rightCenterX, ry)
  ry += 30

  ctx.fillStyle = 'rgba(61, 28, 0, 0.92)'
  ctx.font = `${priFont}px "Inter", sans-serif`
  for (const line of priLines) {
    ctx.fillText(line, rightCenterX, ry)
    ry += priLineH
  }

  // ===== FOOTER =====
  ctx.strokeStyle = 'rgba(198, 167, 94, 0.3)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(CARD_W * 0.35, CARD_H - 36)
  ctx.lineTo(CARD_W * 0.65, CARD_H - 36)
  ctx.stroke()

  ctx.fillStyle = 'rgba(139, 26, 26, 0.4)'
  ctx.font = '18px "Inter", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('thirukkural.app', CARD_W / 2, CARD_H - 16)
}

export async function shareKuralAsImage(data: ShareCardData): Promise<void> {
  const imgSrc = valluvarImages[data.kuralNumber % valluvarImages.length]
  const valluvarImg = await loadImage(imgSrc)

  const canvas = document.createElement('canvas')
  drawCard(canvas, data, valluvarImg)

  const blob = await new Promise<Blob | null>(resolve =>
    canvas.toBlob(resolve, 'image/png'),
  )
  if (!blob) return

  const file = new File([blob], `thirukkural-${data.kuralNumber}.png`, {
    type: 'image/png',
  })

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      title: `Thirukkural #${data.kuralNumber}`,
      files: [file],
    })
  } else {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `thirukkural-${data.kuralNumber}.png`
    a.click()
    URL.revokeObjectURL(url)
  }
}
