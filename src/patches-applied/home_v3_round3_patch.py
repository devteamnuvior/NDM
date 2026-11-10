# Home page, round 3 (2026-11-06), on top of home_v3_round2_patch.py:
#  - 16 years mark above the "16+ years" award card; How it works buttons share one size
#  - warm peach light on the start panels and treatment menu photos; menu band back to the v3 aurora colours
#  - Aptos: one tilted card with the moving thread figure (the NAMICA badge and chips stay)
#  - About film: square edges, dark band behind it, full width and loading well before it is reached
#  - fourth team member: Heather Bouchard, NP (photo; no profile yet)
#  - header: dark over the film right from the first load; thin lines between the menu items (site-wide, both shells)
# Already applied, do not run again.
import os
HERE = os.path.dirname(os.path.abspath(__file__))
def part(n): return open(os.path.join(HERE, n), encoding='utf-8').read()

def patch(p, reps):
    s = open(p, encoding='utf-8').read()
    for a, b in reps:
        assert s.count(a) == 1, (p, a[:80], s.count(a)); s = s.replace(a, b)
    open(p, 'w', encoding='utf-8').write(s); print(p, 'ok')

APTOS_OLD_CARDS = '''          <div className="apx-card apx-back"><img src={NUV_IMG + 'marking-2.jpg'} alt="" loading="lazy" /></div>
          <div className="apx-card apx-front"><img src={NUV_IMG + 'face-glow.jpg'} alt="" loading="lazy" /></div>'''
APTOS_ONE = '''          <div className="apx-one"><AptosFigure faceOnly className="h-full w-full" /></div>'''

