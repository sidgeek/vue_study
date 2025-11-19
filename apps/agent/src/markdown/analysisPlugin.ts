import type MarkdownIt from 'markdown-it'

function escapeAttr(s: string) {
  return s.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch] as string))
}

export function analysisPlugin(md: MarkdownIt) {
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
    const json = tokens[idx].meta?.json as string
    return `<div class=\"md-dataset-card\" data-dataset-card='${escapeAttr(json.replace(/'/g, '&#39;'))}'></div>`
  }
  md.renderer.rules['dashboard'] = (tokens, idx) => {
    const json = tokens[idx].meta?.json as string
    return `<div class=\"md-dashboard-card\" data-dashboard-card='${escapeAttr(json.replace(/'/g, '&#39;'))}'></div>`
  }
}

export default analysisPlugin