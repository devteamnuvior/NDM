# round 9: Inside our clinics photos load well before the section is reached; a slide only advances once the next photo is ready
import sys
for p in sys.argv[1:]:
    s = open(p, encoding='utf-8').read()
    old = """  const [seen, setSeen] = useState(false);
  const go = (d) => setI((x) => (x + d + n) % n);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.25 });
    io.observe(frame.current);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!seen || REDUCED) return;
    const t = setTimeout(() => go(1), 6000);
    return () => clearTimeout(t);
  }, [i, seen]);"""
    new = """  const [seen, setSeen] = useState(false);
  const [near, setNear] = useState(false);
  const ready = useRef({});
  const go = (d) => setI((x) => (x + d + n) % n);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.25 });
    /* start fetching every clinic photo about two screens before the section arrives */
    const pre = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); pre.disconnect(); } }, { rootMargin: '200% 0px' });
    io.observe(frame.current); pre.observe(frame.current);
    return () => { io.disconnect(); pre.disconnect(); };
  }, []);
  useEffect(() => {
    if (!near) return;
    CLINIC_SLIDES.forEach((x) => {
      const im = clinicImg(x), pic = new Image();
      pic.sizes = '100vw'; pic.srcset = im.srcSet; pic.src = im.src;
      (pic.decode ? pic.decode() : Promise.resolve()).then(() => { ready.current[x.k] = true; }, () => { ready.current[x.k] = true; });
    });
  }, [near]);
  useEffect(() => {
    if (!seen || REDUCED) return;
    let t;
    const tick = (wait) => { t = setTimeout(() => (ready.current[CLINIC_SLIDES[(i + 1) % n].k] ? go(1) : tick(400)), wait); };
    tick(5000);
    return () => clearTimeout(t);
  }, [i, seen]);"""
    assert s.count(old) == 1, (p, 'state')
    s = s.replace(old, new)
    old2 = """<img src={im.src} srcSet={im.srcSet} sizes="100vw" alt={x.alt} loading={k ? 'lazy' : undefined} decoding="async" className={`cl-img cl-kb${k % 4}`} />"""
    new2 = """{near && <img src={im.src} srcSet={im.srcSet} sizes="100vw" alt={x.alt} decoding="async" fetchPriority={k ? 'low' : 'high'} className={`cl-img cl-kb${k % 4}`} />}"""
    assert s.count(old2) == 1, (p, 'img')
    s = s.replace(old2, new2)
    open(p, 'w', encoding='utf-8').write(s)
    print('ok', p)
