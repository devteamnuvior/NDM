"""Site audit, 8 Nov 2026: the team's review tools stay off the live site.
- The campaign look switcher (coloured dots, bottom left, every page) and the promotion page's Dark / Light test switch
  floated over the content on phones for every visitor. They now show only where the team reviews the site: on
  localhost, under /staging/, or with ?campaign=... or ?review in the address (REVIEW_TOOLS, both shells).
Idempotent."""
import sys
from pathlib import Path

root = Path(sys.argv[1] if len(sys.argv) > 1 else '.')

FLAG_OLD = 'const CAMPAIGN_LOOK = CAMPAIGN && !CAMPAIGN_SKIP.includes(HERE) ? CAMPAIGN.look : null;'
FLAG_NEW = (FLAG_OLD + '\n/* review tools (look switcher, test switches) for the team: localhost, /staging/, or ?campaign= / ?review in the address; never for visitors on the live site */\n'
            "const REVIEW_TOOLS = !/(^|\\.)newdermamedlaserclinic\\.com$/.test(location.hostname) || location.pathname.includes('/staging/') || /[?&](campaign|review)\\b/.test(location.search);")
MOUNT_OLD = "(() => { const d = document.createElement('div'); d.id = 'campaign-root';"
MOUNT_NEW = "(() => { if (!REVIEW_TOOLS) return; const d = document.createElement('div'); d.id = 'campaign-root';"
SWITCH_OLD = ('        <div className="absolute right-[var(--gx)] top-[clamp(132px,15vh,160px)] z-20 flex items-center gap-1 rounded-full p-1 font-inter text-[12.5px] sw-theme" role="group"')
SWITCH_NEW = ('        {REVIEW_TOOLS && <div className="absolute right-[var(--gx)] top-[clamp(132px,15vh,160px)] z-20 flex items-center gap-1 rounded-full p-1 font-inter text-[12.5px] sw-theme" role="group"')
SWITCH_END_OLD = ("            <button key={l} type=\"button\" onClick={() => setDark(v)} aria-pressed={dark === v} className={`h-8 rounded-full px-3.5 transition-colors ${dark === v ? 'is-on' : ''}`}>{l}</button>\n"
                  "          ))}\n        </div>\n")
SWITCH_END_NEW = ("            <button key={l} type=\"button\" onClick={() => setDark(v)} aria-pressed={dark === v} className={`h-8 rounded-full px-3.5 transition-colors ${dark === v ? 'is-on' : ''}`}>{l}</button>\n"
                  "          ))}\n        </div>}\n")

for name in ('index.html', 'promotion.html'):
    p = root / name
    s = p.read_text(encoding='utf-8')
    edits = [(FLAG_OLD, FLAG_NEW), (MOUNT_OLD, MOUNT_NEW)]
    if name == 'promotion.html':
        edits += [(SWITCH_OLD, SWITCH_NEW), (SWITCH_END_OLD, SWITCH_END_NEW)]
    n = 0
    for old, new in edits:
        if new in s:
            continue
        assert s.count(old) == 1, (name, old[:70], s.count(old))
        s = s.replace(old, new); n += 1
    p.write_text(s, encoding='utf-8')
    print(f'{name}: {n} edits')
