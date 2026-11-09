"""Static copy of every page for search engines, AI search and link previews (site audit, 8 Nov 2026).

The pages are built in the browser (React + Babel), so each HTML file ships an empty <div id="root"></div>.
Crawlers that do not run JavaScript (ChatGPT, Claude, Perplexity and most other AI crawlers, social link previews,
and Google's first pass) saw no text and no links at all. This tool renders every page in headless Chrome, keeps
its visible content as plain semantic HTML (headings, text, lists, tables, links, images with alt text) and writes
it inside <div id="root">. React replaces it the moment the page starts, so visitors see exactly the same page as
before: the copy stays hidden while the scripts load, and only shows if they fail to load (after 8 seconds), so the
page is never blank.

usage (from the NDM folder):   python3 tools/prerender.py . [--workers 4] [page.html ...]
Run it LAST in the build, after src/patches-applied/seo_patch.py (seo_patch removes old copies, so a page rebuilt
without this step simply has none, never another page's). Needs Google Chrome; set CHROME=/path/to/chrome if it is
not in /Applications. It serves the folder itself on a free local port while it runs.
"""
import functools
import html as H
import json
import os
import re
import shutil
import socket
import subprocess
import sys
import tempfile
import threading
from concurrent.futures import ThreadPoolExecutor
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from bs4 import BeautifulSoup, Comment, NavigableString

argv = sys.argv[1:]
ROOT = Path(argv.pop(0) if argv and not argv[0].startswith('--') else '.').resolve()
WORKERS = 4
if '--workers' in argv:
    i = argv.index('--workers'); WORKERS = int(argv[i + 1]); del argv[i:i + 2]
