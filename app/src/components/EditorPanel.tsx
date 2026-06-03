import { useCallback, useRef } from 'react'
import { useStore } from '../store'
import { parseDocx } from '../lib/docxParser'

function CoverUpload() {
  const { coverImage, setCoverImage } = useStore()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => setCoverImage(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="mt-3">
      {coverImage ? (
        <div className="relative">
          <img
            src={coverImage}
            className="w-full rounded-lg object-cover"
            style={{ maxHeight: 120 }}
            alt="封面"
          />
          <button
            onClick={() => setCoverImage(null)}
            className="absolute top-1.5 right-1.5 w-6 h-6 bg-gray-800 hover:bg-gray-900 text-white rounded-full flex items-center justify-center text-xs leading-none transition"
            title="删除封面图"
          >×</button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-200 hover:border-gray-300 rounded-lg py-4 text-xs text-gray-400 hover:text-gray-500 transition"
        >
          点击上传封面图
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
    </div>
  )
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        background: on ? '#1f2937' : '#d1d5db',
        border: 'none',
        cursor: 'pointer',
        padding: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: on ? 'flex-end' : 'flex-start',
        flexShrink: 0,
        transition: 'background .2s',
      }}
    >
      <span style={{
        width: 18,
        height: 18,
        borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,.2)',
        display: 'block',
        flexShrink: 0,
      }} />
    </button>
  )
}

export function EditorPanel() {
  const { rawText, setRawText, setBlocks, author, setAuthor, showAuthor, setShowAuthor, coverEnabled, setCoverEnabled } = useStore()  const fileInputRef = useRef<HTMLInputElement>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)

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

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setAuthor({ avatar: ev.target?.result as string })
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Cover toggle */}
      <div className="bg-white rounded-xl p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">封面页</span>
          <Toggle on={coverEnabled} onToggle={() => setCoverEnabled(!coverEnabled)} />
        </div>
        {coverEnabled && <CoverUpload />}
      </div>

      {/* Author toggle + config */}
      <div className="bg-white rounded-xl p-4 flex flex-col gap-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">显示作者</span>
          <Toggle on={showAuthor} onToggle={() => setShowAuthor(!showAuthor)} />
        </div>
        {showAuthor && (
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 hover:opacity-80 transition block"
                title="上传头像"
              >
                {author.avatar
                  ? <img src={author.avatar} className="w-full h-full object-cover" alt="" />
                  : <span className="text-xl flex items-center justify-center h-full text-gray-400">+</span>
                }
              </button>
              {author.avatar && (
                <button
                  onClick={() => setAuthor({ avatar: null })}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-gray-700 hover:bg-gray-900 text-white rounded-full flex items-center justify-center text-xs leading-none transition"
                  title="删除头像"
                >×</button>
              )}
            </div>
            <input
              type="text"
              value={author.name}
              onChange={e => setAuthor({ name: e.target.value })}
              placeholder="作者名称"
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-gray-400"
            />
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>
        )}
      </div>

      {/* Text editor */}
      <div
        className="bg-white rounded-xl overflow-hidden flex flex-col"
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
          className="p-4 text-sm text-gray-700 resize-none outline-none leading-relaxed"
          style={{ minHeight: 320, height: 'auto' }}
          rows={16}
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

    </div>
  )
}
