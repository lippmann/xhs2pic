import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { defaultThemeId, type TemplateTheme, themes } from '../themes'
import type { Block } from '../lib/parser'

export type AuthorConfig = {
  name: string
  avatar: string | null  // base64 data URL
}

export type StyleOverrides = {
  bodySize?: number
  lineHeight?: number
  padX?: number
  padY?: number
  cnFont?: string
}

type Store = {
  // content
  rawText: string
  blocks: Block[]
  setRawText: (text: string) => void
  setBlocks: (blocks: Block[]) => void

  // theme
  themeId: string
  styleOverrides: StyleOverrides
  setThemeId: (id: string) => void
  setStyleOverride: (key: keyof StyleOverrides, value: string | number) => void
  deleteStyleOverrides: (keys: (keyof StyleOverrides)[]) => void
  resetStyleOverrides: () => void
  getTheme: () => TemplateTheme

  // author (persisted)
  author: AuthorConfig
  showAuthor: boolean
  setAuthor: (author: Partial<AuthorConfig>) => void
  setShowAuthor: (v: boolean) => void

  // cover
  coverEnabled: boolean
  coverImage: string | null
  setCoverEnabled: (v: boolean) => void
  setCoverImage: (src: string | null) => void
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      rawText: '',
      blocks: [],
      setRawText: (rawText) => set({ rawText }),
      setBlocks: (blocks) => set({ blocks }),

      themeId: defaultThemeId,
      styleOverrides: {},
      setThemeId: (themeId) => set({ themeId }),
      setStyleOverride: (key, value) =>
        set(s => ({ styleOverrides: { ...s.styleOverrides, [key]: value } })),
      deleteStyleOverrides: (keys) =>
        set(s => {
          const next = { ...s.styleOverrides }
          keys.forEach(k => delete next[k])
          return { styleOverrides: next }
        }),
      resetStyleOverrides: () => set({ styleOverrides: {} }),
      getTheme: () => {
        const base = themes[get().themeId] ?? themes[defaultThemeId]
        const ov = get().styleOverrides
        return {
          ...base,
          padX: ov.padX ?? base.padX,
          padY: ov.padY ?? base.padY,
          cnFont: ov.cnFont ?? base.cnFont,
          body: {
            ...base.body,
            size: ov.bodySize ?? base.body.size,
            lineHeight: ov.lineHeight ?? base.body.lineHeight,
          },
        }
      },

      author: { name: '', avatar: null },
      showAuthor: true,
      setAuthor: (partial) =>
        set(s => ({ author: { ...s.author, ...partial } })),
      setShowAuthor: (showAuthor) => set({ showAuthor }),

      coverEnabled: false,
      coverImage: null,
      setCoverEnabled: (coverEnabled) => set({ coverEnabled }),
      setCoverImage: (coverImage) => set({ coverImage }),
    }),
    {
      name: 'xhs2pic-store',
      partialize: (s) => ({
        themeId: s.themeId,
        author: s.author,
        showAuthor: s.showAuthor,
        rawText: s.rawText,
        coverEnabled: s.coverEnabled,
      }),
    }
  )
)
