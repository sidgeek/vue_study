import type MarkdownIt from 'markdown-it'

function escapeAttr(s: string) {
  return s.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch] as string))
}
function normalizeJson(raw: string): any {
  const norm = raw
    .replace(/[“”]/g, '"')
    .replace(/，/g, ',')
    .replace(/：/g, ':')
    .replace(/,\s*([}\]])/g, '$1')
  try { return JSON.parse(norm) } catch { return {} }
}
function safeLink(url: string) {
  const u = String(url || '').trim()
  if (!u) return '#'
  return u.startsWith('http') ? u : `http://${u}`
}

export function cardPlugin(md: MarkdownIt, opts?: { mode?: 'component' | 'html' }) {
  const ruler = md.block.ruler
  ruler.before('paragraph', 'llm-block', (state, startLine, endLine, silent) => {
    const s0 = state.bMarks[startLine] + state.tShift[startLine]
    const e0 = state.eMarks[startLine]
    const first = state.src.slice(s0, e0)
    const head = first.trim()
    const kindMatch = head.match(/^@(analysis-result|dataset-card|dashboard-card)\b/)
    if (!kindMatch) return false
    if (silent) return true
    const kind = kindMatch[1]
    const p = head.indexOf('{')
    if (p < 0) return false
    let acc = head.slice(p)
    let depth = 0
    for (let i = 0; i < acc.length; i++) {
      const ch = acc.charCodeAt(i)
      if (ch === 123) depth++
      else if (ch === 125) depth--
    }
    let line = startLine + 1
    while (depth > 0 && line < endLine) {
      const s = state.bMarks[line] + state.tShift[line]
      const e = state.eMarks[line]
      const txt = state.src.slice(s, e).trim()
      acc += '\n' + txt
      for (let i = 0; i < txt.length; i++) {
        const ch = txt.charCodeAt(i)
        if (ch === 123) depth++
        else if (ch === 125) depth--
      }
      line++
    }
    if (depth !== 0) return false
    const token = state.push('llm-block', 'div', 0)
    token.meta = { json: acc, kind }
    try { console.debug('[llm-block] parsed', { kind, startLine, endLine: line }) } catch {}
    state.line = line
    return true
  })

  md.renderer.rules['llm-block'] = (tokens, idx) => {
    const meta = tokens[idx].meta as any
    const json = meta?.json as string
    const kind = meta?.kind as string
    try { console.debug('[llm-block] render', { kind }) } catch {}
    if (opts?.mode === 'html') {
      const data = normalizeJson(json)
      if (kind === 'analysis-result') {
        const title = escapeAttr(String(data.title || ''))
        const items = Array.isArray(data.items) ? data.items : []
        const rows = items.map((it: any) => `<div class=\"row\"><span class=\"label\">${escapeAttr(String(it.label||''))}</span><span class=\"value\">${escapeAttr(String(it.value||''))}</span></div>`).join('')
        return `<div class=\"card analysis\" data-kind=\"analysis-result\"><div class=\"hdr\"><span class=\"title\">${title}</span></div><div class=\"body\">${rows}</div></div>`
      }
      if (kind === 'dataset-card') {
        const title = escapeAttr(String(data.title || ''))
        const name = escapeAttr(String(data.name || ''))
        const value = escapeAttr(String(data.value ?? ''))
        return `<div class=\"card dataset\" data-kind=\"dataset-card\"><div class=\"hdr\"><span class=\"title\">${title}</span><span class=\"tag\">${name}</span></div><div class=\"val\">${value}</div></div>`
      }
      if (kind === 'dashboard-card') {
        const title = escapeAttr(String(data.title || ''))
        const linkText = escapeAttr(String(data.linkText || '查看'))
        const href = escapeAttr(safeLink(String(data.link || '')))
        return `<div class=\"card dashboard\" data-kind=\"dashboard-card\"><div class=\"hdr\"><span class=\"title\">${title}</span></div><a class=\"link\" href=\"${href}\" target=\"_blank\" rel=\"noopener noreferrer\">${linkText}</a></div>`
      }
      const safe = escapeAttr(json.replace(/'/g, '&#39;'))
      return `<pre class=\"card raw\">${safe}</pre>`
    }
    return `<div class=\"md-${kind}\" data-props='${escapeAttr(json.replace(/'/g, '&#39;'))}'></div>`
  }
}

export default cardPlugin