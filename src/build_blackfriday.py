"""black-friday.html: a stand-alone Black Friday preview of the home page (designer's mood preview, not the dashboard build).
Built from index.html. The page stays light; the event shows through the details, not a headline:
  - one palette: every brand blue (and the amber) becomes signal red, the blue-black ink becomes true black. No yellow.
  - black event bands with a slowly moving red tape between sections
  - the monthly specials become tickets (notches + a dashed tear line)
  - the hero keeps its normal film and words (no Black Friday headline)
index.html and every other page stay untouched.
Run from ndm-homepage:  python3 src/build_blackfriday.py . src"""
import re, sys
root = sys.argv[1] if len(sys.argv) > 1 else '.'
s = open(f'{root}/index.html').read()
def rep(a, b, n=1):
    global s
    c = s.count(a); assert c == n, (a[:90], c); s = s.replace(a, b)

rep('<title>NewDermaMed, Cosmetic &amp; Laser Clinic, Toronto</title>', '<title>Black Friday preview, NewDermaMed</title>\n<meta name="robots" content="noindex, nofollow">')

# always the Black Friday campaign on this page (promo bar, card badges, countdown)
a = s.index('const CAMPAIGN = (() => {'); b = s.index('})();\n', a) + len('})();\n')
s = s[:a] + "const CAMPAIGN = CAMPAIGNS.find((c) => c.id === 'black-friday');\ndocument.documentElement.classList.add('bf');\n" + s[b:]

# ---- one palette: blue (and amber) -> red, blue-black ink -> black. Purple (Aptos) and social-brand colours are left alone.
PALETTE = [
    (r'#0F80C3', '#C8101D'), (r'#209ED9', '#DC1A27'), (r'#26B1E7', '#EE3A45'),
    (r'15,\s*128,\s*195', '200,16,29'), (r'32,\s*158,\s*217', '220,26,39'), (r'38,\s*177,\s*231', '238,58,69'),
    (r'#7FD3F5', '#FF9298'), (r'#8FD6F5', '#FF9AA0'), (r'15,\s*60,\s*95', '60,10,14'),
    (r'#DDF1FB', '#F3F1EF'), (r'#F3F9FD', '#FAF8F7'), (r'#F4F9FD', '#FBF8F7'), (r'#E6F3FB', '#FBECEC'), (r'#EEF4F8', '#F5F3F1'), (r'#E3E9EF', '#E8E5E2'),
    (r'#FFA617', '#DC1A27'), (r'255,\s*166,\s*23', '220,26,39'), (r'#E8930D', '#A50E18'), (r'#9A5F00', '#A50E18'), (r'#F2B01E', '#D3121F'),
    (r'#1B242B', '#141414'), (r'27,\s*36,\s*43', '20,20,20'), (r'#0B0F13', '#0B0B0C'), (r'11,\s*15,\s*19', '11,11,12'),
    (r'#24303A', '#1E1E1E'), (r'#22303A', '#161616'), (r'#18222A', '#0B0B0C'), (r'#1A2128', '#151515'), (r'#0F151A', '#0E0E0E'),
]
for a_, b_ in PALETTE:
    s, n = re.subn(a_, b_, s, flags=re.I)
    assert n, a_

