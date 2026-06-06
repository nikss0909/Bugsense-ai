const keywordGroups = {
  default: [
    'async',
    'await',
    'break',
    'case',
    'catch',
    'class',
    'const',
    'continue',
    'default',
    'else',
    'extends',
    'false',
    'finally',
    'for',
    'from',
    'function',
    'if',
    'import',
    'let',
    'new',
    'null',
    'return',
    'static',
    'switch',
    'this',
    'throw',
    'true',
    'try',
    'undefined',
    'var',
    'while',
  ],
  java: [
    'abstract',
    'boolean',
    'catch',
    'class',
    'extends',
    'final',
    'finally',
    'for',
    'if',
    'implements',
    'import',
    'int',
    'interface',
    'new',
    'null',
    'package',
    'private',
    'protected',
    'public',
    'return',
    'static',
    'String',
    'throw',
    'throws',
    'try',
    'void',
  ],
  python: [
    'and',
    'as',
    'class',
    'def',
    'elif',
    'else',
    'except',
    'False',
    'finally',
    'for',
    'from',
    'if',
    'import',
    'in',
    'is',
    'lambda',
    'None',
    'not',
    'or',
    'pass',
    'raise',
    'return',
    'self',
    'True',
    'try',
    'while',
    'with',
  ],
  sql: [
    'ALTER',
    'AND',
    'BY',
    'CREATE',
    'DELETE',
    'FROM',
    'GROUP',
    'INSERT',
    'JOIN',
    'LIMIT',
    'NOT',
    'NULL',
    'OR',
    'ORDER',
    'SELECT',
    'TABLE',
    'UPDATE',
    'VALUES',
    'WHERE',
  ],
}

function languageKey(language = '') {
  const value = language.toLowerCase()
  if (value.includes('java')) return 'java'
  if (value.includes('python')) return 'python'
  if (value.includes('sql')) return 'sql'
  return 'default'
}

function tokenRegex(language) {
  const keywords = [...new Set([...keywordGroups.default, ...(keywordGroups[languageKey(language)] || [])])]
  return new RegExp(
    `("(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|\`(?:\\\\.|[^\`\\\\])*\`|//.*|#.*|/\\*.*?\\*/|\\b(?:${keywords.join(
      '|',
    )})\\b|\\b\\d+(?:\\.\\d+)?\\b)`,
    'g',
  )
}

function tokenClass(token, language) {
  if (token.startsWith('//') || token.startsWith('/*') || token.startsWith('#')) {
    return 'token-comment'
  }
  if (token.startsWith('"') || token.startsWith("'") || token.startsWith('`')) {
    return 'token-string'
  }
  if (/^\d/.test(token)) {
    return 'token-number'
  }
  const keywords = new Set([...keywordGroups.default, ...(keywordGroups[languageKey(language)] || [])])
  if (keywords.has(token)) {
    return 'token-keyword'
  }
  return 'token-plain'
}

function tokenize(line, language) {
  const regex = tokenRegex(language)
  const parts = []
  let lastIndex = 0
  for (const match of line.matchAll(regex)) {
    if (match.index > lastIndex) {
      parts.push({ text: line.slice(lastIndex, match.index), type: 'token-plain' })
    }
    parts.push({ text: match[0], type: tokenClass(match[0], language) })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < line.length) {
    parts.push({ text: line.slice(lastIndex), type: 'token-plain' })
  }
  return parts.length ? parts : [{ text: ' ', type: 'token-plain' }]
}

function CodeBlock({ code = '', language = '', maxHeight = '28rem' }) {
  const lines = String(code || '').split('\n')

  return (
    <div className="code-viewer rounded-lg border border-slate-200 bg-slate-950 shadow-sm">
      {language ? (
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
          <span className="text-xs font-semibold uppercase text-slate-300">{language}</span>
        </div>
      ) : null}
      <pre className="overflow-auto p-0 text-sm leading-6" style={{ maxHeight }}>
        <code>
          {lines.map((line, lineIndex) => (
            <span className="code-line" key={`${lineIndex}-${line}`}>
              <span className="code-line-number">{lineIndex + 1}</span>
              <span className="code-line-content">
                {tokenize(line, language).map((token, tokenIndex) => (
                  <span className={token.type} key={`${lineIndex}-${tokenIndex}`}>
                    {token.text}
                  </span>
                ))}
              </span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  )
}

export default CodeBlock
