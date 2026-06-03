import type { Block } from './parser'
import type { TemplateTheme } from '../themes'

export const CANVAS_W = 1080
export const CANVAS_H = 1440

export type Page = {
  index: number
  blocks: Block[]
}

// Estimate rendered height of a block given theme settings.
// Uses character-count heuristics — fast, font-independent.
function estimateHeight(block: Block, theme: TemplateTheme): number {
  const contentW = CANVAS_W - theme.padX * 2  // usable width in px
  const { size: bSize, lineHeight: bLH } = theme.body
  const lineH = bSize * bLH  // px per line

  // How many characters fit on one line (rough: 1 CJK char ≈ 1 em, 1 latin ≈ 0.6 em)
  function lines(text: string, fontSize: number): number {
    const charsPerLine = Math.floor(contentW / fontSize)
    // count CJK as 1 unit, latin as 0.6
    const units = [...text].reduce((n, c) => n + (/[一-鿿　-〿＀-￯]/.test(c) ? 1 : 0.6), 0)
    return Math.max(1, Math.ceil(units / charsPerLine))
  }

  switch (block.type) {
    case 'title': {
      const fs = theme.cover.titleSize
      return lines(block.text, fs) * fs * 1.2 + 24
    }
    case 'subtitle': {
      const fs = theme.h2.size
      return lines(block.text, fs) * fs * theme.h2.lineHeight + 56 + 20
    }
    case 'paragraph': {
      return lines(block.text, bSize) * lineH + 24
    }
    case 'quote': {
      const innerW = contentW - parseInt(theme.verse.paddingLeft) - 40
      const charsPerLine = Math.floor(innerW / bSize)
      const units = [...block.text].reduce((n, c) => n + (/[一-鿿]/.test(c) ? 1 : 0.6), 0)
      const nLines = Math.max(1, Math.ceil(units / charsPerLine))
      const padY = parseInt(theme.verse.paddingY) || 32
      return nLines * lineH + padY * 2 + 36 * 2  // margins
    }
    case 'list': {
      const itemH = lineH + 12
      return block.items.length * itemH + 24
    }
    case 'image':
      return 400 + (block.caption ? 32 : 0) + 24  // fixed estimate
    case 'divider':
      return 1 + 44 * 2
    default:
      return 0
  }
}

export function paginate(blocks: Block[], theme: TemplateTheme, coverImageH = 0): Page[] {
  if (blocks.length === 0) return []

  const normalAvailH = CANVAS_H - theme.padY * 2
  // When cover image is present, top padding shrinks to 0.75*padY
  const page0AvailH = coverImageH > 0
    ? CANVAS_H - coverImageH - Math.round(theme.padY * 0.75) - theme.padY
    : normalAvailH

  const pages: Page[] = []
  let current: Block[] = []
  let usedH = 0

  for (const block of blocks) {
    const h = estimateHeight(block, theme)
    const availH = pages.length === 0 ? page0AvailH : normalAvailH
    if (usedH + h > availH && current.length > 0) {
      pages.push({ index: pages.length, blocks: current })
      current = [block]
      usedH = h
    } else {
      current.push(block)
      usedH += h
    }
  }

  if (current.length > 0) {
    pages.push({ index: pages.length, blocks: current })
  }

  return pages
}
