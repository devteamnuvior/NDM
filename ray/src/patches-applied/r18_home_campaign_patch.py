import re
def rep(s, a, b, n=1, tag=''):
    c = s.count(a); assert c == n, (tag or a[:90], c); return s.replace(a, b)

CAMPAIGN_BLOCK = r'''/* ---------------------------------------------------------------- campaign looks (design preview for the team)
   One NDM base with swappable accents. A look changes colour tokens, the announcement bar, the home hero's first slide and the
   badges on treatment and offer cards. Logo, fonts, navigation and booking never change, and treatment / medical pages keep
   their own colours (they only get the announcement bar). Pick a look with the switch at the bottom left, or open any page with
   ?campaign=<id> (?campaign=default clears it). Copy stays within the brief's limits: headline 40, subhead 90, button 18, bar 70.
   Offers, dates and bonus terms are placeholders from the Nov 4 brief until Raymond approves them. */
const CAMPAIGN_LOOKS = {
  'black-friday': ['Black Friday', ['#0B0B0C', '#D2B57B', '#F4EBDD']],
  holiday: ['Holiday', ['#173D2E', '#7A1F2B', '#D6B46A']],
  'new-year': ['New Year', ['#FFFFFF', '#C9CED4', '#5E6A75']],
};
const CAMPAIGNS = [
  { id: 'vip', name: 'VIP Early Access', look: 'black-friday', when: 'Nov 16 to 26', badge: 'VIP Access',
    bar: 'VIP Early Access: Black Friday offers open to the list on Nov 23', barM: 'VIP Early Access opens Nov 23', barCta: ['Join the VIP list', '#/vip'],
    head: ['See Black Friday', 'offers first'], sub: 'Join the VIP list and our private offer page opens to you on Monday, November 23.', cta: ['Join the VIP list', '#/vip'],
    until: '2026-11-27T00:00:00-05:00', untilLabel: 'Black Friday starts in',
    img: { src: 'assets/hero/clinic-exterior.jpg', alt: 'The NewDermaMed clinic storefront in Toronto at night', pos: '58% 50%', scale: 1 } },
  { id: 'black-friday', name: 'Black Friday', look: 'black-friday', when: 'Nov 27 to 30', badge: 'Black Friday',
    bar: 'Black Friday: treatment offers until Monday, Nov 30 at 11:59 pm', barM: 'Black Friday offers until Nov 30', barCta: ['See the offers', 'promotion.html'],
    head: ['Black Friday', 'at NewDermaMed'], sub: 'Treatment offers Friday to Monday. Monday is our online finale for skincare and gift cards.', cta: ['See the offers', 'promotion.html'],
    until: '2026-11-30T23:59:00-05:00', untilLabel: 'Offers end in',
    img: { src: 'assets/hero/clinic-exterior.jpg', alt: 'The NewDermaMed clinic storefront in Toronto at night', pos: '58% 50%', scale: 1 } },
  { id: 'holiday', name: 'Holiday Gifting', look: 'holiday', when: 'Dec 1 to 25', badge: 'Gift Idea',
    bar: 'Holiday gift cards with bonus value, delivered instantly by email', barM: 'Holiday gift cards, sent by email', barCta: ['Shop gift cards', '#/gift-cards'],
    head: ['Holiday gift cards,', 'with bonus value'], sub: 'Delivered instantly by email, with bonus value to use from January to March.', cta: ['Shop gift cards', '#/gift-cards'],
    img: { src: 'assets/hero/clinic-reception.jpg', alt: 'NewDermaMed reception with the clinic logo and skincare wall', pos: '50% 50%', scale: 1 } },
  { id: 'boxing-week', name: 'Boxing Week', look: 'holiday', when: 'Dec 26 to 31', badge: 'Gift Idea',
    bar: 'Boxing Week online, Dec 26 to 31: skincare and gift cards', barM: 'Boxing Week online, Dec 26 to 31', barCta: ['Shop skincare', '#/shop'],
    head: ['Boxing Week,', 'online only'], sub: 'Skincare offers, a last call on gift card bonus value, and January booking now open.', cta: ['Shop skincare', '#/shop'],
    img: { src: 'assets/hero/clinic-reception.jpg', alt: 'NewDermaMed reception with the clinic logo and skincare wall', pos: '50% 50%', scale: 1 } },
  { id: 'new-year', name: 'New Year Skin Plan', look: 'new-year', when: 'Jan 1 to 31', badge: 'New Year Plan',
    bar: 'New Year Skin Plan: a free skin analysis with your consultation', barM: 'Free skin analysis with your visit', barCta: ['Book yours', '#/book'],
    head: ['Your 2027 skin plan', 'starts here'], sub: 'Begin with a free skin analysis and a treatment plan built around your skin.', cta: ['Book Free Consultation', '#/book'],
    img: { src: 'assets/home/visia-consult.jpg', alt: 'A NewDermaMed provider reviewing skin analysis results with a patient', pos: '60% 45%', scale: 1 } },
];
const CAMPAIGN_KEY = 'ndm-campaign';
const CAMPAIGN_SKIP = ['botox.html', 'aptos-thread-lift.html', 'what-causes-rosacea-redness.html']; /* treatment and medical pages keep their look */
const CAMPAIGN = (() => {
  let id = null;
  try {
    const q = new URLSearchParams(location.search).get('campaign');
    if (q) { if (q === 'default') localStorage.removeItem(CAMPAIGN_KEY); else localStorage.setItem(CAMPAIGN_KEY, q); }
    id = localStorage.getItem(CAMPAIGN_KEY) || q;
  } catch (e) { id = new URLSearchParams(location.search).get('campaign'); }
  return CAMPAIGNS.find((c) => c.id === id) || null;
})();
const CAMPAIGN_LOOK = CAMPAIGN && !CAMPAIGN_SKIP.includes(HERE) ? CAMPAIGN.look : null;
if (CAMPAIGN) document.documentElement.dataset.campaignBar = CAMPAIGN.look;
if (CAMPAIGN_LOOK) document.documentElement.dataset.campaign = CAMPAIGN_LOOK;

/* time left until a campaign moment; null once it has passed, so countdowns hide themselves */
function useCountdown(until) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { if (!until) return; const t = setInterval(() => setNow(Date.now()), 20000); return () => clearInterval(t); }, [until]);
  if (!until) return null;
  const ms = new Date(until).getTime() - now;
  if (!(ms > 0)) return null;
  const d = Math.floor(ms / 864e5), h = Math.floor((ms % 864e5) / 36e5), m = Math.floor((ms % 36e5) / 6e4);
  return { d, h, m, text: `${d}d ${h}h ${m}m`, label: `${d} days, ${h} hours and ${m} minutes` };
}
function CampaignHeroTag({ c }) {
  const cd = useCountdown(c.until);
  return (
    <p className="fade mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 md:mb-5">
      <span className="cmp-badge">{c.badge}</span>
      {cd && <span role="timer" aria-label={`${c.untilLabel} ${cd.label}`} className="font-inter text-[13px] text-white/80 md:text-[14px]">{c.untilLabel} <b className="font-semibold tabular-nums text-white">{cd.text}</b></span>}
    </p>
  );
}
function CmpSwatch({ c }) {
  return <span aria-hidden="true" className="flex shrink-0 -space-x-1.5">{c.map((x, i) => <i key={i} className="size-[18px] rounded-full border-2 border-white" style={{ background: x, boxShadow: '0 0 0 1px rgba(27,36,43,.12)' }} />)}</span>;
}
function CampaignSwitch() {
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  const cur = CAMPAIGN ? CAMPAIGN.id : 'default';
  useEffect(() => {
    if (!open) return;
    const k = (e) => { if (e.key === 'Escape') setOpen(false); };
    const c = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    window.addEventListener('keydown', k); document.addEventListener('pointerdown', c);
    return () => { window.removeEventListener('keydown', k); document.removeEventListener('pointerdown', c); };
  }, [open]);
  const pick = (id) => {
    let stored = true;
    try { if (id === 'default') localStorage.removeItem(CAMPAIGN_KEY); else localStorage.setItem(CAMPAIGN_KEY, id); } catch (e) { stored = false; }
    const u = new URL(location.href);
    if (stored) u.searchParams.delete('campaign'); else u.searchParams.set('campaign', id);
    location.replace(u.toString());
  };
  const sw = (look) => (look ? CAMPAIGN_LOOKS[look][1] : ['#0F80C3', '#FFA617', '#1B242B']);
  const opts = [{ id: 'default', name: 'NewDermaMed default', when: 'The rest of the year' }, ...CAMPAIGNS];
  return (
    <div ref={box} className="cmp-switch fixed left-3 z-[63] md:left-5" data-lenis-prevent="">
      {open && (
        <div role="dialog" aria-label="Campaign looks" className="cmp-panel absolute bottom-[calc(100%+10px)] left-0 w-[min(320px,calc(100vw-24px))] rounded-[22px] bg-white p-2 text-ndm-ink shadow-[0_40px_80px_-30px_rgba(11,15,19,.55)] ring-1 ring-ndm-ink/[.07]">
          <div className="px-3 pb-2 pt-2.5">
            <p className="font-mont text-[11px] font-semibold uppercase tracking-[.14em] text-ndm-muted">Campaign looks</p>
            <p className="mt-1 font-inter text-[12.5px] leading-[1.45] text-ndm-muted">Design preview for the team. Changes the colours, top bar, home hero and badges on every page.</p>
          </div>
          <ul role="list" className="space-y-0.5">
            {opts.map((o) => {
              const on = o.id === cur;
              return (
                <li key={o.id}>
                  <button type="button" onClick={() => { if (!on) pick(o.id); }} aria-pressed={on}
                    className={`flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-left transition-colors ${on ? 'bg-ndm-mist' : 'hover:bg-ndm-mist/70'}`}>
                    <CmpSwatch c={sw(o.look)} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-inter text-[14px] font-medium leading-tight">{o.name}</span>
                      <span className="mt-0.5 block font-inter text-[12px] text-ndm-muted">{o.look ? `${CAMPAIGN_LOOKS[o.look][0]} look · ${o.when}` : o.when}</span>
                    </span>
                    {on && <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F80C3" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>}
                  </button>
                </li>
              );
            })}
          </ul>
          {CAMPAIGN && <button type="button" onClick={() => pick('default')} className="mt-2 h-10 w-full rounded-full bg-ndm-ink font-inter text-[13.5px] font-medium text-white transition-colors hover:bg-black">Revert to default</button>}
        </div>
      )}
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-haspopup="dialog" aria-label={`Campaign look: ${CAMPAIGN ? CAMPAIGN.name : 'default'}. Change look`}
        className="flex h-11 items-center gap-2 rounded-full bg-white/95 pl-2 pr-3 font-inter text-[13px] font-medium text-ndm-ink shadow-[0_14px_34px_-14px_rgba(11,15,19,.45)] ring-1 ring-ndm-ink/[.08] backdrop-blur-[8px] transition-transform hover:-translate-y-0.5">
        <CmpSwatch c={sw(CAMPAIGN && CAMPAIGN.look)} />
        <span className="hidden sm:inline">{CAMPAIGN ? CAMPAIGN.name : 'Default look'}</span>
        <IconChevron className={`opacity-60 transition-transform ${open ? '' : 'rotate-180'}`} />
      </button>
    </div>
  );
}

'''