HOME = [
    ('  .marquee-mask{', part('home_v3_r3_css.txt') + '  .marquee-mask{'),
    # 16 years mark
    ("{ look: 'amber', k: 'Patient care', big: '16+ years',", "{ look: 'amber', k: 'Patient care', mark: true, big: '16+ years',"),
    ('''        <div className="flex items-center justify-between gap-4">
          <span className={`font-inter text-[12px] uppercase tracking-[.16em] ${dark ? 'text-white/70' : 'text-ndm-muted'}`}>{a.k}</span>''',
     '''        {a.mark && <span role="img" aria-label="NewDermaMed, 16 years" className="mark-16 mb-5 text-[#8A5A12]" />}
        <div className="flex items-center justify-between gap-4">
          <span className={`font-inter text-[12px] uppercase tracking-[.16em] ${dark ? 'text-white/70' : 'text-ndm-muted'}`}>{a.k}</span>'''),
    # How it works: one button size
    ('<div className="mt-auto pt-5"><Btn href={PROCESS_MEDIA[i].h} v={PROCESS_MEDIA[i].v} sm>{PROCESS_MEDIA[i].cta}</Btn></div>',
     '<div className="mt-auto pt-5"><Btn href={PROCESS_MEDIA[i].h} v={PROCESS_MEDIA[i].v} className="w-full max-w-[300px]">{PROCESS_MEDIA[i].cta}</Btn></div>'),
    ('              <Btn href={m.h} v={m.v}>{m.cta}</Btn>', '              <Btn href={m.h} v={m.v} className="w-[280px]">{m.cta}</Btn>'),
    # peach light on the menu card photos (start panels get it from .st-p::before)
    ('<div className="aspect-[4/3] overflow-hidden bg-ndm-mist"><img src={img}', '<div className="peach aspect-[4/3] overflow-hidden bg-ndm-mist"><img src={img}'),
    # Aptos: one tilted figure
    (APTOS_OLD_CARDS, APTOS_ONE),
    # about film: square, dark band, full width early, film loads early
    ('.cf-frame{--p:0;position:relative;height:min(88svh,880px);margin:0 calc((1 - var(--p)) * var(--gx));border-radius:calc(28px * (1 - var(--p)));',
     '.cf-frame{--p:0;position:relative;height:min(88svh,880px);margin:0 calc((1 - var(--p)) * var(--gx));border-radius:0;'),
    ('<section ref={ref} aria-labelledby="space" className="relative z-10 bg-ndm-paper pb-[clamp(40px,6vw,80px)]">',
     '<section ref={ref} aria-labelledby="space" data-nav="dark" className="relative z-10 bg-ndm-night">'),
    ("    el.style.setProperty('--p', clamp01((h - r.top) / (h * 0.85)).toFixed(3));\n  }, []);\n  return (\n    <section ref={ref} aria-labelledby=\"space\"",
     "    el.style.setProperty('--p', clamp01((h * 1.3 - r.top) / (h * 0.5)).toFixed(3));\n  }, []);\n  return (\n    <section ref={ref} aria-labelledby=\"space\""),
    ('  useFilm(vid);\n  const run = useInView(stats, { threshold: 0.4 });', '  useFilm(vid, { early: true });\n  const run = useInView(stats, { threshold: 0.4 });'),
    ('<video ref={vid} muted loop playsInline preload="none" poster={CLINIC_FILM.poster}', '<video ref={vid} muted loop playsInline preload="auto" poster={CLINIC_FILM.poster}'),
    ('    }, { threshold: 0.15 });\n    io.observe(v);', '    }, opts.early ? { rootMargin: \'100% 0px\' } : { threshold: 0.15 });\n    io.observe(v);'),
    # menu band: the v3 aurora colours
    ('''    radial-gradient(42% 52% at 18% 30%,rgba(38,177,231,.5),transparent 70%),
    radial-gradient(40% 50% at 84% 20%,rgba(15,128,195,.5),transparent 70%),
    radial-gradient(48% 56% at 62% 90%,rgba(32,158,217,.32),transparent 70%),
    radial-gradient(38% 46% at 26% 94%,rgba(250,250,248,.08),transparent 70%),#13222F;''',
     '''    radial-gradient(42% 52% at 18% 30%,rgba(41,171,226,.55),transparent 70%),
    radial-gradient(40% 50% at 82% 22%,rgba(244,214,170,.42),transparent 70%),
    radial-gradient(48% 56% at 62% 88%,rgba(92,180,170,.45),transparent 70%),
    radial-gradient(38% 46% at 30% 92%,rgba(255,166,23,.18),transparent 70%),#10263A;'''),
    ('.tm-aurora{position:relative;overflow:clip;background:#0F1A24;isolation:isolate}', '.tm-aurora{position:relative;overflow:clip;background:#0E2131;isolation:isolate}'),
    ('.tm-aurora .tm-grain{position:absolute;inset:0;z-index:-1;pointer-events:none;opacity:.3;', '.tm-aurora .tm-grain{position:absolute;inset:0;z-index:-1;pointer-events:none;opacity:.35;'),
    # header: check the tone again once the page has settled (the first check can run before the hero has its size)
    ('  useEffect(() => {\n    const on = search || drawer || cartOpen;\n    if (introDone) lockScroll(on);',
     '  useEffect(() => {\n    const probe = () => setDark([...document.querySelectorAll(\'[data-nav="dark"]\')].some((el) => { const r = el.getBoundingClientRect(); return r.top <= 70 && r.bottom >= 70; }));\n    const t = [setTimeout(probe, 50), setTimeout(probe, 500), setTimeout(probe, 1500)];\n    window.addEventListener(\'load\', probe);\n    return () => { t.forEach(clearTimeout); window.removeEventListener(\'load\', probe); };\n  }, [introDone]);\n\n  useEffect(() => {\n    const on = search || drawer || cartOpen;\n    if (introDone) lockScroll(on);'),
]
SHARED = [
    # fourth team member
    ("  /* sample until the fourth team member's photo and profile arrive */\n  { id: 'team-sample', first: 'Team member', tag: 'Photo coming soon', sample: true, name: 'Team member', role: 'Profile coming soon', img: 'assets/team/sample.svg' },",
     "  /* photo in; her profile (bio, focus, facts) is still to come, so the card has no profile dialog yet */\n  { id: 'team-heather', first: 'Heather', tag: 'Nurse Practitioner', sample: true, name: 'Heather Bouchard, NP', role: 'Nurse Practitioner', img: 'assets/team/heather.jpg' },"),
    ("const TEAM_ORDER = ['team-alin', 'team-negin', 'team-luis', 'team-sample'];", "const TEAM_ORDER = ['team-alin', 'team-negin', 'team-luis', 'team-heather'];"),
    ("aria-label={m.sample ? 'Team member, photo coming soon' : `View profile of ${m.name}, ${m.role}`}", "aria-label={m.sample ? `${m.name}, ${m.role}, profile coming soon` : `View profile of ${m.name}, ${m.role}`}"),
    # header: thin lines between the menu items
    ('''              {NAV.map((n) => (
                <li key={n.id} className="relative" onMouseEnter={() => (n.menu ? enter(n.id) : leave())}>''',
     '''              {NAV.map((n, k) => (
                <Fragment key={n.id}>
                {k > 0 && <li role="presentation" aria-hidden="true" className="mx-0.5 h-4 w-px shrink-0 bg-current opacity-[.22] 2xl:mx-1" />}
                <li className="relative" onMouseEnter={() => (n.menu ? enter(n.id) : leave())}>'''),
    ("                    </a>\n                  )}\n                </li>\n              ))}\n            </ul>",
     "                    </a>\n                  )}\n                </li>\n                </Fragment>\n              ))}\n            </ul>"),
]
patch('index.html', HOME + SHARED)
patch('promotion.html', SHARED)
