import { useCallback, useRef } from 'react'
import { useStore } from '../store'
import { parseDocx } from '../lib/docxParser'

export function EditorPanel() {
  const { rawText, setRawText, setBlocks } = useStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext === 'docx') {
      const blocks = await parseDocx(file)
      setRawText(`(docx: ${file.name})`)
      setBlocks(blocks)
    } else {
      const text = await file.text()
      setRawText(text)
    }
  }, [setRawText, setBlocks])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  return (
    <div
      className="bg-white rounded-xl overflow-hidden flex flex-col flex-1 min-h-0"
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 flex-shrink-0">
        <span className="text-xs text-gray-400">支持 Markdown · 可拖入文件</span>
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs px-3 py-1 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-600 transition"
          >
            上传文件
          </button>
          {rawText && (
            <button
              onClick={() => { setRawText(''); setBlocks([]) }}
              className="text-xs px-3 py-1 hover:bg-gray-50 rounded-lg text-gray-400 transition"
            >
              清空
            </button>
          )}
        </div>
      </div>
      <textarea
        value={rawText}
        onChange={e => setRawText(e.target.value)}
        placeholder={`在这里粘贴或输入文章内容……\n\n# 标题\n## 小标题\n> 引文\n- 列表`}
        className="p-4 text-sm text-gray-700 resize-none outline-none leading-relaxed flex-1 min-h-0"
        spellCheck={false}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.docx"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
    </div>
  )
}
