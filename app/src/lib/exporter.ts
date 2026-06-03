import { toPng } from 'html-to-image'
import JSZip from 'jszip'

export async function waitForFonts() {
  await document.fonts.ready
  await new Promise(r => setTimeout(r, 300))
}

export async function exportPage(el: HTMLElement, filename: string) {
  await waitForFonts()
  const dataUrl = await toPng(el, { pixelRatio: 1, cacheBust: true })
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.click()
}

export async function exportAllPages(
  refs: HTMLElement[],
  prefix = 'xhs2pic'
) {
  await waitForFonts()
  const zip = new JSZip()
  for (let i = 0; i < refs.length; i++) {
    const dataUrl = await toPng(refs[i], { pixelRatio: 1, cacheBust: true })
    const base64 = dataUrl.replace(/^data:image\/png;base64,/, '')
    zip.file(`${prefix}-${String(i + 1).padStart(2, '0')}.png`, base64, { base64: true })
  }
  const blob = await zip.generateAsync({ type: 'blob' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${prefix}.zip`
  a.click()
  URL.revokeObjectURL(a.href)
}