CMP_CSS = r'''
  /* campaign looks: tokens per look (html[data-campaign-bar] on every page, html[data-campaign] where accents apply) */
  html[data-campaign-bar="black-friday"]{--cmp-bar:#0B0B0C;--cmp-bar-fg:#F4EBDD;--cmp-gold:#D2B57B;--cmp-acc:#8C6D36;--cmp-acc-dk:#DCC28E;--cmp-badge-bg:#0B0B0C;--cmp-badge-fg:#EBD7AA;--cmp-badge-line:rgba(210,181,123,.6);--cmp-edge:linear-gradient(115deg,rgba(200,169,106,.85),rgba(27,36,43,.10) 42%,rgba(27,36,43,.10) 62%,rgba(11,11,12,.55));--cmp-tint:linear-gradient(90deg,rgba(6,6,7,.9) 0%,rgba(6,6,7,.62) 52%,rgba(6,6,7,.38) 100%),radial-gradient(60% 70% at 85% 20%,rgba(210,181,123,.22),transparent 70%)}
  html[data-campaign-bar="holiday"]{--cmp-bar:#173D2E;--cmp-bar-fg:#F6F1E6;--cmp-gold:#D6B46A;--cmp-acc:#1F5A41;--cmp-acc-dk:#E2C583;--cmp-badge-bg:#173D2E;--cmp-badge-fg:#F6F1E6;--cmp-badge-line:rgba(214,180,106,.65);--cmp-edge:linear-gradient(115deg,rgba(31,90,65,.8),rgba(27,36,43,.10) 42%,rgba(27,36,43,.10) 62%,rgba(122,31,43,.55));--cmp-tint:linear-gradient(90deg,rgba(12,36,27,.9) 0%,rgba(12,36,27,.62) 55%,rgba(84,20,30,.4) 100%),radial-gradient(55% 65% at 85% 15%,rgba(214,180,106,.22),transparent 70%)}
  html[data-campaign-bar="new-year"]{--cmp-bar:#F1F2F4;--cmp-bar-fg:#1B242B;--cmp-gold:#6F7A85;--cmp-acc:#4F5B66;--cmp-acc-dk:#E3E7EB;--cmp-badge-bg:#FFFFFF;--cmp-badge-fg:#3E4852;--cmp-badge-line:rgba(124,135,146,.5);--cmp-edge:linear-gradient(115deg,rgba(190,197,204,.95),rgba(27,36,43,.10) 42%,rgba(27,36,43,.10) 62%,rgba(154,163,173,.85));--cmp-tint:linear-gradient(90deg,rgba(26,31,36,.84) 0%,rgba(40,46,52,.52) 55%,rgba(220,226,232,.14) 100%),radial-gradient(60% 70% at 85% 20%,rgba(255,255,255,.3),transparent 70%)}
  html[data-campaign-bar] .promo-attn{background:var(--cmp-bar);color:var(--cmp-bar-fg);animation:none;box-shadow:inset 0 -1px 0 var(--cmp-badge-line)}
  html[data-campaign-bar] .promo-shine{display:none}
  .cmp-badge{display:inline-flex;align-items:center;gap:7px;border:1px solid var(--cmp-badge-line);border-radius:999px;background:var(--cmp-badge-bg);color:var(--cmp-badge-fg);padding:6px 12px 6px 10px;font-family:"Helvetica Neue",Inter,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;line-height:1;white-space:nowrap;box-shadow:0 10px 22px -14px rgba(0,0,0,.6)}
  .cmp-badge::before{content:'';width:6px;height:6px;flex-shrink:0;transform:rotate(45deg);background:var(--cmp-gold)}
  .promo-attn .cmp-badge{background:transparent;color:var(--cmp-gold);padding:3px 9px 3px 8px;font-size:9.5px;box-shadow:none}
  .cmp-tint{background:var(--cmp-tint)}
  html[data-campaign] .cmp-hl{color:var(--cmp-acc-dk)}
  html[data-campaign] .tt-strong.text-ndm-deep{color:var(--cmp-acc)}
  html[data-campaign] .tt-strong.text-ndm-sky{color:var(--cmp-acc-dk)}
  html[data-campaign] .eyebrow:not(.is-dark){background:linear-gradient(180deg,#fff,#FBFAF7) padding-box,var(--cmp-edge) border-box}
  .cmp-switch{bottom:calc(84px + env(safe-area-inset-bottom))}
  @media (min-width:768px){.cmp-switch{bottom:20px}}
  .cmp-panel{animation:chatPop .45s var(--e-out) both;transform-origin:0 100%}
  @media print{.cmp-switch{display:none}}
  /* chat pop-up: an incoming message a few seconds after the page settles */
  .chat-pop{animation:chatPop .6s cubic-bezier(.34,1.56,.64,1) both;transform-origin:100% 100%}
  .chat-pop-msg{animation:chatNote .45s var(--e-out) both}
  @keyframes chatPop{from{opacity:0;transform:translateY(14px) scale(.92)}to{opacity:1;transform:none}}
  .chat-btn.has-note::after{content:'';position:absolute;inset:0;border-radius:50%;animation:chatPulse 2.2s ease-out 3;pointer-events:none}
  @keyframes chatPulse{0%{box-shadow:0 0 0 0 rgba(15,128,195,.5)}100%{box-shadow:0 0 0 18px rgba(15,128,195,0)}}
  @media (prefers-reduced-motion:reduce){.chat-pop,.chat-pop-msg,.cmp-panel,.chat-btn.has-note::after{animation:none}}
'''

