"""Round 27, both shells: the chat bot redesigned. Launcher: the agent's photo in a blue ring with a small amber chat badge.
Panel: blue gradient header with a greeting, three quick actions (book, call Uptown, call Downtown) that fold away once a chat
starts, questions as rows. Home only: the Aptos "24 months" chip sits lower, and the shop cards sit further below the button.
usage: python3 src/patches-applied/r27_chat.py <NDM dir>
"""
import re
import sys
from pathlib import Path

CSS = '''
  /* chat bot (round 27) */
  .chat-launch{padding:3px;background:linear-gradient(145deg,#26B1E7,#0F80C3 55%,#0A4F7A);box-shadow:0 18px 40px -14px rgba(15,128,195,.8),inset 0 1px 0 rgba(255,255,255,.35)}
  .chat-launch:hover{transform:translateY(-2px)}
  .chat-launch.is-open{background:#0A4F7A}
  .chat-launch-img{display:block;width:100%;height:100%;border-radius:50%;object-fit:cover;border:2px solid #fff}
  .chat-launch-badge{position:absolute;right:-3px;bottom:-3px;display:grid;place-items:center;width:25px;height:25px;border-radius:50%;background:#FFA617;color:#fff;border:2px solid #fff}
  .chat-head{background:radial-gradient(110% 120% at 100% 0%,#26B1E7 0%,rgba(38,177,231,0) 58%),linear-gradient(150deg,#0F80C3,#0A4F7A);transition:padding .35s ease}
  .chat-quick a{display:flex;flex-direction:column;gap:8px;border-radius:16px;background:#fff;padding:11px 11px 12px;font:500 12.5px/1.25 Inter,"Helvetica Neue",Arial,sans-serif;color:#1B242B;box-shadow:0 16px 30px -18px rgba(11,15,19,.5),0 0 0 1px rgba(27,36,43,.06);transition:transform .3s ease,color .2s ease}
  .chat-quick a:hover{transform:translateY(-2px);color:#0F80C3}
  .chat-quick i{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:rgba(15,128,195,.1);color:#0F80C3}
  .chat-quick a:first-child i{background:#FFA617;color:#fff}
  .chat-body{background:linear-gradient(180deg,#F3F8FB 0%,#FAFAF8 140px)}
'''
for name in ['index.html', 'promotion.html']:
    f = Path(sys.argv[1]) / name
    s = f.read_text(encoding='utf-8')

    def rep(a, b):
        global s
        c = s.count(a)
        assert c == 1, (name, a[:80], c)
        s = s.replace(a, b)

    # launcher
    i = s.index('      <button ref={btn} type="button" onClick={() => setOpen((v) => !v)}')
    j = s.index('      <section id="chat-panel"', i)
    s = s[:i] + r'''      <button ref={btn} type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="chat-panel" aria-label={open ? 'Close chat' : 'Chat with NewDermaMed'} tabIndex={off ? -1 : 0}
        className={`chat-btn chat-launch fixed z-[61] grid size-[56px] place-items-center rounded-full text-white md:size-[62px] ${off ? 'is-off' : ''} ${note && !open ? 'has-note' : ''} ${open ? 'is-open' : ''}`}
        style={{ right: small ? 16 : 24, bottom: `calc(${bottom}px + env(safe-area-inset-bottom))` }}>
        {open ? <IconClose /> : <><img src={CHAT_AGENT.img} alt="" className="chat-launch-img" /><span aria-hidden="true" className="chat-launch-badge"><IconChat size={13} /></span></>}
        {note && !open && <i aria-hidden="true" className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#E5484D] px-1 font-inter text-[11px] font-semibold not-italic leading-none text-white ring-2 ring-white">1</i>}
      </button>
''' + s[j:]
    # panel shape
    rep("${small ? 'inset-x-2 bottom-2 top-[76px] rounded-[22px]' : 'h-[min(600px,calc(100vh-140px))] w-[380px] rounded-[22px]'}",
        "${small ? 'inset-x-2 bottom-2 top-[76px] rounded-[26px]' : 'h-[min(640px,calc(100vh-140px))] w-[400px] rounded-[26px]'}")
    rep("style={small ? {} : { right: 24, bottom: bottom + 72 }}>", "style={small ? {} : { right: 24, bottom: bottom + 76 }}>")
    # header + quick actions
    i = s.index('        <header className="flex items-center gap-3 bg-ndm-night px-4 py-3.5 text-white">')
    j = s.index('        </header>\n', i) + len('        </header>\n')
    s = s[:i] + r'''        <header className={`chat-head relative px-5 pt-4 text-white ${msgs.length ? 'pb-4' : 'pb-14'}`}>
          <div className="flex items-center gap-3">
            <span className="relative size-11 shrink-0"><img src={CHAT_AGENT.img} alt="" className="size-11 rounded-full object-cover ring-2 ring-white/40" /><i className="absolute bottom-0 right-0 size-3 rounded-full bg-[#3DDC84] ring-2 ring-[#0F80C3]" /></span>
            <span className="min-w-0 flex-1">
              <span className="block font-inter text-[15px] font-semibold">{CHAT_AGENT.name} <span className="font-normal text-white/75">· NewDermaMed</span></span>
              <span className="block font-inter text-[12px] text-white/75">Virtual assistant, our care team follows up</span>
            </span>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="grid size-9 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"><IconClose size={16} /></button>
          </div>
          {!msgs.length && <p className="mt-5 font-aeonik text-[26px] leading-[1.1] tracking-[-0.02em]">Hi there,<br /><span className="tt-strong">how can we help?</span></p>}
        </header>
        {!msgs.length && (
          <div className="chat-quick relative z-[1] -mt-9 grid grid-cols-3 gap-2 px-4">
            <a href="#/book" onClick={() => setOpen(false)}><i aria-hidden="true"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3.5" y="5" width="17" height="15" rx="3" /><path d="M8 3v4M16 3v4M3.5 10h17" /></svg></i>Book a free consultation</a>
            {PHONES.map((ph) => <a key={ph.label} href={tel(ph.num)}><i aria-hidden="true"><IconPhone /></i>Call {ph.label}<span className="-mt-1.5 block whitespace-nowrap text-[11px] font-normal tabular-nums tracking-[-0.01em] text-ndm-muted">{ph.num}</span></a>)}
          </div>
        )}
''' + s[j:]
    rep('<div ref={list} className="flex-1 space-y-3 overflow-y-auto overscroll-contain bg-ndm-paper px-4 py-4" aria-live="polite">',
        '<div ref={list} className="chat-body flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4" aria-live="polite">')
    # questions as rows
    i = s.index('              <ul className="mt-2 flex flex-wrap gap-2" role="list">')
    j = s.index('              </ul>\n', i) + len('              </ul>\n')
    s = s[:i] + r'''              <ul className="mt-2 grid gap-1.5" role="list">
                {left.slice(0, msgs.length ? 3 : 5).map((pq) => (
                  <li key={pq[0]}><button type="button" onClick={() => ask(pq[0], pq)} className="group flex w-full items-center justify-between gap-3 rounded-[14px] bg-white px-3.5 py-2.5 text-left font-inter text-[13.5px] text-ndm-ink ring-1 ring-ndm-ink/[.07] transition hover:text-ndm-deep hover:ring-ndm-deep/50">{pq[0]}<IconArrow size={11} className="shrink-0 text-ndm-deep transition-transform group-hover:translate-x-0.5" /></button></li>
                ))}
              </ul>
''' + s[j:]
    rep('<p className="font-inter text-[12px] text-ndm-muted">{msgs.length ? \'You can also ask\' : \'Common questions\'}</p>',
        '<p className="font-inter text-[11.5px] font-medium uppercase tracking-[.12em] text-ndm-muted">{msgs.length ? \'You can also ask\' : \'Common questions\'}</p>')
    rep('  .chat-btn{transition:', CSS.lstrip('\n') + '  .chat-btn{transition:')
    # shop: the product cards sit further below the button on wide screens
    a = '<div className="relative mt-[clamp(20px,2.6vw,36px)] px-[var(--gx)]">'
    if s.count(a) == 1:
        s = s.replace(a, '<div className="relative mt-[clamp(20px,2.6vw,36px)] px-[var(--gx)] lg:!mt-12">')
    if name == 'index.html':
        rep('.apx-c1{bottom:12%;left:-4%;animation-delay:1.4s}', '.apx-c1{bottom:3%;left:-4%;animation-delay:1.4s}')
    f.write_text(s, encoding='utf-8')
    print('patched', name)
