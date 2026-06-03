import type { Page } from '../lib/paginator'
import { CANVAS_W, CANVAS_H } from '../lib/paginator'
import type { TemplateTheme } from '../themes'
import type { Block } from '../lib/parser'

import type { AuthorConfig } from '../store'

type Props = {
  page: Page
  theme: TemplateTheme
  author?: AuthorConfig
  showAuthor?: boolean
  coverEnabled?: boolean
  coverImage?: string | null
  setRef?: (el: HTMLDivElement | null) => void
}

// Convert inline markdown to HTML: **bold**, *italic*, ~~del~~, `code`
function inlineHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
    .replace(/\*+/g, '')  // strip leftover unmatched asterisks
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    .replace(/`(.+?)`/g, '<code style="font-size:.88em;background:rgba(0,0,0,.06);padding:2px 6px;border-radius:4px">$1</code>')
}

function Inline({ text }: { text: string }) {
  return <span dangerouslySetInnerHTML={{ __html: inlineHtml(text) }} />
}

function renderBlock(block: Block, theme: TemplateTheme, key: number) {
  const { body, h2, verse: v, muted } = theme

  switch (block.type) {
    case 'title':
      return (
        <div key={key} style={{
          fontSize: theme.cover.titleSize,
          fontWeight: theme.cover.titleWeight,
          lineHeight: 1.2,
          color: h2.color,
          marginBottom: 24,
          letterSpacing: '-.01em',
        }}><Inline text={block.text} /></div>
      )
    case 'subtitle':
      return (
        <h2 key={key} style={{
          fontSize: h2.size,
          fontWeight: h2.weight,
          lineHeight: h2.lineHeight,
          color: h2.color,
          margin: '56px 0 20px',
          padding: 0,
        }}><Inline text={block.text} /></h2>
      )
    case 'paragraph':
      return (
        <p key={key} style={{
          fontSize: body.size,
          fontWeight: body.weight,
          lineHeight: body.lineHeight,
          color: body.color,
          marginBottom: 24,
          letterSpacing: '.02em',
        }}><Inline text={block.text} /></p>
      )
    case 'quote':
      return (
        <div key={key} style={{
          borderLeft: v.borderLeft,
          background: v.background ?? undefined,
          padding: `${v.paddingY} ${v.paddingX || theme.padX + 'px'} ${v.paddingY} ${v.paddingLeft}`,
          margin: '36px 0',
          fontSize: body.size + 2,
          fontWeight: v.fontWeight,
          lineHeight: body.lineHeight,
          color: h2.color,
        }}><Inline text={block.text} /></div>
      )
    case 'list':
      return (
        <div key={key} style={{
          fontSize: body.size,
          fontWeight: body.weight,
          lineHeight: body.lineHeight,
          color: body.color,
          marginBottom: 24,
        }}>
          {block.items.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <span style={{ color: muted, flexShrink: 0 }}>
                {block.ordered ? `${idx + 1}.` : '·'}
              </span>
              <span><Inline text={item} /></span>
            </div>
          ))}
        </div>
      )
    case 'image':
      return (
        <div key={key} style={{ margin: '24px 0' }}>
          <img src={block.src} style={{ width: '100%', display: 'block', borderRadius: 4 }} alt={block.caption} />
          {block.caption && (
            <div style={{ fontSize: body.size - 4, color: muted, marginTop: 8, textAlign: 'center' }}>
              {block.caption}
            </div>
          )}
        </div>
      )
    case 'divider':
      return <div key={key} style={{ height: 1, background: muted + '33', margin: '44px 0' }} />
    default:
      return null
  }
}

export function PageCanvas({ page, theme, author, showAuthor, coverEnabled, coverImage, setRef }: Props) {
  const isFirst = page.index === 0
  const displayAuthor = showAuthor && isFirst && author && (author.name || author.avatar)
  const showCoverImg = coverEnabled && coverImage && isFirst

  return (
    <div
      ref={setRef}
      data-page={page.index}
      style={{
        width: CANVAS_W,
        height: CANVAS_H,
        background: theme.background,
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Cover image — full-width, flush top, no padding */}
      {showCoverImg && (
        <img
          src={coverImage!}
          style={{
            width: CANVAS_W,
            height: theme.cover.imageHeight,
            objectFit: 'cover',
            display: 'block',
            flexShrink: 0,
          }}
          alt=""
        />
      )}

      {/* Top bar (theme accent) */}
      {!showCoverImg && theme.cover.topBar && (
        <div style={{ width: '100%', height: 7, background: theme.cover.topBar }} />
      )}

      <div style={{
        padding: showCoverImg
          ? `${Math.round(theme.padY * 0.75)}px ${theme.padX}px ${theme.padY}px`
          : `${theme.padY}px ${theme.padX}px`,
        fontFamily: theme.cnFont,
        height: showCoverImg
          ? CANVAS_H - theme.cover.imageHeight
          : theme.cover.topBar ? CANVAS_H - 7 : CANVAS_H,
        overflow: 'hidden',
      }}>
        {page.blocks.map((block, i) => (
          <div key={i} style={{ display: 'contents' }}>
            {renderBlock(block, theme, i)}
            {/* Author row — after title block on first page */}
            {displayAuthor && i === 0 && block.type === 'title' && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                marginTop: 16,
                marginBottom: 36,
              }}>
                {author!.avatar ? (
                  <>
                    <img
                      src={author!.avatar}
                      style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                      alt=""
                    />
                    {author!.name && (
                      <span style={{
                        fontSize: theme.h2.size * 0.6,
                        fontWeight: 500,
                        color: theme.h2.color,
                        letterSpacing: '.02em',
                      }}>{author!.name}</span>
                    )}
                  </>
                ) : (
                  author!.name && (
                    <span style={{
                      fontSize: theme.h2.size * 0.6,
                      fontWeight: 400,
                      color: theme.muted,
                      letterSpacing: '.02em',
                    }}>作者：{author!.name}</span>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Page number */}
      <div style={{
        position: 'absolute',
        bottom: 40,
        right: theme.padX,
        fontSize: 22,
        fontFamily: theme.enFont,
        color: theme.muted,
        letterSpacing: '.1em',
      }}>
        {String(page.index + 1).padStart(2, '0')}
      </div>
    </div>
  )
}
