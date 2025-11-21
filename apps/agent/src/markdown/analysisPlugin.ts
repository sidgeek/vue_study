import type MarkdownIt from 'markdown-it'

function esc(s: string) { return s.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch] as string)) }

export function analysisPlugin(md: MarkdownIt) {
  const ruler = md.block.ruler
  const parseBlock = (state: any, startLine: number, endLine: number, silent: boolean) => {
    const s0 = state.bMarks[startLine] + state.tShift[startLine]
    const e0 = state.eMarks[startLine]
    const first = state.src.slice(s0, e0)
    const m = first.match(/^@([a-z][a-z0-9-]*)\b/)
    if (!m) return false
    const tag = m[1]
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
    const token = state.push('md-component', 'div', 0)
    token.meta = { json: acc, tag }
    state.line = line
    return true
  }
  ruler.before('paragraph', 'md-component', (state, startLine, endLine, silent) => parseBlock(state, startLine, endLine, silent))

  md.renderer.rules['md-component'] = (tokens, idx) => {
    const raw = tokens[idx].meta?.json as string
    const tag = tokens[idx].meta?.tag as string
    const safeJson = esc(raw.replace(/'/g, '&#39;'))
    return `<md-component name="${tag}" props='${safeJson}'></md-component>`
  }
}

export default analysisPlugin