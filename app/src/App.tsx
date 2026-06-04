import { useEffect, useRef, useState } from 'react'
import { EditorPanel } from './components/EditorPanel'
import { StylePanel } from './components/StylePanel'
import { PreviewPanel } from './components/PreviewPanel'
import { useStore } from './store'
import { paginate, type Page } from './lib/paginator'
import { parseMarkdown } from './lib/parser'
import './index.css'

export default function App() {
  const [pages, setPages] = useState<Page[]>([])
  const { rawText, blocks, themeId, styleOverrides, getTheme, setBlocks, coverEnabled, coverImage } = useStore()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Effect 1: parse text → blocks (debounced, only when rawText changes)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (!rawText.trim()) { setBlocks([]); return }
      // Don't re-parse docx placeholder — docx blocks are set directly by EditorPanel
      if (!rawText.startsWith('(docx:')) {
        setBlocks(parseMarkdown(rawText))
      }
    }, 500)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [rawText, setBlocks])

  // Effect 2: paginate (immediate, reacts to blocks / theme / cover changes)
  useEffect(() => {
    if (blocks.length === 0) { setPages([]); return }
    const theme = getTheme()
    const coverH = coverEnabled && coverImage ? theme.cover.imageHeight : 0
    setPages(paginate(blocks, theme, coverH))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks, themeId, styleOverrides, coverEnabled, coverImage])

  return (
    <div className="flex flex-col h-screen bg-[#f0efe9]">

      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-100 flex-shrink-0">
        <span className="font-medium text-gray-800 tracking-tight">长文转图片｜小红书、小绿书</span>
        <span className="text-xs text-gray-400">长文转小红书图文</span>
      </header>

      <div className="flex flex-1 overflow-hidden gap-4 p-4">

        {/* 内容 */}
        <div className="w-[500px] flex-shrink-0 flex flex-col min-h-0">
          <EditorPanel />
        </div>

        {/* 样式 */}
        <div className="w-[220px] flex-shrink-0 flex flex-col gap-3 overflow-y-auto overflow-x-hidden min-h-0">
          <StylePanel />
        </div>

        {/* 预览 */}
        <div className="flex-1 min-h-0 h-full overflow-hidden">
          <PreviewPanel pages={pages} />
        </div>

      </div>
    </div>
  )
}