CHIME = r'''/* soft two-note chime when the chat pop-up's message arrives. Browsers only allow sound after the visitor has clicked,
   tapped or pressed a key on the page, so on a first, untouched visit the pop-up appears silently. */
let CHIME_CTX = null;
const chimeUnlock = () => { try { if (!CHIME_CTX) CHIME_CTX = new (window.AudioContext || window.webkitAudioContext)(); if (CHIME_CTX.state === 'suspended') CHIME_CTX.resume(); } catch (e) {} };
['pointerdown', 'keydown', 'touchend'].forEach((ev) => window.addEventListener(ev, chimeUnlock, { once: true, passive: true }));
function chatChime() {
  const c = CHIME_CTX; if (!c || c.state !== 'running') return;
  const t0 = c.currentTime + 0.02;
  [[880, 0], [1318.5, 0.12]].forEach(([f, d]) => {
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t0 + d); g.gain.linearRampToValueAtTime(0.11, t0 + d + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d + 0.55);
    o.connect(g); g.connect(c.destination); o.start(t0 + d); o.stop(t0 + d + 0.6);
  });
}

'''

NOTE_NEW = r'''      {note && !open && !off && (!small || clear) && (
        <div role="status" className="chat-pop fixed z-[61] w-[min(300px,calc(100vw-88px))] rounded-[20px] rounded-br-[6px] bg-white shadow-[0_28px_60px_-22px_rgba(11,15,19,.5)] ring-1 ring-ndm-ink/[.06]"
          style={small ? { right: 16, bottom: `calc(${bottom + 64}px + env(safe-area-inset-bottom))` } : { right: 24 + 58 + 12, bottom }}>
          <button type="button" onClick={() => setNote(false)} aria-label="Dismiss message" className="absolute right-2 top-2 grid size-7 place-items-center rounded-full text-ndm-muted hover:bg-ndm-mist hover:text-ndm-ink"><IconClose size={14} /></button>
          <div className="flex items-center gap-2.5 px-4 pt-3.5 pr-10">
            <span className="relative size-9 shrink-0"><img src={CHAT_AGENT.img} alt="" className="size-9 rounded-full object-cover" /><i className="absolute bottom-0 right-0 size-2.5 rounded-full bg-[#3DDC84] ring-2 ring-white" /></span>
            <span className="min-w-0">
              <span className="block font-inter text-[13.5px] font-semibold leading-tight text-ndm-ink">{CHAT_AGENT.name} <span className="font-normal text-ndm-muted">· NewDermaMed</span></span>
              <span className="mt-0.5 block font-inter text-[11.5px] text-ndm-muted">Virtual assistant · now</span>
            </span>
          </div>
          <div className="px-4 pb-4 pt-3">
            {noteTyping ? (
              <span className="flex w-fit gap-1 rounded-[16px] rounded-tl-[6px] bg-ndm-paper px-3.5 py-3" aria-label="Typing">{[0, 1, 2].map((d) => <i key={d} className="chat-dot size-1.5 rounded-full bg-ndm-muted" style={{ animationDelay: `${d * 0.15}s` }} />)}</span>
            ) : (
              <>
                <button type="button" onClick={() => setOpen(true)} className="chat-pop-msg block w-full rounded-[16px] rounded-tl-[6px] bg-ndm-paper px-3.5 py-3 text-left transition-colors hover:bg-ndm-mist">
                  <span className="block font-aeonik text-[19px] leading-[1.2] text-ndm-ink">How can I help you today?</span>
                  <span className="mt-1 block font-inter text-[13px] leading-[1.45] text-ndm-muted">Ask me about treatments, prices or booking.</span>
                </button>
                <div className="chat-pop-msg mt-3 flex flex-wrap gap-2" style={{ animationDelay: '.12s' }}>
                  <button type="button" onClick={() => setOpen(true)} className="rounded-full bg-ndm-deep px-3.5 py-2 font-inter text-[13px] font-medium text-white transition-colors hover:bg-ndm-ink">Ask a question</button>
                  <a href="#/book" onClick={() => setNote(false)} className="rounded-full border border-ndm-ink/15 px-3.5 py-2 font-inter text-[13px] text-ndm-ink transition-colors hover:border-ndm-ink">Book a consultation</a>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <button ref={btn}'''

