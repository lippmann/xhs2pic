export type Block =
  | { type: 'title';     text: string }
  | { type: 'subtitle';  text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'quote';     text: string }
  | { type: 'list';      items: string[]; ordered: boolean; startIndex?: number }
  | { type: 'image';     src: string; caption?: string }
  | { type: 'divider' }

export function parseMarkdown(md: string): Block[] {
  // Split on every newline — each line is its own potential block.
  // Empty lines are skipped; they act as visual separators but don't affect structure.
  const lines = md.split('\n').map(s => s.trim())
  const raw: Block[] = []

  for (const line of lines) {
    if (!line) continue

    // h3-h6 → subtitle
    if (/^#{3,6}/.test(line)) {
      raw.push({ type: 'subtitle', text: line.replace(/^#{3,6}\s*/, '').trim() })
      continue
    }
    // h2 → subtitle
    if (/^##/.test(line)) {
      raw.push({ type: 'subtitle', text: line.replace(/^##\s*/, '').trim() })
      continue
    }
    // h1 → title
    if (/^#/.test(line)) {
      raw.push({ type: 'title', text: line.replace(/^#\s*/, '').trim() })
      continue
    }
    // blockquote — consecutive `>` lines merge into one block, separated by \n
    if (/^>/.test(line)) {
      const text = line.replace(/^>\s*/, '').trim()
      const prev = raw[raw.length - 1]
      if (prev?.type === 'quote') {
        prev.text += '\n' + text
      } else {
        raw.push({ type: 'quote', text })
      }
      continue
    }
    // hr
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
      raw.push({ type: 'divider' })
      continue
    }
    // ordered list — `1.` `1、` `1。`
    if (/^\d+[.、。]\s*/.test(line)) {
      const numMatch = line.match(/^(\d+)/)
      const num = numMatch ? parseInt(numMatch[1]) : 1
      const text = line.replace(/^\d+[.、。]\s*/, '').trim()
      const prev = raw[raw.length - 1]
      // Merge only if previous block is an ordered list AND this continues the sequence
      if (prev?.type === 'list' && prev.ordered && num === (prev.startIndex ?? 1) + prev.items.length) {
        prev.items.push(text)
      } else {
        raw.push({ type: 'list', items: [text], ordered: true, startIndex: num })
      }
      continue
    }
    // unordered list — `-` `+` `·` `•` or `* ` (exclude `**` bold)
    if (/^[-+·•]\s*/.test(line) || (/^\*(?!\*)/.test(line) && /^\*\s+\S/.test(line))) {
      const text = line.replace(/^[-*+·•]\s*/, '').trim()
      const prev = raw[raw.length - 1]
      if (prev?.type === 'list' && !prev.ordered) {
        prev.items.push(text)
      } else {
        raw.push({ type: 'list', items: [text], ordered: false })
      }
      continue
    }
    // image
    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/)
    if (imgMatch) {
      raw.push({ type: 'image', src: imgMatch[2], caption: imgMatch[1] || undefined })
      continue
    }
    // paragraph — each non-empty line is its own paragraph
    raw.push({ type: 'paragraph', text: line })
  }

  return raw
}

export function parsePlainText(text: string): Block[] {
  return parseMarkdown(text)
}
