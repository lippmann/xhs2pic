import { themeList } from '../themes'
import { useStore } from '../store'

const FONT_OPTIONS = [
  { label: '霞鹜文楷', value: '"LXGW WenKai","Noto Serif SC","Songti SC",serif' },
  { label: '思源宋体', value: '"Noto Serif SC","Source Han Serif SC","Songti SC",Georgia,serif' },
  { label: '思源黑体', value: '"Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif' },
  { label: '朱雀仿宋', value: '"Zhuque Fangsong","FangSong","STFangsong",serif' },
]

export function StylePanel() {
  const { themeId, setThemeId, styleOverrides, setStyleOverride, resetStyleOverrides, getTheme } = useStore()
  const theme = getTheme()

  const activeFontValue = styleOverrides.cnFont ?? theme.cnFont

  return (
    <div className="flex flex-col gap-4">

      {/* Theme picker */}
      <div className="bg-white rounded-xl p-4">
        <div className="text-xs text-gray-400 mb-3">主题</div>
        <div className="grid grid-cols-2 gap-2">
          {themeList.map(t => (
            <button
              key={t.id}
              onClick={() => setThemeId(t.id)}
              className={`py-2 px-3 rounded-lg text-sm text-left transition border ${
                themeId === t.id
                  ? 'border-gray-800 bg-gray-50 text-gray-800 font-medium'
                  : 'border-gray-100 hover:border-gray-300 text-gray-600'
              }`}
              style={{ fontFamily: t.cnFont }}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Font picker */}
      <div className="bg-white rounded-xl p-4">
        <div className="text-xs text-gray-400 mb-3">字体</div>
        <div className="flex flex-col gap-1.5">
          {FONT_OPTIONS.map(f => (
            <button
              key={f.value}
              onClick={() => setStyleOverride('cnFont', f.value)}
              className={`py-2 px-3 rounded-lg text-sm text-left transition border ${
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
      <div className="bg-white rounded-xl p-4 flex flex-col gap-4">
        <div className="text-xs text-gray-400">排版</div>

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

        {Object.keys(styleOverrides).length > 0 && (
          <button
            onClick={resetStyleOverrides}
            className="text-xs text-gray-400 hover:text-gray-600 text-left transition"
          >
            恢复默认
          </button>
        )}
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