CSS = r'''
  /* =============== BLACK FRIDAY PREVIEW (html.bf) ===============
     light page, true black + signal red only (the blues were remapped to red above). The event shows in the details:
     red/black bar, black bands with a moving red tape, ticket cards, red accents. */
  html.bf{--bf-black:#0B0B0C;--bf-red:#D3121F;--bf-red-d:#A50E18;--bf-red-l:#EE3A45;
    --cmp-bar:#0B0B0C;--cmp-bar-fg:#fff;--cmp-gold:#EE3A45;--cmp-acc:#C8101D;--cmp-acc-dk:#EE3A45;--cmp-badge-bg:#D3121F;--cmp-badge-fg:#fff;--cmp-badge-line:#D3121F;
    --cmp-edge:linear-gradient(115deg,rgba(211,18,31,.75),rgba(20,20,20,.10) 42%,rgba(20,20,20,.10) 62%,rgba(11,11,12,.6))}
  html.bf ::selection{background:var(--bf-red);color:#fff}
  html.bf .cmp-badge::before{background:#fff}
  html.bf .promo-attn{box-shadow:inset 0 -2px 0 var(--bf-red)}
  html.bf .promo-attn .cmp-badge{background:var(--bf-red);border-color:var(--bf-red);color:#fff}
  /* the "View cart" button turns red */
  html.bf .cart-pill > span:last-child{background:var(--bf-red);color:#fff}
  /* how it works: three equal buttons */
  html.bf section[aria-labelledby="process"] ol .btn{width:100%;max-width:300px}

  /* event tape: the red tape alone crosses the page at a slight angle, over the page's own light background */
  .bf-band{position:relative;z-index:12;overflow:hidden;background:transparent;padding:clamp(12px,2vw,28px) 0}
  .bf-tape{background:var(--bf-red);color:#fff;transform:rotate(-1.4deg);margin:0 -3vw;box-shadow:0 0 0 1px rgba(255,255,255,.06),0 18px 40px -20px rgba(0,0,0,.9)}
  .bf-band.is-flip .bf-tape{transform:rotate(1.2deg)}
  .bf-tape-track{display:flex;width:max-content;animation:bfTape 46s linear infinite}
  .bf-band.is-flip .bf-tape-track{animation-direction:reverse}
  .bf-tape ul{display:flex;flex-shrink:0;align-items:center}
  .bf-tape li{display:flex;align-items:center;gap:22px;padding:13px 0 13px 22px;font:800 clamp(13px,1.25vw,17px)/1 "Helvetica Neue",Inter,Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;white-space:nowrap}
  .bf-tape li::after{content:'';width:8px;height:8px;transform:rotate(45deg);background:currentColor;opacity:.9}
  @keyframes bfTape{to{transform:translateX(-50%)}}

  /* ticket card, shared shape: two side notches at the tear line, a dashed perforation between them */
  .bf-ticket{position:relative;display:flex;flex-direction:column;border-radius:18px;padding:14px 14px 0;
    -webkit-mask:radial-gradient(circle 13px at 0 calc(100% - 66px),#0000 97%,#000) left/51% 100% no-repeat,radial-gradient(circle 13px at 100% calc(100% - 66px),#0000 97%,#000) right/51% 100% no-repeat;
            mask:radial-gradient(circle 13px at 0 calc(100% - 66px),#0000 97%,#000) left/51% 100% no-repeat,radial-gradient(circle 13px at 100% calc(100% - 66px),#0000 97%,#000) right/51% 100% no-repeat}
  .bf-tix-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:2px 4px 12px;font:700 10px/1 "Helvetica Neue",Inter,Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;white-space:nowrap}
  .bf-tix-head b{color:var(--bf-red-l)}
  .bf-stub{display:flex;align-items:center;justify-content:space-between;gap:12px;height:66px;margin:18px -14px 0;padding:0 16px;border-top:2px dashed rgba(255,255,255,.26)}
  .bf-stub .bf-price{font:500 19px/1 "Fraunces",Georgia,serif;letter-spacing:-.01em}
  /* treatment tickets: black on the light page */
  html.bf .bf-ticket{background:var(--bf-black);color:#fff;box-shadow:0 26px 44px -30px rgba(0,0,0,.55)}
  html.bf .bf-ticket :is(.text-ndm-ink,h3,p,span){color:#fff}
  html.bf .bf-ticket .text-ndm-muted{color:rgba(255,255,255,.66)}
  html.bf .bf-ticket .bf-tix-head{color:rgba(255,255,255,.78)}
  html.bf .bf-ticket .bf-tix-head b{color:var(--bf-red-l)}
  html.bf .bf-ticket figure{border-radius:12px}
  html.bf .bf-ticket figure .bg-white\/85 span,html.bf .bf-ticket figure .bg-white\/85{color:#141414}
  html.bf .bf-ticket figure .cmp-badge{top:auto;bottom:12px;right:12px;color:#fff}
  html.bf .bf-ticket .btn > span{color:inherit}
  html.bf .bf-ticket .btn-ink{background:var(--bf-red);color:#fff}
  html.bf .bf-ticket .btn-ink:hover,html.bf .bf-ticket .btn-ink:focus-visible,html.bf .bf-ticket.group:hover .btn-g.btn-ink{background:#fff;color:#0B0B0C}

  /* monthly specials: black panel with a red glow, gold tickets */
  html.bf .sw-panel{background:radial-gradient(60% 50% at 50% 30%,rgba(211,18,31,.28),transparent 70%),var(--bf-black)!important;--sw-ink:#fff;--sw-muted:rgba(255,255,255,.66);--sw-ctrl:rgba(255,255,255,.3)}
  html.bf .specials-wheel .sw-panel :is(.sw-title,h2,h2 span:not(.text-ndm-deep):not(.text-ndm-sky)){color:#fff}
  html.bf .sw-ctrl{color:#fff}
  html.bf .sw-ctrl:hover{background:#fff;color:#0B0B0C}
  html.bf .sw-dot.is-on{background:var(--bf-red-l)}
  /* offer cards: gold tickets (gold from the live site's promotion cards: #B4915F, #C2A473, #FAE1A0), an inner stroke that bends
     around the ticket notches, a dashed tear line, and a slow light sweep across the metal */
  html.bf .sw-card{--sw-tear:calc(47px + clamp(14px,1.6vw,22px));--g-ink:#22180A;--g-line:rgba(74,52,18,.5);
    background:radial-gradient(120% 70% at 18% 0%,rgba(255,244,214,.75),transparent 55%),linear-gradient(140deg,#9C7A45 0%,#C2A473 20%,#F1DBA4 42%,#B4915F 62%,#E6CB8D 82%,#9A7742 100%)!important;
    border:0!important;box-shadow:0 30px 60px -30px rgba(0,0,0,.8)!important;
    -webkit-mask:radial-gradient(circle 12px at 0 calc(100% - var(--sw-tear)),#0000 97%,#000) left/51% 100% no-repeat,radial-gradient(circle 12px at 100% calc(100% - var(--sw-tear)),#0000 97%,#000) right/51% 100% no-repeat;
            mask:radial-gradient(circle 12px at 0 calc(100% - var(--sw-tear)),#0000 97%,#000) left/51% 100% no-repeat,radial-gradient(circle 12px at 100% calc(100% - var(--sw-tear)),#0000 97%,#000) right/51% 100% no-repeat}
  html.bf .sw-card::before{display:none}
  html.bf .sw-card::after{content:'';position:absolute;left:26px;right:26px;bottom:var(--sw-tear);border-top:1.5px dashed var(--g-line);pointer-events:none}
  .bf-gframe{position:absolute;inset:7px;z-index:0;border:1px solid var(--g-line);border-radius:16px;pointer-events:none;
    -webkit-mask:radial-gradient(circle 19px at -7px calc(100% + 7px - var(--sw-tear)),#0000 97%,#000) left/51% 100% no-repeat,radial-gradient(circle 19px at calc(100% + 7px) calc(100% + 7px - var(--sw-tear)),#0000 97%,#000) right/51% 100% no-repeat;
            mask:radial-gradient(circle 19px at -7px calc(100% + 7px - var(--sw-tear)),#0000 97%,#000) left/51% 100% no-repeat,radial-gradient(circle 19px at calc(100% + 7px) calc(100% + 7px - var(--sw-tear)),#0000 97%,#000) right/51% 100% no-repeat}
  .bf-gring{position:absolute;z-index:0;top:calc(100% - var(--sw-tear) - 20px);width:40px;height:40px;border:1px solid var(--g-line);border-radius:50%;pointer-events:none}
  .bf-gring.is-l{left:-20px;-webkit-mask:linear-gradient(90deg,#0000 26.5px,#000 26.5px);mask:linear-gradient(90deg,#0000 26.5px,#000 26.5px)}
  .bf-gring.is-r{right:-20px;-webkit-mask:linear-gradient(270deg,#0000 26.5px,#000 26.5px);mask:linear-gradient(270deg,#0000 26.5px,#000 26.5px)}
  .bf-gshine{position:absolute;inset:0;z-index:2;pointer-events:none;background:linear-gradient(105deg,transparent 36%,rgba(255,255,255,.08) 43%,rgba(255,252,236,.62) 49%,rgba(255,255,255,.08) 55%,transparent 62%) no-repeat;background-size:260% 100%;background-position:150% 0;mix-blend-mode:soft-light;animation:bfShine 5.5s cubic-bezier(.45,0,.25,1) infinite}
  .sw-card:not(.is-on) .bf-gshine{animation-delay:1.8s}
  @keyframes bfShine{0%,30%{background-position:150% 0}75%,100%{background-position:-50% 0}}
  html.bf .specials-wheel .sw-panel .sw-card :is(.sw-title,h3){color:var(--g-ink)!important}
  html.bf .specials-wheel .sw-panel .sw-card .sw-muted{color:rgba(34,24,10,.74)!important}
  html.bf .specials-wheel .sw-panel .sw-card :is(.sw-price,.sw-cur){color:#1A1207!important}
  html.bf .sw-card .sw-tag{background:rgba(26,18,7,.9)!important;border-color:transparent!important;color:#F1DBA4!important}
  html.bf .sw-card .sw-tag.is-feature{background:var(--bf-red)!important;color:#fff!important}
  html.bf .sw-card .sw-photo,html.bf .sw-card.is-on .sw-photo{box-shadow:0 0 0 3px #F1DBA4,0 0 0 4px var(--g-line),0 10px 22px -12px rgba(40,26,6,.6)}
  html.bf .sw-card .btn{background:#17110A!important;border-color:#17110A!important;color:#F1DBA4!important}
  html.bf .sw-card .btn:hover,html.bf .sw-card .btn:focus-visible{background:var(--bf-red)!important;border-color:var(--bf-red)!important;color:#fff!important}
  @media (prefers-reduced-motion:reduce){.bf-gshine{animation:none}}
  html.bf .sw-panel .tt-strong,html.bf .sw-panel a.text-ndm-deep{color:#FF5A63}
  /* black panel extras: film grain, and a red glow that follows the pointer */
  html.bf .sw-panel::before{content:'';position:absolute;inset:0;z-index:0;pointer-events:none;background:radial-gradient(460px circle at var(--mx,50%) var(--my,35%),rgba(211,18,31,.34),transparent 70%)}
  html.bf .sw-panel::after,.bf-grain::after{content:'';position:absolute;inset:0;z-index:0;pointer-events:none;border-radius:inherit;opacity:.14;mix-blend-mode:overlay;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")}
  html.bf .sw-panel>div{position:relative;z-index:1}

  /* countdown: flip-clock tiles */
  .bf-count-label{font:700 11px/1 "Helvetica Neue",Inter,Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#FF5A63}
  .bf-count{display:flex;justify-content:center;gap:8px;perspective:400px}
  .bf-count-cell{display:flex;flex-direction:column;align-items:center;gap:7px}
  .bf-count-cell b{position:relative;display:grid;place-items:center;min-width:64px;height:68px;padding:0 8px;border-radius:12px;background:linear-gradient(180deg,#202020 50%,#161616 50%);color:#fff;font:500 36px/1 "Fraunces",Georgia,serif;font-variant-numeric:tabular-nums;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08),0 14px 26px -16px rgba(0,0,0,.9)}
  .bf-count-cell b::after{content:'';position:absolute;left:0;right:0;top:50%;height:1px;background:rgba(0,0,0,.7)}
  .bf-count-cell small{font:600 10px/1 "Helvetica Neue",Inter,Arial,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.62)}
  .bf-flip{animation:bfFlip .55s var(--e-out) both;transform-origin:50% 50%}
  @keyframes bfFlip{from{transform:rotateX(-80deg);opacity:.2}to{transform:none;opacity:1}}
  .bf-count.is-sm{justify-content:flex-start;gap:6px}
  .bf-count.is-sm .bf-count-cell b{min-width:46px;height:44px;font-size:22px;border-radius:9px}
  .bf-count.is-sm .bf-count-cell small{font-size:9px}
  @media (max-width:639px){.bf-count-cell b{min-width:56px;height:58px;font-size:29px}}

  /* rotating stamp on the offers panel */
  .bf-stamp{position:absolute;z-index:2;top:clamp(84px,11vh,124px);right:var(--gx);width:clamp(70px,9vw,134px);aspect-ratio:1;pointer-events:none}
  .bf-stamp svg{display:block;width:100%;height:100%;animation:bfSpin 20s linear infinite}
  .bf-stamp text{font:700 9.6px "Helvetica Neue",Inter,Arial,sans-serif;letter-spacing:.18em;fill:#fff}
  .bf-stamp i{position:absolute;inset:27%;display:grid;place-items:center;border-radius:50%;background:var(--bf-red);color:#fff;font:700 clamp(8px,.85vw,12px)/1.15 "Helvetica Neue",Inter,Arial,sans-serif;font-style:normal;letter-spacing:.1em;text-align:center;text-transform:uppercase;box-shadow:0 0 0 5px rgba(211,18,31,.2)}
  @keyframes bfSpin{to{transform:rotate(360deg)}}
  @media (max-width:767px){.bf-stamp{top:74px;right:12px}}

  /* header: a quiet live dot beside Promotion */
  .bf-nav-dot{width:7px;height:7px;border-radius:50%;background:var(--bf-red);animation:bfPing 2.2s ease-out infinite}
  @keyframes bfPing{0%{box-shadow:0 0 0 0 rgba(211,18,31,.55)}75%,100%{box-shadow:0 0 0 7px rgba(211,18,31,0)}}

  /* mega menu: black event strip on top, black category rail with a red active item, the consultation card as a ticket */
  .bf-mm-strip{position:relative;display:flex;align-items:center;gap:14px;margin:16px 16px 0;padding:7px 7px 7px 10px;border-radius:16px;background:#0B0B0C;color:#fff;font:500 13.5px/1.2 Inter,system-ui,sans-serif;overflow:hidden}
  .bf-mm-strip>*{position:relative;z-index:1}
  .bf-mm-strip-c{color:rgba(255,255,255,.66);white-space:nowrap}
  .bf-mm-strip-c b{color:#fff;font-weight:600;font-variant-numeric:tabular-nums}
  .bf-mm-strip-a{display:inline-flex;align-items:center;gap:7px;height:34px;padding:0 15px;border-radius:999px;background:var(--bf-red);color:#fff;font-weight:600;white-space:nowrap;transition:background-color .3s ease,color .3s ease}
  .bf-mm-strip-a:hover,.bf-mm-strip-a:focus-visible{background:#fff;color:var(--bf-red)}
  @media (min-width:1536px){.bf-mm-strip{margin:20px 20px 0}}
  html.bf .bf-mm-rail{background:#0B0B0C}
  html.bf .bf-mm-rail button{color:rgba(255,255,255,.82)}
  html.bf .bf-mm-rail button:hover{background:rgba(255,255,255,.08);color:#fff}
  html.bf .bf-mm-rail button[aria-pressed="true"]{background:var(--bf-red);color:#fff;box-shadow:0 10px 22px -12px rgba(211,18,31,.9)}
  html.bf .bf-mm-ticket{min-height:380px;color:#fff}
  html.bf .bf-mm-ticket .btn-book{width:100%;background:var(--bf-red);border-color:var(--bf-red);color:#fff}
  html.bf .bf-mm-ticket .btn-book::before{background:#fff}
  html.bf .bf-mm-ticket .btn-book .btn-dot{background:#fff;color:var(--bf-red)!important}
  html.bf .bf-mm-ticket.group:hover .btn-book>span:first-child{color:var(--bf-red)}
  html.bf .bf-mm-ticket.group:hover .btn-book .btn-dot{background:var(--bf-red);color:#fff!important}
  @media (prefers-reduced-motion:reduce){.bf-stamp svg,.bf-flip,.bf-nav-dot{animation:none}}
  html.bf .sw-ring{display:none}
  html.bf .sw-theme{display:none}

  /* back to the normal site */
  .bf-exit{position:fixed;left:12px;bottom:calc(84px + env(safe-area-inset-bottom));z-index:63;display:flex;align-items:center;gap:8px;height:44px;padding:0 16px 0 8px;border-radius:999px;background:var(--bf-black);color:#fff;font:500 13px/1 Inter,system-ui,sans-serif;box-shadow:0 0 0 1px rgba(255,255,255,.12),0 14px 34px -14px rgba(0,0,0,.7)}
  .bf-exit i{display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:var(--bf-red);color:#fff;font-style:normal;font-size:14px}
  .bf-exit:hover i{background:#fff;color:var(--bf-red)}
  @media (min-width:768px){.bf-exit{left:20px;bottom:20px}}
  @media (prefers-reduced-motion:reduce){.bf-tape-track{animation:none}}
'''
# after every other rule (incl. the campaign tokens), so the Black Friday preview always wins
_i = s.index('</style>', s.index('campaign looks: tokens'))
s = s[:_i] + CSS + s[_i:]

