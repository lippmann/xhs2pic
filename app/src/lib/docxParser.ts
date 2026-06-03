import mammoth from 'mammoth'
import { parseMarkdown, type Block } from './parser'

export async function parseDocx(file: File): Promise<Block[]> {
  const arrayBuffer = await file.arrayBuffer()
  // mammoth browser build only exposes convertToHtml
  const result = await mammoth.convertToHtml({ arrayBuffer })
  // Convert HTML to a rough markdown-style text, then parse
  const md = result.value
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, '> $1\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
  return parseMarkdown(md)
}