for p in ['index.html', 'promotion.html']:
    s = open(p).read()
    home = p == 'index.html'
    # CSS
    s = rep(s, "  .menu-item-m:active{color:#0F80C3}\n", "  .menu-item-m:active{color:#0F80C3}\n" + CMP_CSS, tag='css')
    s = rep(s, "  .team-port-2{--ty:clamp(8px,1vw,16px)}\n", "  .team-port-2{--ty:clamp(8px,1vw,16px)}\n  .team-port-3{--ty:clamp(36px,4.2vw,68px)}\n", tag='team css')
    s, k = re.subn(r"  \.ba-dark\{[^\n]*\n", "  .ba-dark{background:radial-gradient(70% 55% at 78% 0%,rgba(214,180,120,.13),transparent 70%),radial-gradient(60% 50% at 0% 100%,rgba(255,166,23,.06),transparent 70%),linear-gradient(180deg,#26221F 0%,#171513 100%)}\n", s); assert k == 1, 'ba'
    s = s.replace('focus-within:ring-offset-[#18222A]', 'focus-within:ring-offset-[#171513]')
    # campaign core
    s = rep(s, "const PHONES = [", CAMPAIGN_BLOCK + "const PHONES = [", tag='cmp block')
    s = rep(s, "ReactDOM.createRoot(document.getElementById('book-root')).render(<BookPopup />);",
        "ReactDOM.createRoot(document.getElementById('book-root')).render(<BookPopup />);\n(() => { const d = document.createElement('div'); d.id = 'campaign-root'; document.body.appendChild(d); ReactDOM.createRoot(d).render(<CampaignSwitch />); })();", tag='mount')
    # announcement bar
    s = rep(s, "  const desktop = useMedia('(min-width: 1024px)');\n  const msgs = desktop ? [",
        "  const desktop = useMedia('(min-width: 1024px)');\n  const cd = useCountdown(CAMPAIGN && CAMPAIGN.until);\n  const msgs = CAMPAIGN ? (desktop ? [\n    { k: 'cmp', node: <>{CAMPAIGN.bar}, <a href={CAMPAIGN.barCta[1]} className=\"font-medium underline-offset-4 hover:underline\">{CAMPAIGN.barCta[0].toLowerCase()} →</a></> },\n  ] : [\n    { k: 'cmp', node: <a href={CAMPAIGN.barCta[1]} className=\"hover:underline\">{CAMPAIGN.barM} <span className=\"font-medium\">→</span></a> },\n    { k: 'phones', node: <span className=\"inline-flex items-center gap-1.5 text-[11.5px]\"><a href={tel(PHONES[0].num)} className=\"hover:underline\">Uptown {PHONES[0].num}</a><span className=\"opacity-50\">·</span><a href={tel(PHONES[1].num)} className=\"hover:underline\">Downtown {PHONES[1].num}</a></span> },\n  ]) : desktop ? [", tag='bar msgs')
    s = rep(s, '          <span className="promo-new relative hidden shrink-0 items-center gap-1.5 rounded-full bg-white px-2 py-[3px] font-mont text-[10px] font-semibold uppercase tracking-[.12em] text-ndm-deep sm:inline-flex">\n            <i className="promo-ping relative size-1.5 rounded-full bg-ndm-amber" />New\n          </span>',
        '          {CAMPAIGN ? <span className="cmp-badge mr-1 hidden shrink-0 sm:inline-flex">{CAMPAIGN.badge}</span> : (\n          <span className="promo-new relative hidden shrink-0 items-center gap-1.5 rounded-full bg-white px-2 py-[3px] font-mont text-[10px] font-semibold uppercase tracking-[.12em] text-ndm-deep sm:inline-flex">\n            <i className="promo-ping relative size-1.5 rounded-full bg-ndm-amber" />New\n          </span>)}', tag='bar pill')
    s = rep(s, '        <div className="hidden lg:flex justify-end">\n          <a href="#/shop"',
        '        <div className="hidden lg:flex items-center justify-end gap-4">\n          {cd && <span role="timer" aria-label={`${CAMPAIGN.untilLabel} ${cd.label}`} className="whitespace-nowrap opacity-90">{CAMPAIGN.untilLabel} <b className="font-semibold tabular-nums">{cd.text}</b></span>}\n          <a href="#/shop"', tag='bar right')
    # hero (shared component)
    s = rep(s, "{s.img.dim && <div className=\"absolute inset-0\" style={{ background: `rgba(6,10,14,${s.img.dim})` }} />}",
        "{s.img.dim && <div className=\"absolute inset-0\" style={{ background: `rgba(6,10,14,${s.img.dim})` }} />}\n                {s.cmp && <div className=\"cmp-tint absolute inset-0\" />}", tag='tint')
    s = rep(s, '                  <div className="hl">', '                  {s.cmp && <CampaignHeroTag c={s.cmp} />}\n                  <div className="hl">', tag='hero tag')
    s = rep(s, '<span key={i} className="line"><span className="line-in block">{l}</span></span>', "<span key={i} className=\"line\"><span className={`line-in block ${s.cmp && i === s.lines.length - 1 ? 'cmp-hl' : ''}`}>{l}</span></span>", tag='hero line')
    # badges on cards
    s = rep(s, "objectPosition: x.pos }} />\n              <span className=\"absolute left-3 top-3 rounded-full bg-white/85 px-3 py-1.5 font-inter text-[12px] text-ndm-ink backdrop-blur-[8px]\">{x.tag}</span>",
        "objectPosition: x.pos }} />\n              <span className=\"absolute left-3 top-3 rounded-full bg-white/85 px-3 py-1.5 font-inter text-[12px] text-ndm-ink backdrop-blur-[8px]\">{x.tag}</span>\n              {CAMPAIGN_LOOK && <span className=\"cmp-badge absolute right-3 top-3\">{CAMPAIGN.badge}</span>}", tag='treat badge')
    s = rep(s, "style={{ transitionTimingFunction: 'var(--e-out)', objectPosition: s.pos }} />\n              </div>",
        "style={{ transitionTimingFunction: 'var(--e-out)', objectPosition: s.pos }} />\n                {CAMPAIGN_LOOK && <span className=\"cmp-badge absolute left-3 top-3\">{CAMPAIGN.badge}</span>}\n              </div>", n=0 if home else 1, tag='offer badge')
    # Aptos figure: face only option
    if home:
        s = rep(s, "function AptosFigure({ className = 'h-full min-h-[480px] rounded-[22px] shadow-[0_26px_60px_-30px_rgba(53,40,98,.55)]' }) {\n  const box = useRef(null);\n  const [body, setBody] = useState(false);",
            "function AptosFigure({ className = 'h-full min-h-[480px] rounded-[22px] shadow-[0_26px_60px_-30px_rgba(53,40,98,.55)]', faceOnly = false }) {\n  const box = useRef(null);\n  const [body, setBody] = useState(false);\n  const [run, setRun] = useState(0); /* faceOnly: redraw the thread lines instead of switching to the body chart */", tag='apt1')
        s = rep(s, "t = setInterval(() => setBody((v) => !v), 5200); });", "t = setInterval(() => (faceOnly ? setRun((v) => v + 1) : setBody((v) => !v)), 5200); });", tag='apt2')
        s = rep(s, "<svg key={`f${body}`}", "<svg key={`f${body}${run}`}", tag='apt3')
        s = rep(s, "      <div className={layer} style={{ opacity: body ? 1 : 0 }} aria-hidden={!body}>\n        <img src={BODY_IMG}", "      {!faceOnly && <div className={layer} style={{ opacity: body ? 1 : 0 }} aria-hidden={!body}>\n        <img src={BODY_IMG}", tag='apt4')
        s = rep(s, "          ))}\n        </svg>\n      </div>\n    </figure>", "          ))}\n        </svg>\n      </div>}\n    </figure>", tag='apt5')
        s = rep(s, '<AptosFigure className="h-full" /></div>', '<AptosFigure className="h-full" faceOnly /></div>', tag='apt hero')
    # stats: labels lead
    if home:
        s = rep(s, '            <span className="block font-aeonik text-[clamp(46px,4.8vw,72px)] leading-none tracking-[-0.03em] text-ndm-ink tabular-nums"><CountUp to={n} run={run} suffix={s} /></span>\n            <span className="mt-3 block font-inter text-[14.5px] text-ndm-muted md:text-[15.5px]">{l}</span>',
            '            <span className="block font-aeonik text-[clamp(42px,4.4vw,66px)] leading-none tracking-[-0.03em] text-ndm-deep tabular-nums"><CountUp to={n} run={run} suffix={s} /></span>\n            <span aria-hidden="true" className="mx-auto mt-4 block h-[3px] w-8 rounded-full bg-gradient-to-r from-ndm-deep to-ndm-sky" />\n            <span className="mx-auto mt-3 block max-w-[16ch] font-aeonik text-[clamp(18px,1.55vw,24px)] leading-[1.22] tracking-[-0.015em] text-ndm-ink">{l}</span>', tag='stats')
    # team: four people, the fourth a sample until photos arrive
    s = rep(s, "    facts: [['Education', 'BSc, Biology'], ['Certifications', 'Cosmetic Dermatology, Medical Aesthetics'], ['Role', 'Director of NewDermaMed']],\n  },\n];",
        "    facts: [['Education', 'BSc, Biology'], ['Certifications', 'Cosmetic Dermatology, Medical Aesthetics'], ['Role', 'Director of NewDermaMed']],\n  },\n  /* sample until the fourth team member's photo and profile arrive */\n  { id: 'team-sample', first: 'Team member', tag: 'Photo coming soon', sample: true, name: 'Team member', role: 'Profile coming soon', img: 'assets/team/sample.svg' },\n];", tag='team data')
    s = rep(s, "const TEAM_ORDER = ['team-alin', 'team-negin', 'team-luis'];\nconst TEAM_DRIFT = [-26, 30, -10];", "const TEAM_ORDER = ['team-alin', 'team-negin', 'team-luis', 'team-sample'];\nconst TEAM_DRIFT = [-26, 30, -10, 22];", tag='team order')
    s = rep(s, '<button type="button" onClick={onOpen} aria-haspopup="dialog" aria-label={`View profile of ${m.name}, ${m.role}`} className="group block w-full text-left">',
        '<button type="button" onClick={m.sample ? undefined : onOpen} disabled={!!m.sample} aria-haspopup={m.sample ? undefined : \'dialog\'} aria-label={m.sample ? \'Team member, photo coming soon\' : `View profile of ${m.name}, ${m.role}`} className="group block w-full text-left disabled:cursor-default">', tag='team btn')
    s = rep(s, '          <span aria-hidden="true" className="team-port-more absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1.5 font-inter text-[12px] text-ndm-ink backdrop-blur-[6px]">View profile</span>',
        '          {!m.sample && <span aria-hidden="true" className="team-port-more absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1.5 font-inter text-[12px] text-ndm-ink backdrop-blur-[6px]">View profile</span>}', tag='team more')
    s = rep(s, 'className={`team-ports grid grid-cols-3 items-start gap-[clamp(10px,1.6vw,24px)]', 'className={`team-ports grid grid-cols-2 items-start gap-[clamp(10px,1.6vw,24px)] sm:grid-cols-4', tag='team grid')
    # chat pop-up
    s = rep(s, "function ChatBot({ ready, hidden }) {", CHIME + "function ChatBot({ ready, hidden }) {", tag='chime')
    s = rep(s, "  const [note, setNote] = useState(false);\n", "  const [note, setNote] = useState(false);\n  const [noteTyping, setNoteTyping] = useState(true);\n", tag='nt')
    s = rep(s, "  /* on phones the button sits above the floating search button",
        "  /* the pop-up first shows the assistant typing, then the message arrives with a soft chime */\n  useEffect(() => {\n    if (!note) return;\n    setNoteTyping(true);\n    const t = setTimeout(() => { setNoteTyping(false); chatChime(); }, REDUCED ? 0 : 1500);\n    return () => clearTimeout(t);\n  }, [note]);\n  /* on phones the button sits above the floating search button", tag='nt eff')
    s, k = re.subn(r"      \{note && !open && !off && \(!small \|\| clear\) && \(\n.*?\n      \)\}\n      <button ref=\{btn\}", lambda m: NOTE_NEW, s, flags=re.S); assert k == 1, 'note'
    s = rep(s, "md:size-[58px] ${off ? 'is-off' : ''}`}", "md:size-[58px] ${off ? 'is-off' : ''} ${note && !open ? 'has-note' : ''}`}", tag='btn cls')
    s = rep(s, '{note && !open && <i aria-hidden="true" className="absolute right-0.5 top-0.5 size-3 rounded-full bg-ndm-amber ring-2 ring-white" />}',
        '{note && !open && <i aria-hidden="true" className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-ndm-amber px-1 font-inter text-[11px] font-semibold not-italic leading-none text-white ring-2 ring-white">1</i>}', tag='badge')
    if home:
        s = rep(s, "  { tab: ['Aptos Thread Lift', 'Number one training centre'], vis: 'aptos',\n    lines: ['Number one Aptos', 'training centre in Canada'],",
            "  { tab: ['Aptos Thread Lift', '#1 training centre in Canada'], vis: 'aptos',\n    lines: ['#1 Aptos training', 'centre in Canada'],", tag='slide2')
        s = rep(s, "  { tab: ['Dermal Fillers', 'Balanced, never overdone'],\n    lines: ['Dermal fillers,', 'placed with precision'],\n    sub: 'Injectables planned around your facial structure by our medical team, for a refreshed look that still feels like you. Results vary by individual.',\n    cta: 'Explore Dermal Fillers', href: '#/dermal-fillers',",
            "  { tab: ['Injectables', '16+ years of experience'],\n    lines: ['Botox®, Dermal fillers, Biostimulator', 'with 16+ years of experience'],\n    sub: 'Planned and placed by our medical team, caring for patients at our Toronto clinics for over 16 years. Every plan starts with a free consultation.',\n    cta: 'Explore Injectables', href: '#/injectables',", tag='slide3')
        s = rep(s, "const SLIDES = [", "const SLIDES_BASE = [", tag='sb')
        s = rep(s, "];\n\nconst PARTNERS = [", "];\n/* a campaign look puts its own hero first (live text, no words in images) */\nconst SLIDES = CAMPAIGN_LOOK ? [{ tab: [CAMPAIGN.name, CAMPAIGN.when], cmp: CAMPAIGN, lines: CAMPAIGN.head, sub: CAMPAIGN.sub, cta: CAMPAIGN.cta[0], href: CAMPAIGN.cta[1], img: CAMPAIGN.img }, ...SLIDES_BASE] : SLIDES_BASE;\n\nconst PARTNERS = [", tag='slides')
    else:
        s = rep(s, '        <Faq items={PROMO_FAQS} lead="Your top questions," strong="answered" intro="Everything you need to know before starting your journey with us." />\n',
            '        <Faq items={PROMO_FAQS} lead="Your top questions," strong="answered" intro="Everything you need to know before starting your journey with us." />\n        <Appointment />\n', tag='promo form')
    open(p, 'w').write(s); print(p, 'ok')
