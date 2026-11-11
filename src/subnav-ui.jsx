/* ---------------------------------------------------------------- the site's one sub-menu (round 32): the Botox section bar's look
   (sticky under the header, pill links, the active one in brand blue, scrolls sideways on phones and keeps the active pill in view).
   items: [key, label]; on: active key; onPick(key, event). Used by the account and legal pages. */
function SubNav({ label, items, on, onPick, lead }) {
  const box = useRef(null);
  useEffect(() => {
    const r = box.current, b = r && r.querySelector(`[data-k="${on}"]`);
    if (b) r.scrollTo({ left: b.offsetLeft - r.clientWidth / 2 + b.offsetWidth / 2, behavior: REDUCED ? 'auto' : 'smooth' });
  }, [on]);
  return (
    <nav aria-label={label} className="tx-nav sticky top-[100px] z-30 bg-ndm-paper/85 backdrop-blur-[10px] xl:top-[120px]">
      <div ref={box} className="no-scrollbar relative overflow-x-auto px-[var(--gx)] py-2.5">
        <ul className="relative mx-auto flex w-max gap-1" role="list">
          {lead}
          {items.map(([k, t, extra]) => (
            <li key={k} data-k={k} className="shrink-0">
              <a href={`#${k}`} onClick={(e) => onPick(k, e)} aria-current={on === k ? 'true' : undefined}
                className={`flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2 font-inter text-[14px] transition-colors ${on === k ? 'bg-ndm-deep font-medium text-white' : 'text-ndm-ink/80 hover:bg-white hover:text-ndm-ink'}`}>
                {t}{extra}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
