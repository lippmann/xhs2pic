import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import JSZip from 'jszip'
import { useStore } from '../store'
import { CANVAS_W, CANVAS_H, type Page } from '../lib/paginator'
import { PageCanvas } from './PageCanvas'

const PREVIEW_SCALE = 0.42

type Props = { pages: Page[] }

export function PreviewPanel({ pages }: Props) {
  const { getTheme, author, showAuthor, coverEnabled, coverImage } = useStore()
  const theme = getTheme()
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [exporting, setExporting] = useState(false)
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  const selectedPage = pages[selectedIdx] ?? pages[0]

  async function screenshotEl(el: HTMLDivElement): Promise<string> {
    await document.fonts.ready
    return toPng(el, { pixelRatio: 1, cacheBust: true, width: CANVAS_W, height: CANVAS_H })
  }

  const handleExportPage = async (idx: number) => {
    const el = pageRefs.current.get(idx)
    if (!el) return
    setExporting(true)
    try {
      const dataUrl = await screenshotEl(el)
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `xhs2pic-${String(idx + 1).padStart(2, '0')}.png`
      a.click()
    } finally {
      setExporting(false)
    }
  }

  const handleExportAll = async () => {
    setExporting(true)
    try {
      const zip = new JSZip()
      for (let i = 0; i < pages.length; i++) {
        const el = pageRefs.current.get(i)
        if (!el) continue
        const dataUrl = await screenshotEl(el)
        zip.file(
          `xhs2pic-${String(i + 1).padStart(2, '0')}.png`,
          dataUrl.replace(/^data:image\/png;base64,/, ''),
          { base64: true }
        )
      }
      const blob = await zip.generateAsync({ type: 'blob' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'xhs2pic.zip'
      a.click()
      URL.revokeObjectURL(a.href)
    } finally {
      setExporting(false)
    }
  }

  if (pages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-300 text-sm">
        在左侧粘贴或上传文章内容
      </div>
    )
  }
  const THUMB_SCALE = 0.09
  const THUMB_W = Math.round(CANVAS_W * THUMB_SCALE)
  const THUMB_H = Math.round(CANVAS_H * THUMB_SCALE)

  return (
    <div className="flex h-full gap-3">

        {/* Main preview */}
        <div className="flex-1 flex flex-col items-center justify-start min-w-0">
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: CANVAS_W * PREVIEW_SCALE,
              height: CANVAS_H * PREVIEW_SCALE,
              overflow: 'hidden',
              borderRadius: 8,
              boxShadow: '0 4px 24px rgba(0,0,0,.12)',
              pointerEvents: 'none',
              userSelect: 'none',
            }}>
              <div style={{
                transformOrigin: 'top left',
                transform: `scale(${PREVIEW_SCALE})`,
                width: CANVAS_W,
                height: CANVAS_H,
              }}>
                <PageCanvas page={selectedPage} theme={theme} author={author} showAuthor={showAuthor} coverEnabled={coverEnabled} coverImage={coverImage} />
              </div>
            </div>
          </div>
        </div>

      {/* Vertical thumbnail strip + page count */}
      {pages.length > 1 && (
        <div className="flex flex-col gap-2 flex-shrink-0" style={{ width: THUMB_W + 8 }}>
          <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-1">
            {pages.map((page, i) => (
              <button
                key={i}
                onClick={() => setSelectedIdx(i)}
                className={`flex-shrink-0 rounded overflow-hidden transition border-2 ${
                  i === selectedIdx ? 'border-gray-800' : 'border-transparent opacity-50 hover:opacity-80'
                }`}
                style={{ width: THUMB_W, height: THUMB_H }}
              >
                <div style={{
                  transformOrigin: 'top left',
                  transform: `scale(${THUMB_SCALE})`,
                  width: CANVAS_W,
                  height: CANVAS_H,
                  pointerEvents: 'none',
                }}>
                  <PageCanvas page={page} theme={theme} author={author} showAuthor={showAuthor} coverEnabled={coverEnabled} coverImage={coverImage} />
                </div>
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-400 text-center flex-shrink-0">共 {pages.length} 张</div>
        </div>
      )}

      {/* Off-screen real-size canvases for export */}
      <div style={{ position: 'fixed', top: -9999, left: -9999, pointerEvents: 'none', zIndex: -1 }}>
        {pages.map((page) => (
          <PageCanvas
            key={page.index}
            page={page}
            theme={theme}
            author={author}
            showAuthor={showAuthor}
            coverEnabled={coverEnabled}
            coverImage={coverImage}
            setRef={el => {
              if (el) pageRefs.current.set(page.index, el)
              else pageRefs.current.delete(page.index)
            }}
          />
        ))}
      </div>

    </div>
  )
}
