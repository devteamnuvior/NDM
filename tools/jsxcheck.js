// rough structural checker for JSX: strings, templates, comments, regex, brackets and tag pairing
const fs = require('fs');
let src = fs.readFileSync(process.argv[2], 'utf8');
if (process.argv[3] === '--html') {
  const a = src.indexOf('<script type="text/babel"'); const s = src.indexOf('>', a) + 1; const e = src.indexOf('</script>', s);
  src = src.slice(s, e);
}
let i = 0; const n = src.length; let tags = 0, exprs = 0;
const line = () => src.slice(0, i).split('\n').length;
function err(m) { throw new Error(m + ' at line ' + line() + ': ' + JSON.stringify(src.slice(i, i + 50))); }
const CLOSE = { ')': '(', ']': '[', '}': '{' };
const REGEX_OK = ['(', ',', '=', ':', '[', '!', '&&', '||', '??', '?', '{', '}', ';', 'return', '=>', 'start'];
const JSX_OK = ['(', ',', '=', ':', '?', '&&', '||', '??', 'return', '=>', '{', '[', '!', 'start'];
function skipString(q) { i++; while (i < n) { const c = src[i]; if (c === '\\') { i += 2; continue; } if (c === q) { i++; return; } if (c === '\n') err('newline in string'); i++; } err('unterminated string'); }
function skipTemplate() { i++; while (i < n) { const c = src[i]; if (c === '\\') { i += 2; continue; } if (c === '`') { i++; return; } if (c === '$' && src[i + 1] === '{') { i += 2; parseJS('}'); i++; continue; } i++; } err('unterminated template'); }
function skipRegex() { i++; let cls = false; while (i < n) { const c = src[i]; if (c === '\\') { i += 2; continue; } if (c === '\n') err('newline in regex'); if (cls) { if (c === ']') cls = false; } else if (c === '[') cls = true; else if (c === '/') { i++; while (/[a-z]/.test(src[i])) i++; return; } i++; } err('unterminated regex'); }
function parseJS(term) {
  const stack = []; let prev = 'start';
  while (i < n) {
    const c = src[i];
    if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
    if (c === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i + 2); if (e < 0) err('unclosed comment'); i = e + 2; continue; }
    if (c === "'" || c === '"') { skipString(c); prev = 'str'; continue; }
    if (c === '`') { skipTemplate(); prev = 'str'; continue; }
    if (/\s/.test(c)) { i++; continue; }
    if (c === '/' && REGEX_OK.includes(prev)) { skipRegex(); prev = 'regex'; continue; }
    if (c === '<' && JSX_OK.includes(prev) && /[A-Za-z>]/.test(src[i + 1])) { parseEl(); prev = 'jsx'; continue; }
    if ('([{'.includes(c)) { stack.push(c); i++; prev = c; continue; }
    if (')]}'.includes(c)) {
      if (!stack.length) { if (c === term) return; err('unexpected ' + c); }
      const o = stack.pop(); if (CLOSE[c] !== o) err('mismatch ' + o + ' closed by ' + c);
      i++; prev = c; continue;
    }
    if (/[A-Za-z_$]/.test(c)) { const s = i; while (i < n && /[\w$]/.test(src[i])) i++; prev = src.slice(s, i); continue; }
    if (/[0-9]/.test(c)) { while (i < n && /[\w.]/.test(src[i])) i++; prev = 'num'; continue; }
    const two = src.slice(i, i + 2);
    if (['=>', '&&', '||', '??'].includes(two)) { i += 2; prev = two; continue; }
    if (c === '=' && src[i + 1] === '=') { while (src[i] === '=') i++; prev = '=='; continue; }
    if (c === ';') { i++; prev = ';'; continue; }
    i++; prev = c;
  }
  if (term) err('unterminated expression (expected ' + term + ')');
  if (stack.length) err('unclosed ' + stack.join(''));
}
function readName() { const s = i; while (i < n && /[\w$.\-:]/.test(src[i])) i++; return src.slice(s, i); }
function parseEl() {
  i++; tags++;
  if (src[i] === '>') { i++; kids(''); return; }
  const name = readName(); if (!name) err('missing tag name');
  for (;;) {
    while (/\s/.test(src[i])) i++;
    if (src[i] === '/' && src[i + 1] === '>') { i += 2; return; }
    if (src[i] === '>') { i++; kids(name); return; }
    if (src[i] === '{') { i++; parseJS('}'); i++; exprs++; continue; }
    const an = readName(); if (!an) err('bad attribute in <' + name + '>');
    while (/\s/.test(src[i])) i++;
    if (src[i] === '=') {
      i++; while (/\s/.test(src[i])) i++;
      if (src[i] === '"' || src[i] === "'") { const q = src[i]; const e = src.indexOf(q, i + 1); if (e < 0) err('unterminated attr'); i = e + 1; }
      else if (src[i] === '{') { i++; parseJS('}'); i++; exprs++; }
      else err('bad value for ' + an);
    }
  }
}
function kids(name) {
  while (i < n) {
    const c = src[i];
    if (c === '{') { i++; parseJS('}'); i++; exprs++; continue; }
    if (c === '}' || c === '>') err('raw ' + c + ' in JSX text of <' + name + '>');
    if (c === '<') {
      if (src[i + 1] === '/') { i += 2; while (/\s/.test(src[i])) i++; const cn = readName(); while (/\s/.test(src[i])) i++; if (src[i] !== '>') err('bad closing tag'); i++; if (cn !== name) err('expected </' + name + '> but found </' + cn + '>'); return; }
      parseEl(); continue;
    }
    i++;
  }
  err('unclosed <' + name + '>');
}
parseJS(null);
const decl = [...src.matchAll(/^(?:const|function|let) ([A-Za-z_$][\w$]*)/gm)].map((m) => m[1]);
console.log('OK', process.argv[2].split('/').pop(), '| jsx elements:', tags, '| expressions:', exprs, '| top-level:', decl.join(', '));
