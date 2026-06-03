export type Block =
  | { type: 'title';     text: string }
  | { type: 'subtitle';  text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'quote';     text: string }
  | { type: 'list';      items: string[]; ordered: boolean }
  | { type: 'image';     src: string; caption?: string }
  | { type: 'divider' }

export function parseMarkdown(md: string): Block[] {
  const blocks: Block[] = []
  const chunks = md.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean)

  for (const chunk of chunks) {
    const lines = chunk.split('\n')
    const first = lines[0]

    // h3-h6 → subtitle (check before h2/h1)
    if (/^#{3,6}/.test(first)) {
      blocks.push({ type: 'subtitle', text: first.replace(/^#{3,6}\s*/, '').trim() })
      continue
    }

    // h2
    if (/^##/.test(first)) {
      blocks.push({ type: 'subtitle', text: first.replace(/^##\s*/, '').trim() })
      continue
    }

    // h1
    if (/^#/.test(first)) {
      blocks.push({ type: 'title', text: first.replace(/^#\s*/, '').trim() })
      continue
    }

    // blockquote — `>` with or without space
    if (/^>/.test(first)) {
      const text = lines.map(l => l.replace(/^>\s*/, '')).join('\n')
      blocks.push({ type: 'quote', text: text.trim() })
      continue
    }

    // hr
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(first.trim())) {
      blocks.push({ type: 'divider' })
      continue
    }

    // ordered list — `1.` or `1. ` or `1、`
    if (/^\d+[.、。]\s*/.test(first)) {
      const items = lines
        .filter(l => /^\d+[.、。]\s*/.test(l))
        .map(l => l.replace(/^\d+[.、。]\s*/, '').trim())
      blocks.push({ type: 'list', items, ordered: true })
      continue
    }

    // unordered list — `-` `*` `+` with or without space, also `·` `•`
    // exclude `**` (bold) at start
    if (/^[-+·•]\s*/.test(first) || (/^\*(?!\*)/.test(first) && /^\*\s+\S/.test(first))) {
      const items = lines
        .filter(l => /^[-+·•]\s*/.test(l) || (/^\*(?!\*)/.test(l) && /^\*\s+\S/.test(l)))
        .map(l => l.replace(/^[-*+·•]\s*/, '').trim())
      blocks.push({ type: 'list', items, ordered: false })
      continue
    }

    // image
    const imgMatch = first.match(/^!\[([^\]]*)\]\(([^)]+)\)/)
    if (imgMatch) {
      blocks.push({ type: 'image', src: imgMatch[2], caption: imgMatch[1] || undefined })
      continue
    }

    // paragraph
    const text = lines.join('')
    if (text) blocks.push({ type: 'paragraph', text })
  }

  return blocks
}

export function parsePlainText(text: string): Block[] {
  return parseMarkdown(text)
}
