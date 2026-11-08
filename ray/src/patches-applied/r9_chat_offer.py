# round 9: the chat note is one short line ("Hi, how can I help?") beside the chat button; the 10% offer pop-up
# shows once on every page in each visit, whether or not it was closed before
import sys
for p in sys.argv[1:]:
    s = open(p, encoding='utf-8').read()
    a = s.index('''        <div role="status" className="chat-pop fixed z-[61] w-[min(300px,calc(100vw-88px))]''')
    b = s.index('''      )}
      <button ref={btn} type="button" onClick={() => setOpen((v) => !v)}''', a)
    new = '''        <div role="status" className="chat-pop fixed z-[61] flex max-w-[calc(100vw-88px)] items-center gap-2.5 rounded-[18px] rounded-br-[6px] bg-white py-2 pl-2 pr-9 shadow-[0_24px_50px_-22px_rgba(11,15,19,.5)] ring-1 ring-ndm-ink/[.06]"
          style={small ? { right: 16, bottom: `calc(${bottom + 64}px + env(safe-area-inset-bottom))` } : { right: 24 + 58 + 12, bottom: bottom + 8 }}>
          <span className="relative size-9 shrink-0"><img src={CHAT_AGENT.img} alt="" className="size-9 rounded-full object-cover" /><i className="absolute bottom-0 right-0 size-2.5 rounded-full bg-[#3DDC84] ring-2 ring-white" /></span>
          {noteTyping
            ? <span className="flex gap-1 px-1 py-2" aria-label="Typing">{[0, 1, 2].map((d) => <i key={d} className="chat-dot size-1.5 rounded-full bg-ndm-muted" style={{ animationDelay: `${d * 0.15}s` }} />)}</span>
            : <button type="button" onClick={() => setOpen(true)} className="chat-pop-msg whitespace-nowrap py-1 text-left font-inter text-[14px] font-medium text-ndm-ink hover:text-ndm-deep">Hi, how can I help?</button>}
          <button type="button" onClick={noteOff} aria-label="Dismiss message" className="absolute right-1.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-ndm-muted hover:bg-ndm-mist hover:text-ndm-ink"><IconClose size={13} /></button>
        </div>
'''
    s = s[:a] + new + s[b:]
    old = "  try { return !localStorage.getItem(OFFER_KEY) && sessionStorage.getItem('ndm-offer-' + HERE) !== '1'; } catch (e) { return true; }"
    assert s.count(old) == 1, p
    s = s.replace(old, "  try { return sessionStorage.getItem('ndm-offer-' + HERE) !== '1'; } catch (e) { return true; } /* once on every page per visit */")
    open(p, 'w', encoding='utf-8').write(s); print('ok', p)