# hero: the normal film and words (no Black Friday headline); the event reads from the bar, bands and cards
rep('const HERO_CMP = CAMPAIGN_LOOK ? CAMPAIGN : null;', 'const HERO_CMP = null;')

# how it works: the three step buttons share one look and size
rep("h: '#treatments', cta: 'Explore treatments', v: 'ink' }", "h: '#treatments', cta: 'Explore treatments', v: 'book' }")
rep("h: '#visit', cta: 'Find a clinic', v: 'ink' }", "h: '#visit', cta: 'Find a clinic', v: 'book' }")

# monthly specials become the Black Friday offers: new heading, a flip countdown, a rotating stamp, readable white tickets
rep('<div className="rv mb-4 text-center"><Eyebrow>Monthly specials</Eyebrow></div>', '<div className="rv mb-4 text-center"><Eyebrow>{CAMPAIGN.when}</Eyebrow></div>')
rep('<span className="text-ndm-ink">Exclusive monthly</span> <span className="tt-strong text-ndm-deep">specials</span>', '<span className="text-ndm-ink">Black Friday</span> <span className="tt-strong text-ndm-deep">offers</span>')
rep("""        </h2>

        <div ref={stage}""", """        </h2>
        <div className="rv mt-5 flex flex-col items-center gap-3 md:mt-6"><p className="bf-count-label">{CAMPAIGN.untilLabel}</p><BfCount /></div>

        <div ref={stage}""")
