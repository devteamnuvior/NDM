"""Read a JS data literal (const X = [...]) from a .jsx file without executing it: turn it into a Python literal."""
import re, ast
def load_const(path, name):
    s = open(path, encoding='utf-8').read()
    m = re.search(r'const ' + re.escape(name) + r'\s*=\s*', s)
    i = m.end()
    # find the matching bracket of the literal
    depth = 0; j = i; instr = None
    while j < len(s):
        c = s[j]
        if instr:
            if c == '\\': j += 2; continue
            if c == instr: instr = None
        elif c in '\'"`': instr = c
        elif c in '[{(': depth += 1
        elif c in ']})':
            depth -= 1
            if depth == 0: j += 1; break
        j += 1
    lit = s[i:j]
    lit = re.sub(r'/\*.*?\*/', '', lit, flags=re.S)
    lit = re.sub(r'(?m)^\s*//.*$', '', lit)
    lit = re.sub(r'([{,]\s*)([A-Za-z_$][\w$]*)\s*:', r"\1'\2':", lit)
    lit = re.sub(r'lhrB\(([^)]*)\)', lambda m: 'lhrB([' + m.group(1) + '])', lit)
    lit = re.sub(r'\btrue\b', 'True', lit); lit = re.sub(r'\bfalse\b', 'False', lit); lit = re.sub(r'\bnull\b', 'None', lit)
    # the pricing data's one helper, laser hair removal packages, expanded in place (same rows as the team's lhrB)
    def expand(o):
        if isinstance(o, list): return [expand(x) for x in o]
        if isinstance(o, dict): return {k: expand(v) for k, v in o.items()}
        return o
    lit = re.sub(r"lhrB\(\[([^\]]*)\]\)", lambda m: _lhr(m.group(1)), lit)
    return expand(ast.literal_eval(lit))

def _lhr(args):
    a = [x.strip() for x in args.split(',')]
    rows = [['Single session', float(a[0]), 0], ['Package of 3', float(a[1]), 0, 'BUY 1 GET 1 FREE'], ['Package of 5', float(a[2]), 0, 'BUY 1 GET 1 FREE']]
    if len(a) > 3 and a[3] not in ('', '0', 'null'): rows.append(['Package of 8', float(a[3]), 0, 'BUY 1 GET 1 FREE'])
    return repr(rows)
