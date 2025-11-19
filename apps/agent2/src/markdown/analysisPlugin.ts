import type MarkdownIt from 'markdown-it'

function escapeAttr(s: string) {
  return s.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch] as string))
}
function normalizeJson(raw: string): any {
  const norm = raw
    .replace(/[“”]/g, '"')
    .replace(/，/g, ',')
    .replace(/：/g, ':')
    .replace(/,(\s*[}\]])/g, '$1')
  try { return JSON.parse(norm) } catch { return {} }
}
function safeLink(url: string) {
  const u = String(url || '').trim()
  if (!u) return '#'
  return u.startsWith('http') ? u : `http://${u}`
}

export default function analysisPlugin(md: MarkdownIt) {
  const ruler = md.block.ruler
  const parseBlock = (state: any, startLine: number, endLine: number, silent: boolean, kind: 'analysis' | 'dataset' | 'dashboard') => {
    const s0 = state.bMarks[startLine] + state.tShift[startLine]
    const e0 = state.eMarks[startLine]
    const first = state.src.slice(s0, e0)
    const ok = kind === 'analysis' ? /^@analysis-result\b/.test(first) : (kind === 'dataset' ? /^@dataset-card\b/.test(first) : /^@dashboard-card\b/.test(first))
    if (!ok) return false
    if (silent) return true
    const p = first.indexOf('{')
    if (p < 0) return false
    let acc = first.slice(p)
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
      const txt = state.src.slice(s, e)
      acc += '\n' + txt
      for (let i = 0; i < txt.length; i++) {
        const ch = txt.charCodeAt(i)
        if (ch === 123) depth++
        else if (ch === 125) depth--
      }
      line++
    }
    if (depth !== 0) return false
    const token = state.push(kind, 'div', 0)
    token.meta = { json: acc }
    state.line = line
    return true
  }

  ruler.before('paragraph', 'analysis', (state, startLine, endLine, silent) => parseBlock(state, startLine, endLine, silent, 'analysis'))
  ruler.before('paragraph', 'dataset', (state, startLine, endLine, silent) => parseBlock(state, startLine, endLine, silent, 'dataset'))
  ruler.before('paragraph', 'dashboard', (state, startLine, endLine, silent) => parseBlock(state, startLine, endLine, silent, 'dashboard'))

  md.renderer.rules['analysis'] = (tokens, idx) => {
    const json = tokens[idx].meta?.json as string
    return `<div class=\"md-analysis\" data-analysis='${escapeAttr(json.replace(/'/g, '&#39;'))}'></div>`
  }
  md.renderer.rules['dataset'] = (tokens, idx) => {
    const raw = tokens[idx].meta?.json as string
    const data = normalizeJson(raw)
    const title = escapeAttr(String(data.title || ''))
    const name = escapeAttr(String(data.name || ''))
    const value = escapeAttr(String(data.value ?? ''))
    return `<div class=\"card\"><div class=\"hdr\"><span class=\"title\">${title}</span><span class=\"tag\">${name}</span></div><div class=\"val\">${value}</div></div>`
  }
  md.renderer.rules['dashboard'] = (tokens, idx) => {
    const raw = tokens[idx].meta?.json as string
    const data = normalizeJson(raw)
    const title = escapeAttr(String(data.title || ''))
    const linkText = escapeAttr(String(data.linkText || '查看'))
    const href = escapeAttr(safeLink(String(data.link || '')))
    return `<div class=\"card\"><div class=\"hdr\"><span class=\"title\">${title}</span></div><a class=\"link\" href=\"${href}\" target=\"_blank\" rel=\"noopener noreferrer\">${linkText}</a></div>`
  }
}