rep('<div className="sw-panel relative overflow-hidden pb-[clamp(56px,6vw,104px)]">', '<div className="sw-panel relative overflow-hidden pb-[clamp(56px,6vw,104px)]">\n        <BfStamp />')
rep('v="ink">View all offers</Btn>', 'v="light">View all offers</Btn>')

# header: a live dot beside Promotion
rep('{n.label}{n.ext && <IconExternal className="opacity-60" />}', "{n.label}{n.ext && <IconExternal className=\"opacity-60\" />}{n.id === 'promotion' && <i aria-hidden=\"true\" className=\"bf-nav-dot\" />}")

# mega menu: event strip, black rail, ticket card
rep("<div className={`grid gap-4 p-4 2xl:p-5 ${act === 'aptos' ? 'grid-cols-[210px_minmax(0,1.7fr)_minmax(0,1fr)_minmax(0,1fr)] 2xl:grid-cols-[260px_minmax(0,1.7fr)_minmax(0,1fr)_minmax(0,1fr)]' : 'grid-cols-[210px_1fr_340px] 2xl:grid-cols-[260px_1fr_340px]'}`}>", """<div className="bf-mm-strip bf-grain">
        <span className="cmp-badge">{CAMPAIGN.badge}</span>
        <span className="truncate">Treatment offers Friday to Monday, {CAMPAIGN.when}</span>
        <span className="ml-auto flex items-center gap-4">
          <BfClockText />
          <a href="#specials" onClick={onLink} className="bf-mm-strip-a">See the offers <IconArrow size={12} /></a>
        </span>
      </div>
      <div className={`grid gap-4 p-4 2xl:p-5 ${act === 'aptos' ? 'grid-cols-[210px_minmax(0,1.7fr)_minmax(0,1fr)_minmax(0,1fr)] 2xl:grid-cols-[260px_minmax(0,1.7fr)_minmax(0,1fr)_minmax(0,1fr)]' : 'grid-cols-[210px_1fr_340px] 2xl:grid-cols-[260px_1fr_340px]'}`}>""")
