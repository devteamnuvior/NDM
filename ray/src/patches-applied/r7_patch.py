# Round 7 (2026-11-06):
#  home: "Inside our clinics" is a large photo slider (website v3 clinic photos) whose frame opens out to both sides on scroll;
#        before & after becomes a row of seven cases with arrows on both sides (the gallery button stays on top); testimonials run
#        in one faster looping row, the 16 years card has no stars; the treatment menu's tabs move to the right and its arrows to
#        both sides of the cards; monthly specials fade in and out of the page colour; how it works shows its steps on cards
#  both shells: the booking section is one card on a photo, the heading inside it; how it works cards
# Pieces next to this file (r7_*.jsx.txt). Already applied, do not run again.
import os
HERE = os.path.dirname(os.path.abspath(__file__))
def part(n): return open(os.path.join(HERE, n), encoding='utf-8').read()
CSS = '''
  /* round 7: shared side arrows for card rows */
  .side-arrow{position:absolute;top:42%;z-index:3;display:grid;place-items:center;width:48px;height:48px;border-radius:999px;background:#fff;color:#1B242B;box-shadow:0 14px 30px -14px rgba(27,36,43,.45),0 0 0 1px rgba(27,36,43,.08);transform:translateY(-50%);transition:background-color .25s ease,color .25s ease,opacity .25s ease}
  .side-arrow:hover{background:#0F80C3;color:#fff}
  .side-arrow:disabled{opacity:0;pointer-events:none}
  .side-arrow.is-l{left:max(8px,calc(var(--gx) - 24px))}
  .side-arrow.is-r{right:max(8px,calc(var(--gx) - 24px))}
  @media (max-width:767px){.side-arrow{display:none}}
  .ba-slide{width:min(64vw,300px)}
  @media (min-width:1024px){.ba-slide{width:calc((100vw - 2 * var(--gx) - 48px) / 4)}}
  /* inside our clinics: the frame opens to both sides as it comes into view; photos cross-fade */
  .cl-frame{--p:0;position:relative;height:min(86svh,860px);margin:0 calc((1 - var(--p)) * clamp(12px,6vw,110px));border-radius:calc(34px * (1 - var(--p)));overflow:hidden;background:#0B0F13;color:#fff;transform:translateZ(0)}
  .cl-slide{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transform:scale(calc(1.1 - .1 * var(--p)));transition:opacity 1.2s ease}
  .cl-slide.is-on{opacity:1}
  .cl-frame::after{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(180deg,rgba(11,15,19,.25),rgba(11,15,19,.05) 32%,rgba(11,15,19,.82)),linear-gradient(90deg,rgba(11,15,19,.55),rgba(11,15,19,0) 62%)}
  @media (prefers-reduced-motion:reduce){.cl-frame{--p:1!important}.cl-slide{transition:none}}
  /* monthly specials: the blue panel fades in from the page colour and back out, so no edge shows */
  .sw-panel{background:linear-gradient(180deg,#FAFAF8 0%,var(--sw-panel) 16%,var(--sw-panel) 84%,#FAFAF8 100%)}
'''
SHARED_CSS = '''
  /* booking: one card on the photo */
  .book-shell{background:rgba(250,250,248,.92);-webkit-backdrop-filter:blur(14px) saturate(130%);backdrop-filter:blur(14px) saturate(130%);box-shadow:0 40px 80px -40px rgba(11,15,19,.6)}
  /* how it works: each step on a white card */
  .proc-card{box-shadow:0 22px 44px -36px rgba(27,36,43,.45)}
'''
PROC_LI_A = '''            <li key={i} className="rv flex flex-col" style={{ transitionDelay: `${0.08 * i}s` }}>
              <div className="aspect-[4/3]"><ProcessPhoto i={i} on /></div>
              <div className="mt-5"><ProcessText i={i} on small /></div>
              <div className="mt-auto pt-5"><Btn href={PROCESS_MEDIA[i].h} v={PROCESS_MEDIA[i].v}{SM}>{PROCESS_MEDIA[i].cta}</Btn></div>'''
PROC_LI_B = '''            <li key={i} className="rv proc-card flex flex-col rounded-[22px] bg-white p-3 ring-1 ring-ndm-ink/[.06]" style={{ transitionDelay: `${0.08 * i}s` }}>
              <div className="aspect-[4/3.2]"><ProcessPhoto i={i} on /></div>
              <div className="px-2 pt-5"><ProcessText i={i} on small /></div>
              <div className="mt-auto px-2 pb-2 pt-5"><Btn href={PROCESS_MEDIA[i].h} v={PROCESS_MEDIA[i].v}>{PROCESS_MEDIA[i].cta}</Btn></div>'''

def run(p, home):
    s = open(p, encoding='utf-8').read()
    def rep(a, b, n=1):
        nonlocal s
        assert s.count(a) == n, (p, a[:80], s.count(a)); s = s.replace(a, b)
    rep('  .marquee-mask{', (CSS if home else '') + SHARED_CSS + '  .marquee-mask{')
    i = s.index('function Appointment() {'); j = s.index('\n}\n', i) + 3
    s = s[:i] + part('r7_appointment.jsx.txt') + s[j:]
    rep(PROC_LI_A.replace('{SM}', '' if home else ' sm'), PROC_LI_B)
    if home:
        # the booking section is no longer a paper band with a glow
        rep(',main>section[aria-labelledby="book"]{background-color:#FAFAF8!important;background-image:none!important;isolation:isolate}', '{background-color:#FAFAF8!important;background-image:none!important;isolation:isolate}')
        rep(',main>section[aria-labelledby="book"]::before{content:', '::before{content:')
        rep('  main>section[aria-labelledby="book"]::before{background:radial-gradient(40% 46% at 4% 40%,rgba(255,206,182,.22),transparent 70%)}\n', '')
        i = s.index('const VID = '); j = s.index('/* ---------------------------------------------------------------- journal', i)
        s = s[:i] + part('r7_space.jsx.txt') + s[j:]
        i = s.index('/* before & after (website v3 "Real results")'); j = s.index('/* ---------------------------------------------------------------- meet the team', i)
        s = s[:i] + part('r7_ba.jsx.txt') + s[j:]
        i = s.index('/* ---------------------------------------------------------------- treatments, by what they do'); j = s.index('\n}\n', s.index('function TreatMenu() {', i)) + 3
        s = s[:i] + part('r7_treatmenu.jsx.txt') + s[j:]
        rep("  const rows = [[R[0], A1, R[1], R[2], A3], [R[3], R[4], A2, R[5], R[6]]];", "  const rows = [[R[0], A1, R[1], R[2], A3, R[3], R[4], A2, R[5], R[6]]]; /* one looping row */")
        rep('dur={k ? 32 : 28}', 'dur={34}')
        rep("{ look: 'amber', k: 'Patient care', mark: true, big: '16+ years', d: 'Of dedication to patient care, innovation and consistent, high-quality treatment.', stars: true },",
            "{ look: 'amber', k: 'Patient care', mark: true, big: '16+ years', d: 'Of dedication to patient care, innovation and consistent, high-quality treatment.' },")
        rep("        {a.stars && <p className=\"mt-auto pt-6 font-inter text-[13px] text-ndm-muted\">Uptown and Downtown Toronto</p>}", "        {a.mark && <p className=\"mt-auto pt-6 font-inter text-[13px] text-ndm-muted\">Uptown and Downtown Toronto</p>}")
    open(p, 'w', encoding='utf-8').write(s); print(p, 'ok')

run('index.html', True)
run('promotion.html', False)
