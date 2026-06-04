import type { Block } from './parser'
import type { TemplateTheme } from '../themes'

export const CANVAS_W = 1080
export const CANVAS_H = 1440

export type Page = {
  index: number
  blocks: Block[]
}

// Estimate rendered height of a block given theme settings.
function estimateHeight(block: Block, theme: TemplateTheme): number {
  const contentW = CANVAS_W - theme.padX * 2
  const { size: bSize, lineHeight: bLH } = theme.body
  const lineH = bSize * bLH

  function lines(text: string, fontSize: number): number {
    const charsPerLine = Math.floor(contentW / fontSize)
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
      return nLines * lineH + padY * 2 + 36 * 2
    }
    case 'list': {
      const itemH = lineH + 12
      return block.items.length * itemH + 24
    }
    case 'image':
      return 400 + (block.caption ? 32 : 0) + 24
    case 'divider':
      return 1 + 44 * 2
    default:
      return 0
  }
}

// Split text at a line boundary. Returns [fits, overflow].
// Uses 95% of availLines as safety margin against estimation error.
function splitText(
  text: string,
  availLines: number,
  contentW: number,
  fontSize: number
): [string, string] {
  const safeLines = Math.max(1, Math.floor(availLines * 0.95))
  const charsPerLine = Math.floor(contentW / fontSize)
  if (charsPerLine <= 0 || safeLines <= 0) return ['', text]

  let lineUnits = 0
  let lineCount = 0

  for (let i = 0; i < text.length; i++) {
    const unit = /[一-鿿　-〿＀-￯]/.test(text[i]) ? 1 : 0.6
    lineUnits += unit

    if (lineUnits >= charsPerLine) {
      lineCount++
      lineUnits = 0

      if (lineCount >= safeLines) {
        // Prefer to break after a space (avoid mid-word split for Latin)
        let breakAt = i + 1
        for (let j = i; j >= Math.max(0, i - 12); j--) {
          if (text[j] === ' ') { breakAt = j + 1; break }
        }
        return [text.slice(0, breakAt).trim(), text.slice(breakAt).trim()]
      }
    }
  }

  return [text, '']  // all fits
}

export function paginate(blocks: Block[], theme: TemplateTheme, coverImageH = 0): Page[] {
  if (blocks.length === 0) return []

  const normalAvailH = CANVAS_H - theme.padY * 2
  const page0AvailH = coverImageH > 0
    ? CANVAS_H - coverImageH - Math.round(theme.padY * 0.75) - theme.padY
    : normalAvailH

  const contentW = CANVAS_W - theme.padX * 2
  const { size: bSize, lineHeight: bLH } = theme.body
  const lineH = bSize * bLH
  const minSplitLines = 2  // don't bother splitting if < 2 lines would fit

  const pages: Page[] = []
  let current: Block[] = []
  let usedH = 0

  function availH() {
    return pages.length === 0 ? page0AvailH : normalAvailH
  }

  function newPage() {
    pages.push({ index: pages.length, blocks: current })
    current = []
    usedH = 0
  }

  for (const block of blocks) {
    const h = estimateHeight(block, theme)
    const remaining = availH() - usedH

    if (h <= remaining) {
      current.push(block)
      usedH += h
      continue
    }

    // ── paragraph: split at line boundary ──────────────────────────────
    if (block.type === 'paragraph' && current.length > 0) {
      const availLines = Math.floor(remaining / lineH)
      if (availLines >= minSplitLines) {
        const [first, rest] = splitText(block.text, availLines, contentW, bSize)
        if (first) { current.push({ type: 'paragraph', text: first }); usedH += estimateHeight({ type: 'paragraph', text: first }, theme) }
        newPage()
        if (rest) { current.push({ type: 'paragraph', text: rest }); usedH = estimateHeight({ type: 'paragraph', text: rest }, theme) }
        continue
      }
    }

    // ── list: split at item boundary ───────────────────────────────────
    if (block.type === 'list' && current.length > 0) {
      const perItemH = lineH + 12
      const fitsCount = Math.max(0, Math.floor((remaining - 24) / perItemH))
      if (fitsCount >= 1 && fitsCount < block.items.length) {
        const firstItems = block.items.slice(0, fitsCount)
        const restItems  = block.items.slice(fitsCount)
        current.push({ type: 'list', items: firstItems, ordered: block.ordered, startIndex: block.startIndex })
        newPage()
        current.push({ type: 'list', items: restItems, ordered: block.ordered, startIndex: block.ordered ? (block.startIndex ?? 1) + fitsCount : undefined })
        usedH = estimateHeight({ type: 'list', items: restItems, ordered: block.ordered }, theme)
        continue
      }
    }

    // ── everything else (quote / subtitle / title / divider / image) ───
    // treat as atomic: push current page, start fresh
    if (current.length > 0) newPage()
    current.push(block)
    usedH = h
  }

  if (current.length > 0) {
    pages.push({ index: pages.length, blocks: current })
  }

  return pages
}