rep('<ul className="rounded-[16px] bg-ndm-mist/70 p-2" role="list">', '<ul className="bf-mm-rail rounded-[16px] bg-ndm-mist/70 p-2" role="list">')
_a = s.index('<a href="#/book" onClick={onLink} className="group relative overflow-hidden rounded-[16px] min-h-[380px] text-white">')
_b = s.index('</a>', _a) + len('</a>')
s = s[:_a] + """<a href="#/book" onClick={onLink} className="bf-ticket bf-mm-ticket group">
        <p className="bf-tix-head"><span>Black Friday <b>·</b> Admit one</span><span>{CAMPAIGN.when}</span></p>
        <span className="relative block min-h-0 flex-1 overflow-hidden rounded-[12px]"><img src="assets/clinic/clinic-2.jpg" alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /></span>
        <span className="block px-1 pt-4">
          <span className="block font-mont text-[11px] uppercase tracking-[.14em] opacity-70">Not sure where to start?</span>
          <span className="mt-1.5 block font-aeonik text-[20px] leading-[1.2]">Free consultation &amp; VISIA® skin analysis</span>
        </span>
        <span className="mt-3 block px-1"><BfCount sm /></span>
        <span className="bf-stub"><Btn as="span" v="book" className="btn-g">Book Free Consultation</Btn></span>
      </a>""" + s[_b:]

