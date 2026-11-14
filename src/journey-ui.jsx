/* ---------------------------------------------------------------- Start your journey: start with a free skin analysis
   (round 19, after the futuron.framer.website "Join a Community" card; own file since round 34, shared by the treatment,
   concern, blog and article pages). A rounded photo card at the content width; a deep NDM-navy gradient over the left and the
   bottom carries the words, which sit left: tag, heading, line and the two actions. When it comes into view the card opens
   from the middle out to both sides and the words sharpen from a blur. Photo: the VISIA consultation room. */
const JR_CSS = `
.jr-card{clip-path:inset(0 50% 0 50% round 32px);transition:clip-path 1.2s cubic-bezier(.7,0,.2,1);box-shadow:0 40px 80px -50px rgba(11,15,19,.6)}
.jr-card.is-on{clip-path:inset(0 0 0 0 round 32px)}
.jr-card .jr-pic{transform:scale(1.12);transition:transform 2.2s cubic-bezier(.2,.7,.2,1)}
.jr-card.is-on .jr-pic{transform:scale(1)}
/* desktop: the photo fills the right two thirds and fades into the navy card, so the face sits right of the words; phones: face centred */
.jr-card{background:#0B1B29}
@media (min-width:768px){.jr-card .jr-pic{-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 34%);mask-image:linear-gradient(90deg,transparent 0,#000 34%)}}
.jr-shade{background:linear-gradient(90deg,rgba(9,22,34,.9) 0%,rgba(9,22,34,.72) 34%,rgba(9,22,34,.18) 66%,rgba(9,22,34,0) 100%),linear-gradient(0deg,rgba(10,52,84,.72) 0%,rgba(10,52,84,0) 55%)}
@media (max-width:767px){.jr-card{clip-path:inset(0 50% 0 50% round 24px)}.jr-card.is-on{clip-path:inset(0 0 0 0 round 24px)}
  .jr-shade{background:linear-gradient(0deg,rgba(9,22,34,.94) 0%,rgba(9,22,34,.8) 42%,rgba(9,22,34,.1) 78%,rgba(9,22,34,0) 100%)}}
.jr-card .jr-t{opacity:0;filter:blur(14px);transform:translateY(12px);transition:opacity .9s ease,filter 1.1s ease,transform 1.1s cubic-bezier(.2,.7,.2,1)}
.jr-card.is-on .jr-t{opacity:1;filter:blur(0);transform:none}
@media (prefers-reduced-motion:reduce){.jr-card,.jr-card .jr-pic,.jr-card .jr-t{clip-path:none;transform:none;filter:none;opacity:1;transition:none}}
`;
function ProcAnalysis() {
  const card = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = card.current; if (!el) return;
    /* the card is clipped to nothing until it opens, so watch its section */
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.2 });
    if (el.getBoundingClientRect().top < window.innerHeight * 0.8) setOn(true);
    io.observe(el.parentElement);
    return () => io.disconnect();
  }, []);
  /* a second trigger from the scroll position, in case the browser delays the visibility check */
  useOnScroll(() => {
    const el = card.current; if (!el || el.classList.contains('is-on')) return;
    if (el.parentElement.getBoundingClientRect().top < window.innerHeight * 0.85) setOn(true);
  }, []);
  const t = (k) => ({ transitionDelay: `${0.75 + k * 0.12}s` });
  return (
    <section aria-labelledby="analysis-title" className="relative z-10 px-[var(--gx)] py-[clamp(40px,5vw,72px)]">
      <style>{JR_CSS}</style>
      <div ref={card} className={`jr-card mx-auto w-full max-w-[1180px] relative isolate flex min-h-[600px] flex-col justify-end md:min-h-[clamp(460px,40vw,520px)] overflow-hidden rounded-[24px] p-6 text-white md:justify-center md:rounded-[32px] md:p-[56px] ${on ? 'is-on' : ''}`}>
        <img src="assets/home/visia-consult.jpg" alt="" loading="lazy" decoding="async" className="jr-pic absolute inset-0 -z-20 h-full w-full object-cover object-[80%_30%] md:left-auto md:w-[66%] md:object-[62%_45%]" />
        <span aria-hidden="true" className="jr-shade absolute inset-0 -z-10" />
        <div className="max-w-[620px]">
          <div className="jr-t" style={t(0)}><Eyebrow dark>Start your journey</Eyebrow></div>
          <TwoTone id="analysis-title" dark className="jr-t mt-5" size="text-[clamp(32px,3.4vw,48px)]" lead={<>Start with a free<br /></>} strong="skin analysis" style={t(1)} />
          <p className="jr-t mt-4 max-w-[46ch] font-inter text-[15.5px] leading-[1.65] text-white/80" style={t(2)}>Your first consultation and VISIA® skin analysis are free, at Uptown or Downtown. No pressure, just a clear plan.</p>
          <div className="jr-t mt-7 flex flex-wrap items-center gap-x-5 gap-y-3" style={t(3)}>
            <Btn href="#/book" v="book" hot>Book Free Consultation</Btn>
            <Btn href="about.html#contact" v="light">Find a clinic</Btn>
          </div>
        </div>
      </div>
    </section>
  );
}
