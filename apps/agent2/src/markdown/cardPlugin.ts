import type MarkdownIt from 'markdown-it'

function escapeAttr(s: string) {
  return s.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch] as string))
}

export function cardPlugin(md: MarkdownIt) {
  const ruler = md.block.ruler
  ruler.before('paragraph', 'llm-block', (state, startLine, endLine, silent) => {
    const s0 = state.bMarks[startLine] + state.tShift[startLine]
    const e0 = state.eMarks[startLine]
    const first = state.src.slice(s0, e0)
    const kindMatch = first.match(/^@(analysis-result|dataset-card|dashboard-card|card)\b/)
    if (!kindMatch) return false
    if (silent) return true
    const kind = kindMatch[1]
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
    const token = state.push('llm-block', 'div', 0)
    token.meta = { json: acc, kind }
    state.line = line
    return true
  })

  md.renderer.rules['llm-block'] = (tokens, idx) => {
    const meta = tokens[idx].meta as any
    const json = meta?.json as string
    const kind = meta?.kind as string
    return `<div class=\"md-${kind}\" data-props='${escapeAttr(json.replace(/'/g, '&#39;'))}'></div>`
  }
}

export default cardPlugin