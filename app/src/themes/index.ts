export type VerseStyle = {
  borderLeft: string
  background: string | null
  paddingLeft: string
  paddingY: string
  paddingX: string
  fontWeight: number
}

export type CoverStyle = {
  imageHeight: number
  titleSize: number
  titleWeight: number
  leadSize: number
  topBar: string | null
}

export type TemplateTheme = {
  id: string
  name: string
  background: string
  cnFont: string
  enFont: string
  padX: number
  padY: number
  body: { size: number; lineHeight: number; weight: number; color: string }
  h2: { size: number; lineHeight: number; weight: number; color: string }
  h3: { size: number; lineHeight: number; weight: number; color: string }
  muted: string
  verse: VerseStyle
  cover: CoverStyle
}

export const themes: Record<string, TemplateTheme> = {
  wenkai: {
    id: 'wenkai',
    name: '文楷',
    background: '#f9f6ef',
    cnFont: '"LXGW WenKai","Noto Serif SC","Songti SC",serif',
    enFont: '"EB Garamond","Lora",Georgia,serif',
    padX: 84,
    padY: 80,
    body: { size: 32, lineHeight: 1.92, weight: 400, color: '#3d3a32' },
    h2:   { size: 40, lineHeight: 1.28, weight: 500, color: '#1e1c18' },
    h3:   { size: 34, lineHeight: 1.40, weight: 500, color: '#1e1c18' },
    muted: '#5a5448',
    verse: {
      borderLeft: '3px solid #c8b89a',
      background: '#f1ece2',
      paddingLeft: '40px',
      paddingY: '32px',
      paddingX: '40px',
      fontWeight: 400,
    },
    cover: {
      imageHeight: 660,
      titleSize: 68,
      titleWeight: 500,
      leadSize: 32,
      topBar: null,
    },
  },

  meridian: {
    id: 'meridian',
    name: 'Meridian',
    background: '#f5f4ed',
    cnFont: '"Noto Serif SC","Source Han Serif SC","Songti SC",Georgia,serif',
    enFont: '"EB Garamond",Charter,Georgia,serif',
    padX: 84,
    padY: 80,
    body: { size: 34, lineHeight: 1.88, weight: 400, color: '#3d3d3a' },
    h2:   { size: 42, lineHeight: 1.28, weight: 500, color: '#141413' },
    h3:   { size: 34, lineHeight: 1.40, weight: 500, color: '#141413' },
    muted: '#504e49',
    verse: {
      borderLeft: '6px solid #1B365D',
      background: '#EEF2F7',
      paddingLeft: '44px',
      paddingY: '36px',
      paddingX: '44px',
      fontWeight: 400,
    },
    cover: {
      imageHeight: 660,
      titleSize: 66,
      titleWeight: 500,
      leadSize: 31,
      topBar: null,
    },
  },

  nuit: {
    id: 'nuit',
    name: 'Nuit',
    background: '#141413',
    cnFont: '"Noto Serif SC","Source Han Serif SC","Songti SC",Georgia,serif',
    enFont: '"EB Garamond",Charter,Georgia,serif',
    padX: 84,
    padY: 80,
    body: { size: 32, lineHeight: 1.92, weight: 400, color: '#9c9890' },
    h2:   { size: 44, lineHeight: 1.24, weight: 700, color: '#f0ede8' },
    h3:   { size: 36, lineHeight: 1.40, weight: 500, color: '#d8d4ce' },
    muted: '#6e6b64',
    verse: {
      borderLeft: '4px solid #2e2e2b',
      background: null,
      paddingLeft: '40px',
      paddingY: '32px',
      paddingX: '0px',
      fontWeight: 400,
    },
    cover: {
      imageHeight: 660,
      titleSize: 68,
      titleWeight: 700,
      leadSize: 32,
      topBar: null,
    },
  },

  sulcus: {
    id: 'sulcus',
    name: 'Sulcus',
    background: '#f7f6f1',
    cnFont: '"Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif',
    enFont: '"EB Garamond",Charter,Georgia,serif',
    padX: 96,
    padY: 80,
    body: { size: 30, lineHeight: 2.0, weight: 300, color: '#3a3936' },
    h2:   { size: 42, lineHeight: 1.22, weight: 700, color: '#141413' },
    h3:   { size: 32, lineHeight: 1.40, weight: 700, color: '#141413' },
    muted: '#5a5856',
    verse: {
      borderLeft: '1.5px solid #141413',
      background: null,
      paddingLeft: '36px',
      paddingY: '4px',
      paddingX: '0px',
      fontWeight: 400,
    },
    cover: {
      imageHeight: 600,
      titleSize: 66,
      titleWeight: 700,
      leadSize: 30,
      topBar: null,
    },
  },

  mint: {
    id: 'mint',
    name: 'Mint',
    background: '#f2f7f7',
    cnFont: '"Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif',
    enFont: '"EB Garamond",Charter,Georgia,serif',
    padX: 88,
    padY: 80,
    body: { size: 30, lineHeight: 2.0, weight: 400, color: '#0d2d3a' },
    h2:   { size: 42, lineHeight: 1.22, weight: 700, color: '#0d2d3a' },
    h3:   { size: 32, lineHeight: 1.40, weight: 700, color: '#1a4a56' },
    muted: '#3a7a82',
    verse: {
      borderLeft: '4px solid #5bc8c0',
      background: '#ddf2f0',
      paddingLeft: '40px',
      paddingY: '28px',
      paddingX: '40px',
      fontWeight: 400,
    },
    cover: {
      imageHeight: 620,
      titleSize: 66,
      titleWeight: 700,
      leadSize: 30,
      topBar: null,
    },
  },
}

export const themeList = Object.values(themes)
export const defaultThemeId = 'wenkai'
