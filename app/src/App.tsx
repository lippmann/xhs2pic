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
  const { rawText, getTheme, setBlocks, coverEnabled, coverImage } = useStore()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (!rawText.trim()) { setPages([]); return }
      const theme = getTheme()
      const blocks = parseMarkdown(rawText)
      setBlocks(blocks)
      const coverH = coverEnabled && coverImage ? theme.cover.imageHeight : 0
      setPages(paginate(blocks, theme, coverH))
    }, 500)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [rawText, getTheme, setBlocks, coverEnabled, coverImage])

  return (
    <div className="flex flex-col h-screen bg-[#f0efe9]">

      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-100 flex-shrink-0">
        <span className="font-medium text-gray-800 tracking-tight">xhs2pic</span>
        <span className="text-xs text-gray-400">长文转小红书图文</span>
      </header>

      <div className="flex flex-1 overflow-hidden gap-4 p-4">

        {/* 内容 */}
        <div className="w-[360px] flex-shrink-0 flex flex-col gap-3 overflow-y-auto">
          <div className="text-xs text-gray-400 px-1">内容</div>
          <EditorPanel />
        </div>

        {/* 样式 */}
        <div className="w-[240px] flex-shrink-0 flex flex-col gap-3 overflow-y-auto">
          <div className="text-xs text-gray-400 px-1">样式</div>
          <StylePanel />
        </div>

        {/* 预览 */}
        <div className="flex-1 overflow-hidden flex flex-col gap-3">
          <div className="text-xs text-gray-400 px-1">预览</div>
          <div className="flex-1 overflow-hidden">
            <PreviewPanel pages={pages} />
          </div>
        </div>

      </div>
    </div>
  )
}
