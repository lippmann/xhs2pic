import { useRef } from 'react'
import { themeList } from '../themes'
import { useStore } from '../store'

const FONT_OPTIONS = [
  { label: '霞鹜文楷', value: '"LXGW WenKai","Noto Serif SC","Songti SC",serif' },
  { label: '思源宋体', value: '"Noto Serif SC","Source Han Serif SC","Songti SC",Georgia,serif' },
  { label: '思源黑体', value: '"Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif' },
  { label: '朱雀仿宋', value: '"Zhuque Fangsong","FangSong","STFangsong",serif' },
]

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: 44, height: 24, borderRadius: 12,
        background: on ? '#1f2937' : '#d1d5db',
        border: 'none', cursor: 'pointer', padding: 3,
        display: 'flex', alignItems: 'center',
        justifyContent: on ? 'flex-end' : 'flex-start',
        flexShrink: 0, transition: 'background .2s',
      }}
    >
      <span style={{
        width: 18, height: 18, borderRadius: '50%',
        background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.2)',
        display: 'block', flexShrink: 0,
      }} />
    </button>
  )
}

function ResetButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-xs text-gray-400 hover:text-gray-600 transition self-start"
    >
      恢复默认
    </button>
  )
}

export function StylePanel() {
  const {
    themeId, setThemeId,
    styleOverrides, setStyleOverride, deleteStyleOverrides, getTheme,
    author, setAuthor, showAuthor, setShowAuthor,
    coverEnabled, setCoverEnabled, coverImage, setCoverImage,
  } = useStore()
  const theme = getTheme()
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const activeFontValue = styleOverrides.cnFont ?? theme.cnFont
  const hasFontOverride = !!styleOverrides.cnFont
  const hasTypoOverride = styleOverrides.bodySize != null || styleOverrides.lineHeight != null || styleOverrides.padX != null

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setAuthor({ avatar: ev.target?.result as string })
    reader.readAsDataURL(file)
  }

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setCoverImage(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col gap-3">

      {/* Display toggles */}
      <div className="bg-white rounded-xl p-3 flex flex-col gap-2 flex-shrink-0">

        {/* Cover toggle */}
        <div className="flex flex-col gap-0">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">显示封面</span>
            <Toggle on={coverEnabled} onToggle={() => setCoverEnabled(!coverEnabled)} />
          </div>
          {coverEnabled && (
            <div className="mt-2">
              {coverImage ? (
                <div className="relative">
                  <img
                    src={coverImage}
                    className="w-full rounded-lg object-cover"
                    style={{ maxHeight: 90 }}
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
                  onClick={() => coverInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-200 hover:border-gray-300 rounded-lg py-2.5 text-xs text-gray-400 hover:text-gray-500 transition"
                >
                  点击上传封面图
                </button>
              )}
              <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
            </div>
          )}
        </div>

        <div className="border-t border-gray-100" />

        {/* Author toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">显示作者</span>
          <Toggle on={showAuthor} onToggle={() => setShowAuthor(!showAuthor)} />
        </div>
        {showAuthor && (
          <div className="flex items-center gap-2">
            <div className="relative flex-shrink-0">
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 hover:opacity-80 transition block"
                title="上传头像"
              >
                {author.avatar
                  ? <img src={author.avatar} className="w-full h-full object-cover" alt="" />
                  : <span className="text-base flex items-center justify-center h-full text-gray-400">+</span>
                }
              </button>
              {author.avatar && (
                <button
                  onClick={() => setAuthor({ avatar: null })}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-gray-700 hover:bg-gray-900 text-white rounded-full flex items-center justify-center text-xs leading-none transition"
                  title="删除头像"
                >×</button>
              )}
            </div>
            <input
              type="text"
              value={author.name}
              onChange={e => setAuthor({ name: e.target.value })}
              placeholder="作者名称"
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-gray-400"
            />
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>
        )}
      </div>

      {/* Theme picker */}
      <div className="bg-white rounded-xl p-3">
        <div className="text-xs text-gray-400 mb-2">主题</div>
        <div className="grid grid-cols-2 gap-1.5">
          {themeList.map(t => (
            <button
              key={t.id}
              onClick={() => setThemeId(t.id)}
              className={`py-1 px-2 rounded-lg text-sm text-left transition border ${
                themeId === t.id
                  ? 'border-gray-800 bg-gray-50 text-gray-800 font-medium'
                  : 'border-gray-100 hover:border-gray-300 text-gray-600'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Font picker */}
      <div className="bg-white rounded-xl p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">字体</span>
          {hasFontOverride && (
            <ResetButton onClick={() => deleteStyleOverrides(['cnFont'])} />
          )}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {FONT_OPTIONS.map(f => (
            <button
              key={f.value}
              onClick={() => setStyleOverride('cnFont', f.value)}
              className={`py-1 px-2 rounded-lg text-sm text-left transition border ${
                activeFontValue === f.value
                  ? 'border-gray-800 bg-gray-50 text-gray-800 font-medium'
                  : 'border-gray-100 hover:border-gray-300 text-gray-600'
              }`}
              style={{ fontFamily: f.value }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Typography controls */}
      <div className="bg-white rounded-xl p-3 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">排版</span>
          {hasTypoOverride && (
            <ResetButton onClick={() => deleteStyleOverrides(['bodySize', 'lineHeight', 'padX'])} />
          )}
        </div>

        <Slider
          label="正文字号"
          value={styleOverrides.bodySize ?? theme.body.size}
          min={24} max={44} step={1}
          onChange={v => setStyleOverride('bodySize', v)}
        />
        <Slider
          label="行间距"
          value={styleOverrides.lineHeight ?? theme.body.lineHeight}
          min={1.4} max={2.8} step={0.1}
          onChange={v => setStyleOverride('lineHeight', v)}
          format={v => v.toFixed(1)}
        />
        <Slider
          label="页面边距"
          value={styleOverrides.padX ?? theme.padX}
          min={48} max={144} step={8}
          onChange={v => setStyleOverride('padX', v)}
          format={v => `${v}px`}
        />
      </div>

    </div>
  )
}

function Slider({
  label, value, min, max, step, onChange, format,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  format?: (v: number) => string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-xs text-gray-400 tabular-nums">{format ? format(value) : value}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-gray-800"
      />
    </div>
  )
}