ONLY = [a for a in argv if a.endswith('.html')]
CHROME = os.environ.get('CHROME', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
SKIP = {'index-fraunces.html'}   # obsolete test page

START, END = '<div class="ndm-pre">', '</div><!-- /ndm-pre -->'
HEAD_START, HEAD_END = '<!-- ndm-pre-head -->', '<!-- /ndm-pre-head -->'
HEAD = (HEAD_START + '\n<style>html.ndm-js .ndm-pre{display:none}.ndm-pre{max-width:880px;margin:0 auto;padding:24px 16px 64px;'
        'font:16px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#1B242B;background:#FAFAF8}'
        '.ndm-pre img{max-width:100%;height:auto}.ndm-pre a{color:#0F80C3}.ndm-pre nav ul,.ndm-pre footer ul{display:flex;flex-wrap:wrap;'
        'gap:6px 18px;padding:0;list-style:none}</style>\n<script>document.documentElement.classList.add("ndm-js");setTimeout(function(){'
        'if(document.querySelector("#root>.ndm-pre"))document.documentElement.classList.remove("ndm-js")},8000)</script>\n' + HEAD_END)

# the page loads in a 1280px frame; every element the browser does not show is marked so the copy keeps what a visitor sees
# (menus excepted: their links are the site's navigation, so they stay even while folded away)
SNAP = r'''<!doctype html><html><head><meta charset="utf-8"></head><body><script>
const name = new URLSearchParams(location.search).get('p');
const f = document.createElement('iframe'); f.style.cssText = 'width:1280px;height:900px;border:0'; document.body.appendChild(f);
f.addEventListener('load', () => setTimeout(() => {
  const w = f.contentWindow, d = w.document, root = d.getElementById('root'); let out = '';
  if (root && root.children.length) {
    /* folded content (FAQ answers, price rows) is part of the page: keep what a disclosure button controls */
    const folded = new Set([...root.querySelectorAll('[aria-expanded][aria-controls]')].map((b) => b.getAttribute('aria-controls')));
    for (const el of root.querySelectorAll('*')) {
      if (el.closest('[role="dialog"],dialog,[aria-modal="true"],#chat-panel')) { el.setAttribute('data-pre-drop', ''); continue; }
      let inFold = false;   /* a folded panel is inert while closed, but it is still the page's content */
      for (let a = el; a && a !== root; a = a.parentElement) if (a.id && folded.has(a.id)) { inFold = true; break; }
      if (inFold) continue;
      if (el.closest('[aria-hidden="true"],[inert]')) { el.setAttribute('data-pre-drop', ''); continue; }
      if (el.closest('nav')) continue;
      const cs = w.getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') el.setAttribute('data-pre-drop', '');
    }
    /* a disclosure button's words are the question or the treatment name: keep them as text */
    for (const b of root.querySelectorAll('button[aria-expanded]')) b.setAttribute('data-pre-text', '');
    out = root.innerHTML;
  }
  const t = document.createElement('textarea'); t.id = '__snap'; t.textContent = out; document.body.appendChild(t);
}, 3500));
f.src = name;
</script></body></html>'''

DROP = ['script', 'style', 'noscript', 'template', 'svg', 'canvas', 'video', 'audio', 'iframe', 'object', 'embed', 'source', 'track',
        'button', 'input', 'select', 'textarea', 'option', 'form', 'dialog', 'label', 'link', 'meta']
KEEP = {'a': {'href'}, 'img': {'src', 'alt', 'width', 'height'}, 'td': {'colspan', 'rowspan'}, 'th': {'colspan', 'rowspan', 'scope'},
        'time': {'datetime'}, 'nav': {'aria-label'}, 'ol': {'start'}}
INLINE = {'span', 'small', 'sup', 'sub', 'mark', 'font', 'u', 'abbr', 'cite', 'q', 'del', 'ins', 's'}


def clean(html, page_tabs):
    soup = BeautifulSoup('<div id="pre">' + html + '</div>', 'lxml')
    top = soup.find(id='pre')
    for t in top.select('[data-pre-drop]'):
        t.decompose()
    for t in top.select('button[data-pre-text]'):   # FAQ questions, price rows: the words stay, the button goes
        t.name = 'p' if t.find(['div', 'p', 'h2', 'h3', 'h4']) is None else 'div'
    for t in top.find_all(DROP):
        t.decompose()
    for c in top.find_all(string=lambda x: isinstance(x, Comment)):
        c.extract()
    for a in top.select('a[href="#main"]'):   # the skip link
        a.decompose()
    for img in top.find_all('img'):
        if not (img.get('alt') or '').strip():
            img.decompose()
    if page_tabs:   # the treatment page's "Everything about" card renders one tab at a time: add the others' text
        ov = top.find(id='ov-panel')
        if ov is not None:
            for tab in page_tabs[1:]:
                sec = soup.new_tag('section')
                h = soup.new_tag('h3'); h.string = tab['label']; sec.append(h)
                sec.append(BeautifulSoup(tab['html'], 'lxml').body or '')
                ov.append(sec)
    for t in top.find_all(True):
        keep = KEEP.get(t.name, set()) | {'id'}
        t.attrs = {k: v for k, v in t.attrs.items() if k in keep}
        if t.name == 'img':
            t['loading'], t['decoding'] = 'lazy', 'async'
        if t.name == 'a' and t.get('href', '').startswith('#/'):
            del t['href']
    for t in top.find_all(INLINE):   # styling spans sit side by side in grids and flex rows: keep a space between their words
        nxt = t.next_sibling
        if nxt is not None and not (isinstance(nxt, NavigableString) and nxt[:1].isspace()):
            t.insert_after(' ')
        t.unwrap()
    for t in top.find_all('body'):
        t.unwrap()
    for t in top.find_all('html'):
        t.unwrap()
    # drop empty boxes and collapse single-child wrappers, a few passes
    for _ in range(6):
        changed = False
        for t in top.find_all(True):
            if t.name in ('img', 'br', 'hr'):
                continue
            if not t.get_text(strip=True) and not t.find('img'):
                t.decompose(); changed = True
        for t in top.find_all('div'):
            kids = [k for k in t.children if not (isinstance(k, NavigableString) and not k.strip())]
            if len(kids) == 1 and not isinstance(kids[0], NavigableString) and not t.get('id'):
                t.unwrap(); changed = True
        if not changed:
            break
    # the same block twice in a row (looping rows, marquees) keeps one copy
    for parent in top.find_all(True):
        prev = None
        for k in list(parent.children):
            if isinstance(k, NavigableString):
                continue
            txt = k.get_text(' ', strip=True)
            if prev is not None and txt and txt == prev:
                k.decompose()
            else:
                prev = txt
    out = top.decode_contents()
    out = re.sub(r'[ \t\r\f\v]*\n[ \t\n\r\f\v]*', '\n', out)
    out = re.sub(r'[ \t]{2,}', ' ', out)
    return out.strip()


def page_tabs(s):
    m = re.search(r'\nconst PROC = (\{.*?\n\});\n', s, re.S)
    if not m:
        return None
    try:
        return json.loads(m.group(1)).get('tabs')
    except Exception:
        return None


def free_port():
    with socket.socket() as so:
        so.bind(('127.0.0.1', 0))
        return so.getsockname()[1]


def main():
    pages = sorted(p for p in ROOT.glob('*.html') if p.name not in SKIP and (not ONLY or p.name in ONLY))
    tmp = Path(tempfile.mkdtemp(prefix='ndm-prerender-'))
    for e in ROOT.iterdir():
        if not e.name.startswith('.'):
            (tmp / e.name).symlink_to(e)
    (tmp / '_snap.html').write_text(SNAP, encoding='utf-8')
    port = free_port()
    handler = functools.partial(type('Quiet', (SimpleHTTPRequestHandler,), {'log_message': lambda *a: None}), directory=str(tmp))
    srv = ThreadingHTTPServer(('127.0.0.1', port), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    local = threading.local(); ids = iter(range(10 ** 6))

    def snap(p):
        if not hasattr(local, 'prof'):
            local.prof = tmp / f'.chrome-{next(ids)}'
        cmd = [CHROME, '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--mute-audio',
               f'--user-data-dir={local.prof}', '--window-size=1400,1000', '--virtual-time-budget=15000', '--dump-dom',
               f'http://127.0.0.1:{port}/_snap.html?p={p.name}']
        try:
            dom = subprocess.run(cmd, capture_output=True, text=True, timeout=120).stdout
        except subprocess.TimeoutExpired:
            return p, None
        m = re.search(r'<textarea id="__snap">(.*?)</textarea>', dom, re.S)
        return p, (H.unescape(m.group(1)) if m and m.group(1).strip() else None)

    done, failed, sizes = 0, [], []
    with ThreadPoolExecutor(WORKERS) as ex:
        results = list(ex.map(snap, pages))
    results = [(p, raw) if raw else snap(p) for p, raw in results]   # a page that timed out under load gets one more try on its own
    for p, raw in results:
        if not raw:
            failed.append(p.name); continue
        s = p.read_text(encoding='utf-8')
        body = clean(raw, page_tabs(s))
        s = re.sub(r'\n?' + re.escape(HEAD_START) + r'.*?' + re.escape(HEAD_END), '', s, flags=re.S)
        s = re.sub(r'(<div id="root">)' + re.escape(START) + r'.*?' + re.escape(END) + r'(</div>)', r'\1\2', s, flags=re.S)
        s = s.replace('</head>', HEAD + '\n</head>', 1)
        assert s.count('<div id="root"></div>') == 1, p.name
        s = s.replace('<div id="root"></div>', '<div id="root">' + START + body + END + '</div>', 1)
        p.write_text(s, encoding='utf-8')
        done += 1; sizes.append(len(body.encode('utf-8')))
    srv.shutdown()
    shutil.rmtree(tmp)   # the temp folder holds symlinks: rmtree removes the links, never what they point to
    if sizes:
        sizes.sort()
        print(f'prerender: {done} pages, static copy {sizes[0] // 1024}-{sizes[-1] // 1024} KB (median {sizes[len(sizes) // 2] // 1024} KB)')
    if failed:
        print('prerender FAILED for:', ', '.join(failed))
        sys.exit(1)


if __name__ == '__main__':
    main()