# gold ticket details inside each offer card: inner stroke, notch rings, light sweep
rep('<span aria-hidden="true" className="sw-ring pointer-events-none absolute -bottom-20 -right-20 size-48 rounded-full" />', '<span aria-hidden="true" className="bf-gframe" /><span aria-hidden="true" className="bf-gring is-l" /><span aria-hidden="true" className="bf-gring is-r" /><span aria-hidden="true" className="bf-gshine" />\n                <span aria-hidden="true" className="sw-ring pointer-events-none absolute -bottom-20 -right-20 size-48 rounded-full" />')

# moving tape bands
TAPE = '''
/* Black Friday preview: a slowly moving red tape across the page, between sections */
const BF_TAPE = ['Black Friday at NewDermaMed', 'Nov 27 to 30', 'Uptown and Downtown Toronto', 'Treatment offers Friday to Monday', 'Online finale Monday: skincare and gift cards'];
function BfTape({ flip }) {
  const items = [...BF_TAPE, ...BF_TAPE];
  return (
    <div className={`bf-band ${flip ? 'is-flip' : ''}`} aria-hidden="true">
      <div className="bf-tape"><div className="bf-tape-track">{[0, 1].map((k) => <ul key={k} role="list">{items.map((t, i) => <li key={i}>{t}</li>)}</ul>)}</div></div>
    </div>
  );
}
/* countdown to the end of the Black Friday offers (campaign data), ticking every second, flip-clock tiles */
function useBfPreviewClock() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const ms = Math.max(0, new Date(CAMPAIGN.until).getTime() - now);
  return [Math.floor(ms / 864e5), Math.floor((ms % 864e5) / 36e5), Math.floor((ms % 36e5) / 6e4), Math.floor((ms % 6e4) / 1e3)];
}
const BF_UNITS = ['Days', 'Hrs', 'Min', 'Sec'];
function BfCount({ sm }) {
  const v = useBfPreviewClock();
  return (
    <div className={`bf-count ${sm ? 'is-sm' : ''}`} role="timer" aria-label={`${CAMPAIGN.untilLabel} ${v[0]} days, ${v[1]} hours and ${v[2]} minutes`}>
      {v.map((n, i) => <span key={i} className="bf-count-cell" aria-hidden="true"><b key={n} className="bf-flip">{String(n).padStart(2, '0')}</b><small>{BF_UNITS[i]}</small></span>)}
    </div>
  );
}
function BfClockText() {
  const [d, h, m, sec] = useBfPreviewClock(), p = (n) => String(n).padStart(2, '0');
  return <span className="bf-mm-strip-c" role="timer">{CAMPAIGN.untilLabel} <b>{d}d {p(h)}h {p(m)}m {p(sec)}s</b></span>;
}
/* a slowly turning round stamp on the offers panel */
function BfStamp() {
  return (
    <span className="bf-stamp" aria-hidden="true">
      <svg viewBox="0 0 120 120"><defs><path id="bf-ring" d="M60,60 m-47,0 a47,47 0 1,1 94,0 a47,47 0 1,1 -94,0" /></defs>
        <text><textPath href="#bf-ring" textLength="292" lengthAdjust="spacing">BLACK FRIDAY · NEWDERMAMED · TORONTO ·</textPath></text></svg>
      <i>Nov<br />27 to 30</i>
    </span>
  );
}
/* the red glow on the offers panel follows the pointer */
function BfFx() {
  useEffect(() => {
    const el = document.querySelector('.sw-panel'); if (!el || REDUCED) return;
    const f = (e) => { const r = el.getBoundingClientRect(); el.style.setProperty('--mx', `${e.clientX - r.left}px`); el.style.setProperty('--my', `${e.clientY - r.top}px`); };
    el.addEventListener('pointermove', f); return () => el.removeEventListener('pointermove', f);
  }, []);
  return null;
}
function BfExit() {
  return <a href="index.html?campaign=default" className="bf-exit"><i aria-hidden="true">←</i><span className="hidden sm:inline">Black Friday preview ·&nbsp;</span>Back to the site</a>;
}

function App() {'''
rep('\nfunction App() {', TAPE)
rep('        <Hero sectionRef={heroRef} onIntroDone={() => setIntroDone(true)} />\n', '        <Hero sectionRef={heroRef} onIntroDone={() => setIntroDone(true)} />\n        <BfTape />\n')
rep('        <TreatMenu />\n', '        <BfTape flip />\n        <TreatMenu />\n')
rep('        <Promotions />\n', '        <BfTape />\n        <Promotions />\n        <BfFx />\n')
# the look switcher is replaced by a way back to the normal site
# the shells no longer mount the Campaign looks switcher (round 23); this preview mounts its exit button there instead
rep("/* the Campaign looks switcher is hidden (round 23); Black Friday has its own page, black-friday-sale.html */",
    "(() => { const d = document.createElement('div'); d.id = 'campaign-root'; document.body.appendChild(d); ReactDOM.createRoot(d).render(<BfExit />); })();")
open(f'{root}/black-friday.html', 'w').write(s)
print('black-friday.html written')
