# Round 8 (2026-11-06). Campaign looks are not touched.
#  both shells: thin lines between submenu items (rows keep their size); booking is a compact card with a day-and-time step
#               (calendar + request times), a live "Your appointment" summary and a short confirmation
#  promotion shell (all inner pages): testimonials are the home page's one looping row with the award cards
#  home: less space around "Where would you like to start?"; concern chips read as buttons; the menu intro on one line, soft
#        paper fades at both ends of the card row and room under the cards; the clinic slider changes on its own with a slow
#        pan and zoom, no arrows or counter; testimonials move before "Our Toronto clinics"
# Pieces next to this file (r8_*.jsx.txt). Already applied, do not run again.
import os
HERE = os.path.dirname(os.path.abspath(__file__))
def part(n): return open(os.path.join(HERE, n), encoding='utf-8').read()
SHARED_CSS = '''
  /* round 8: a thin line between submenu items; the booking summary card */
  .panel .menu-item{border-bottom:1px solid rgba(27,36,43,.08)}
  .book-sum{background:radial-gradient(90% 70% at 100% 0%,rgba(38,177,231,.32),transparent 60%),linear-gradient(160deg,#1B242B,#0B0F13)}
'''
HOME_CSS = '''
  /* round 8: concern chips look like buttons; the card row fades into the page at both ends; the clinic photos pan and zoom */
  .st-chips a{gap:8px;background:rgba(255,255,255,.22);border-color:rgba(255,255,255,.5);box-shadow:0 8px 20px -12px rgba(0,0,0,.6);cursor:pointer}
  .st-chips a svg{transition:transform .3s var(--e-out)}
  .st-chips a:hover svg{transform:translateX(3px)}
  .side-rail::before,.side-rail::after{content:"";position:absolute;top:0;bottom:0;z-index:2;width:var(--gx);pointer-events:none}
  .side-rail::before{left:0;background:linear-gradient(90deg,#FAFAF8 15%,rgba(250,250,248,0))}
  .side-rail::after{right:0;background:linear-gradient(270deg,#FAFAF8 15%,rgba(250,250,248,0))}
  .cl-slide{overflow:hidden}
  .cl-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform-origin:50% 50%}
  .cl-slide.is-on .cl-img{animation:7.2s ease-out both}
  .cl-slide.is-on .cl-kb0{animation-name:clKb0}.cl-slide.is-on .cl-kb1{animation-name:clKb1}.cl-slide.is-on .cl-kb2{animation-name:clKb2}.cl-slide.is-on .cl-kb3{animation-name:clKb3}
  @keyframes clKb0{from{transform:scale(1.16) translate3d(-2.5%,1.5%,0)}to{transform:scale(1.03) translate3d(1%,-.5%,0)}}
  @keyframes clKb1{from{transform:scale(1.03) translate3d(2%,0,0)}to{transform:scale(1.15) translate3d(-1.5%,-1%,0)}}
  @keyframes clKb2{from{transform:scale(1.14) translate3d(2%,-1.5%,0)}to{transform:scale(1.02) translate3d(-1%,1%,0)}}
  @keyframes clKb3{from{transform:scale(1.04) translate3d(-1.5%,-1%,0)}to{transform:scale(1.16) translate3d(2%,1%,0)}}
  @media (prefers-reduced-motion:reduce){.cl-slide.is-on .cl-img{animation:none}}
'''
ARROW = '<svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>'

def run(p, home):
    s = open(p, encoding='utf-8').read()
    def rep(a, b, n=1):
        nonlocal s
        assert s.count(a) == n, (p, a[:80], s.count(a)); s = s.replace(a, b)
    rep('  .marquee-mask{', SHARED_CSS + (HOME_CSS if home else '') + '  .marquee-mask{')
    i = s.index('const BOOK_INTERESTS'); j = s.index('\n}\n', s.index('function Appointment() {', i)) + 3
    s = s[:i] + part('r8_booking.jsx.txt') + s[j:]
    if home:
        i = s.index('/* ---------------------------------------------------------------- inside our clinics (website v3 clinic frame)')
        j = s.index('/* ---------------------------------------------------------------- journal', i)
        s = s[:i] + part('r8_space.jsx.txt') + s[j:]
        rep('aria-labelledby="approach" className="relative z-10 overflow-hidden bg-ndm-paper px-[var(--gx)] pt-[clamp(112px,12vw,190px)] pb-[clamp(96px,10vw,160px)]">',
            'aria-labelledby="approach" className="relative z-10 overflow-hidden bg-ndm-paper px-[var(--gx)] pt-[clamp(112px,12vw,190px)] pb-[clamp(40px,4.5vw,72px)]">')
        rep('id="start" aria-labelledby="start-title" className="relative z-10 bg-ndm-paper px-[var(--gx)] py-[clamp(80px,9vw,140px)]"',
            'id="start" aria-labelledby="start-title" className="relative z-10 bg-ndm-paper px-[var(--gx)] pt-[clamp(32px,3.5vw,56px)] pb-[clamp(24px,3vw,48px)]"')
        rep('aria-controls={c.id} aria-expanded={sheet === c.id}>{c.label}</a></li>', 'aria-controls={c.id} aria-expanded={sheet === c.id}>{c.label}' + ARROW + '</a></li>')
        rep('<section ref={ref} id="treatments" aria-labelledby="menu-title" className="relative z-10 bg-ndm-paper py-[clamp(72px,8vw,120px)]">',
            '<section ref={ref} id="treatments" aria-labelledby="menu-title" className="relative z-10 bg-ndm-paper pt-[clamp(32px,3.5vw,56px)] pb-[clamp(64px,7vw,110px)]">')
        rep('<p className="rv mt-4 max-w-[52ch] font-inter text-[15.5px] leading-[1.6] text-ndm-muted" style={{ transitionDelay: \'.1s\' }}>Every treatment shows a starting price. Pick a category to narrow the list.</p>',
            '<p className="rv mt-4 font-inter text-[15.5px] leading-[1.6] text-ndm-muted lg:whitespace-nowrap" style={{ transitionDelay: \'.1s\' }}>Every treatment shows a starting price. Pick a category to narrow the list.</p>')
        rep('className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gx)] pb-6 pt-1" style={{ scrollPaddingInline: \'var(--gx)\' }}>',
            'className="no-scrollbar -mb-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gx)] pb-14 pt-2" style={{ scrollPaddingInline: \'var(--gx)\' }}>')
        rep('        <Saying />\n', '')
        rep('        <VisitUs />\n', '        <Saying />\n        <VisitUs />\n')
    else:
        idx = open('index.html', encoding='utf-8').read()
        blk = idx[idx.index('const NDM_UP = '):idx.index('\n}\n', idx.index('function Saying() {')) + 3]
        blk = blk.replace('const AWARD_YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];\n', '').replace('function Saying() {', 'function PromoReviews() {')
        i = s.index('const NDM_UP = '); j = s.index('\n}\n', s.index('function PromoReviews() {', i)) + 3
        s = s[:i] + blk + s[j:]
        m16 = idx[idx.index('  .mark-16{'):idx.index('\n', idx.index('  .mark-16{')) + 1]
        rep('  .marquee-mask{', m16 + '  .marquee-mask{')
    open(p, 'w', encoding='utf-8').write(s); print(p, 'ok')

run('promotion.html', False)   # reads the home testimonials before the home file changes
run('index.html', True)
