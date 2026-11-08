/* ---------------------------------------------------------------- blog data: every post on the NDM blog, newest first.
   Titles, dates, images and links are NDM's; summaries are rewritten short, in qualified language; topics regroup NDM's categories for filtering. */
const POST_IMG = 'assets/live/main/uploads/';
/* posts that already have their own page here; the rest open on NDM's current site */
const BLOG_LOCAL = {"/what-causes-rosacea-redness/": "what-causes-rosacea-redness.html", "/your-complete-guide-to-laser-hair-removal/": "your-complete-guide-to-laser-hair-removal.html", "/best-way-to-treat-rosacea/": "best-way-to-treat-rosacea.html", "/how-to-get-rid-of-acne-scars/": "how-to-get-rid-of-acne-scars.html", "/what-is-prp-therapy/": "what-is-prp-therapy.html", "/what-is-microdermabrasion/": "what-is-microdermabrasion.html", "/what-is-laser-hair-removal-and-how-does-it-work/": "what-is-laser-hair-removal-and-how-does-it-work.html", "/juvederm-at-newdermamed-toronto/": "juvederm-at-newdermamed-toronto.html", "/how-do-you-get-rid-of-hyperpigmentation/": "how-do-you-get-rid-of-hyperpigmentation.html", "/chemical-peel-treatment-toronto/": "chemical-peel-treatment-toronto.html", "/newdermamed-toronto-offers-botox-treatments/": "newdermamed-toronto-offers-botox-treatments.html", "/what-is-botox-and-how-does-newdermamed-use-it/": "what-is-botox-and-how-does-newdermamed-use-it.html", "/aptos-excellence-visage-thread-lift-is-available-at-newdermamed-in-toronto/": "aptos-excellence-visage-thread-lift-is-available-at-newdermamed-in-toronto.html", "/how-to-prepare-for-sclerotherapy-before-and-after-care/": "how-to-prepare-for-sclerotherapy-before-and-after-care.html", "/what-you-should-know-about-compression-stockings-and-varicose-veins/": "what-you-should-know-about-compression-stockings-and-varicose-veins.html", "/do-varicose-veins-hurt/": "do-varicose-veins-hurt.html", "/can-you-tattoo-over-varicose-veins/": "can-you-tattoo-over-varicose-veins.html", "/things-to-keep-in-mind-when-considering-juvederm/": "things-to-keep-in-mind-when-considering-juvederm.html", "/tips-on-reducing-bruising-and-swelling-after-lip-filler/": "tips-on-reducing-bruising-and-swelling-after-lip-filler.html", "/how-long-do-under-eye-fillers-last/": "how-long-do-under-eye-fillers-last.html", "/how-to-prepare-for-dermal-fillers/": "how-to-prepare-for-dermal-fillers.html", "/whats-the-difference-between-3d-lipo-and-coolsculpting/": "whats-the-difference-between-3d-lipo-and-coolsculpting.html", "/whats-the-difference-between-coolsculpting-and-ultrasonic-cavitation/": "whats-the-difference-between-coolsculpting-and-ultrasonic-cavitation.html", "/whats-the-difference-between-coolsculpting-and-sculpsure/": "whats-the-difference-between-coolsculpting-and-sculpsure.html", "/whats-the-difference-between-liposuction-and-coolsculpting/": "whats-the-difference-between-liposuction-and-coolsculpting.html", "/pregnancy-and-varicose-veins/": "pregnancy-and-varicose-veins.html", "/how-to-hide-bulging-varicose-veins/": "how-to-hide-bulging-varicose-veins.html", "/are-varicose-veins-dangerous/": "are-varicose-veins-dangerous.html", "/is-cosmetic-surgery-the-same-as-plastic-surgery/": "is-cosmetic-surgery-the-same-as-plastic-surgery.html", "/how-to-get-rid-of-spider-veins-and-varicose-veins/": "how-to-get-rid-of-spider-veins-and-varicose-veins.html", "/does-insurance-cover-cosmetic-surgery/": "does-insurance-cover-cosmetic-surgery.html", "/chemical-peels/": "chemical-peels-article.html", "/juvederm-vycross-technology/": "juvederm-vycross-technology.html", "/pineapple-cucumber-apple-smoothie-for-healthy-skin/": "pineapple-cucumber-apple-smoothie-for-healthy-skin.html"};
const newTab = (p) => (p.ext ? { target: '_blank', rel: 'noopener' } : {});
const BLOG_TOPICS = ['All', 'Skin', 'Laser', 'Injectables', 'Thread lift', 'Body', 'Veins', 'Guides'];
const BLOG_POSTS = [
  ['What Causes Rosacea Redness', '/what-causes-rosacea-redness/', 'November 26, 2025', 1962, 'Skin', '2025/11/1-What-Causes-Rosacea-Redness-m.webp', 'You’re not the only one who has noticed that your face is always red, flushed, or has tiny visible blood vessels and wondered what could be causing it. Rosacea is a condition that often causes …'],
  ['Your Complete Guide to Laser Hair Removal', '/your-complete-guide-to-laser-hair-removal/', 'November 24, 2025', 1062, 'Laser', '2025/11/2-Your-Complete-Guide-to-Laser-Hair-Removal-m.webp', 'You’re in the right place if you’ve been thinking about never having hair again. In this blog post, we’ll go into great detail about laser hair removal , including how it works, how much it costs …'],
  ['Best Way to Treat Rosacea', '/best-way-to-treat-rosacea/', 'November 22, 2025', 1065, 'Skin', '2025/11/3-Best-Way-to-Treat-Rosacea-m.webp', 'Rosacea affects more than just how you look it also affects how you feel how confident you are and how your skin acts every day. NewDermaMed believes that the best way to treat rosacea is with a full …'],
  ['How to Get Rid of Acne Scars?', '/how-to-get-rid-of-acne-scars/', 'November 20, 2025', 1128, 'Skin', '2025/11/4-How-to-Get-Rid-of-Acne-Scars-m.webp', 'Acne scars affect how you feel and how your skin reflects you, not just how you look. We know how annoying it can be to have a texture, indentation, or discoloration that won’t go away at …'],
  ['What is PRP therapy and how does it help with skin rejuvenation or hair loss', '/what-is-prp-therapy/', 'November 17, 2025', 1365, 'Skin', '2025/11/5-What-is-PRP-therapy-and-how-does-it-help-with-skin-rejuvenation-or-hair-loss-m.webp', 'There are always new treatments in dermatology and aesthetic medicine that use the body’s own healing power in amazing ways. A lot of people are talking about Platelet-Rich Plasma Therapy, or PRP …'],
  ['What is Microdermabrasion?', '/what-is-microdermabrasion/', 'November 15, 2025', 1166, 'Skin', '2025/11/6-What-is-Microdermabrasion-m.webp', 'You are in the right place if you want to make your skin look better, feel better, and glow from the inside out. At NewDermaMed, we love helping you learn everything you need to know about advanced …'],
  ['What Is Laser Hair Removal And How Does It Work?', '/what-is-laser-hair-removal-and-how-does-it-work/', 'November 13, 2025', 1737, 'Laser', '2025/11/7-What-Is-Laser-Hair-Removal-And-How-Does-It-Work-m.webp', 'If you’ve ever wondered if you could skip shaving, waxing, or all those painful plucks and have smoother skin instead, you’re in the right place. People ask us a lot at NewDermaMed, “What is laser …'],
  ['Juvederm at NewDermaMed Toronto', '/juvederm-at-newdermamed-toronto/', 'November 11, 2025', 1588, 'Injectables', '2025/11/8-Juvederm-at-NewDermaMed-Toronto-m.webp', 'Surgery is no longer the only way to make your face look younger. Juvederm and other treatments can help you look younger by enhancing your features, smoothing out fine lines, and adding volume to …'],
  ['How Do You Get Rid of Hyperpigmentation', '/how-do-you-get-rid-of-hyperpigmentation/', 'November 9, 2025', 1994, 'Skin', '2025/11/9-How-Do-You-Get-Rid-of-Hyperpigmentation-m.webp', 'You’re not alone if you’ve seen dark spots uneven patches or areas of discoloration that don’t seem to go away no matter what you do. At NewDermaMed hyperpigmentation is one of the most common skin …'],
  ['Chemical Peel Treatment Toronto', '/chemical-peel-treatment-toronto/', 'November 7, 2025', 1530, 'Skin', '2025/11/10-Chemical-Peel-Treatment-Toronto-m.webp', 'In the lively city of Toronto, where beauty and medical precision meet, a lot of people are getting advanced skincare treatments that give them amazing results with very little downtime. Chemical …'],
  ['NewDermaMed Toronto Offers Botox Treatments', '/newdermamed-toronto-offers-botox-treatments/', 'November 5, 2025', 1356, 'Injectables', '2025/11/11-NewDermaMed-Toronto-Offers-Botox-Treatments-m.webp', 'It’s great to age gracefully, but occasionally small lines and wrinkles can make us look older or more fatigued than we are. Botox is what you need. You may look younger, more confident, and more …'],
  ['What Is Botox? And How Does NewDermaMed Use It?', '/what-is-botox-and-how-does-newdermamed-use-it/', 'November 3, 2025', 1772, 'Injectables', '2025/11/12-What-Is-Botox-And-How-Does-NewDermaMed-Use-It-m.webp', 'One of the most common questions we get from clients at NewDermaMed is what is Botox and how does it work. When people hear the word Botox they often think of skin that is smoother and has fewer …'],
  ['Aptos Excellence Visage Thread Lift is available at NewDermaMed in Toronto', '/aptos-excellence-visage-thread-lift-is-available-at-newdermamed-in-toronto/', 'November 1, 2025', 1707, 'Thread lift', '2025/11/13-Aptos-Excellence-Visage-Thread-Lift-is-available-m.webp', 'Many people want to change their look in a way that doesn’t feel too drastic. That is easier to do than ever thanks to today’s advanced cosmetic technology. For people who want a subtle, graceful way …'],
  ['How to Prepare for Sclerotherapy – Before and After Care', '/how-to-prepare-for-sclerotherapy-before-and-after-care/', 'October 26, 2021', 551, 'Veins', '2025/11/14-How-to-Prepare-for-Sclerotherapy-m.webp', 'At NewDermaMed, we have helped countless patients regain their confidence, enhance their natural beauty, and feel better about their appearance through the removal of varicose veins and spider veins. …'],
  ['What You Should Know About Compression Stockings and Varicose Veins', '/what-you-should-know-about-compression-stockings-and-varicose-veins/', 'October 26, 2021', 599, 'Veins', '2025/11/15-What-You-Should-Know-About-Compression-Stockings-m.webp', 'Compression stockings sometimes referred to as flight socks, are often recommended to be worn for anyone who spends a long amount of time on their feet or for those who suffer from varicose veins and …'],
  ['Do Varicose Veins Hurt?', '/do-varicose-veins-hurt/', 'August 26, 2021', 914, 'Veins', '2025/11/16-Do-Varicose-Veins-Hurt-m.webp', 'If you have noticed the appearance of varicose veins on yourself or someone you love, you may be wondering, can varicose veins cause leg pain? Varicose veins are often highly visible and depending on …'],
  ['Can You Tattoo Over Varicose Veins?', '/can-you-tattoo-over-varicose-veins/', 'August 26, 2021', 859, 'Veins', '2025/11/17-Can-You-Tattoo-Over-Varicose-Veins-m.webp', 'Do you have varicose veins on your legs that you are looking to cover-up? For some people, varicose veins are highly visible and may cause feelings of discontentment with the way they look. It is …'],
  ['Things to Keep in Mind When Considering Juvéderm', '/things-to-keep-in-mind-when-considering-juvederm/', 'April 29, 2021', 1015, 'Injectables', '2025/11/18-Things-to-Keep-in-Mind-m.webp', 'If you have been considering getting facial fillers, you have likely heard of Juvéderm. A popular choice and the number one doctor recommended facial filler it makes a great option for anyone looking …'],
  ['Tips on Reducing Bruising and Swelling After Lip Filler', '/tips-on-reducing-bruising-and-swelling-after-lip-filler/', 'February 24, 2021', 1050, 'Injectables', '2025/11/19-Tips-on-Reducing-Bruising-and-Swelling-m.webp', 'When you want to look and feel your most beautiful you may be considering procedures such as fillers or Botox treatments . Lip fillers have become a popular procedure and are a great option for those …'],
  ['How Long Do Under Eye Fillers Last?', '/how-long-do-under-eye-fillers-last/', 'October 21, 2020', 551, 'Injectables', '2025/11/20-How-Long-Do-Under-Eye-Fillers-Last-m.webp', 'Under-eye fillers or tear-through fillers are a popular choice for those wishing to reduce the appearance of tired-looking undereye and reduce dark shadows around the undereye. If you have been …'],
  ['How to Prepare for Dermal Fillers', '/how-to-prepare-for-dermal-fillers/', 'October 21, 2020', 555, 'Injectables', '2025/11/21-How-to-Prepare-for-Dermal-Fillers-m.webp', 'Dermal fillers are a great choice for anyone who is looking to feel as good about their outside appearance as they do about their inside. For those who feel that laugh lines and bags under their eyes …'],
  ['What’s the Difference Between 3D Lipo and CoolSculpting', '/whats-the-difference-between-3d-lipo-and-coolsculpting/', 'August 26, 2020', 938, 'Body', '2020/08/22-Whats-the-Difference-Between-3D-Lipo-and-CoolSculpting-m.webp', 'Are you considering a fat reduction procedure to help you eliminate the unwanted fat on your body? If so, you have likely come across a variety of options including CoolSculpting and 3D Lipo. Both …'],
  ['What’s the Difference Between CoolSculpting and Ultrasonic Cavitation', '/whats-the-difference-between-coolsculpting-and-ultrasonic-cavitation/', 'August 26, 2020', 929, 'Body', '2020/08/23-Whats-the-Difference-Between-CoolSculpting-and-Ultrasonic-Cavitation-m.webp', 'If you have been considering a fat reduction procedure to help with removing unwanted fat, you’ve likely come across many different options. CoolSculpting and Ultrasonic Cavitation are two popular …'],
  ['What’s the Difference Between CoolSculpting and SculpSure', '/whats-the-difference-between-coolsculpting-and-sculpsure/', 'November 27, 2019', 1046, 'Body', '2020/08/24-Whats-the-Difference-Between-CoolSculpting-and-SculpSure-m.webp', 'Have been considering a fat reduction procedure to help rid yourself of unwanted fat? If so, you’ve likely come across both CoolSculpting and SculpSure as possible procedures. Though both provide the …'],
  ['What’s The Difference Between Liposuction and CoolSculpting', '/whats-the-difference-between-liposuction-and-coolsculpting/', 'November 27, 2019', 1017, 'Body', '2019/11/Whats-The-Difference-Between-Liposuction-and-CoolSculpting.jpg', 'Are you considering a fat reduction procedure to target you stubborn unwanted body fat? While researching options you’ve likely come across both Liposuction and CoolSculpting as possible options. But …'],
  ['Pregnancy and Varicose Veins', '/pregnancy-and-varicose-veins/', 'November 19, 2019', 800, 'Veins', '2020/08/25-Pregnancy-and-Varicose-Veins-m.webp', 'Are you expecting? Congratulations! Pregnancy is one of the most exciting times in your life. Though as you await the arrival of your bundle of joy you may be experiencing some less than joyful …'],
  ['How to Hide Bulging Varicose Veins', '/how-to-hide-bulging-varicose-veins/', 'November 19, 2019', 821, 'Veins', '2020/08/26-How-to-Hide-Bulging-Varicose-Veins-m.webp', 'If you suffer from varicose veins you are no doubt familiar with the highly visible bulging veins that can come along with the condition. Though some people are not bothered by the appearance of …'],
  ['Are Varicose Veins Dangerous?', '/are-varicose-veins-dangerous/', 'November 3, 2019', 1040, 'Veins', '2020/08/27-Are-Varicose-Veins-Dangerous-m.webp', 'Varicose veins can be unsightly and sometimes painful. But are varicose veins dangerous? In most cases they are not. But for some people, varicose veins can have a variety of negative side effects …'],
  ['Is Cosmetic Surgery the Same as Plastic Surgery?', '/is-cosmetic-surgery-the-same-as-plastic-surgery/', 'November 3, 2019', 1055, 'Guides', '2020/08/28-Is-Cosmetic-Surgery-the-Same-as-Plastic-Surgery-m.webp', 'We are often asked by our clients, is cosmetic surgery the same as plastic surgery? Though the term plastic surgery is often used interchangeably with cosmetic surgery the nature of the two surgeries …'],
  ['How To Get Rid of Spider Veins and Varicose Veins', '/how-to-get-rid-of-spider-veins-and-varicose-veins/', 'September 25, 2019', 1295, 'Veins', '2020/08/29-How-To-Get-Rid-of-Spider-Veins-and-Varicose-Veins-m.webp', 'If you have visible veins on your body, you may have felt the desire to get rid of them. Many people feel that the veins they see on their legs or other parts of their body are unsightly and believe …'],
  ['Does Insurance Cover Cosmetic Surgery?', '/does-insurance-cover-cosmetic-surgery/', 'July 17, 2019', 1043, 'Guides', '2020/08/30-Does-Insurance-Cover-Cosmetic-Surgery-m.webp', 'There is no denying that cosmetic surgery can come with a hefty price tag. There are a variety of reasons why someone may wish to have cosmetic surgery performed. But for some it is not always …'],
  ['Chemical Peels', '/chemical-peels/', 'June 30, 2015', 774, 'Skin', '2020/08/31-CHEMICAL-PEELS-m.webp', 'I took care of my skin for as long as I can remember. I wore sunscreen. Used high quality products. Ate pretty decently and drank pretty sparingly. But even with all this care-taking, I still have …'],
  ['Juvéderm Vycross Technology', '/juvederm-vycross-technology/', 'June 22, 2015', 587, 'Injectables', '2020/08/32-JUVEDERM-VYCROSS-TECHNOLOGY-m.webp', 'Allergan dermal fillers have become increasingly popular over the past 10 years to help rejuvenate and revitalize aged, saggy, hollowed and tired skin. Those who have tried Allergan’s older …'],
  ['Pineapple, Cucumber & Apple Smoothie for Healthy Skin!', '/pineapple-cucumber-apple-smoothie-for-healthy-skin/', 'October 23, 2013', 355, 'Skin', '2020/08/33-Pineapple-Cucumber-Apple-Smoothie-for-Healthy-Skin-m.webp', 'This recipe is simple, delicious, nutritious and packed with skin benefits, especially those acne-prone skin! Pineapples, Cucumbers and Apples work together to calm inflammation, which is beneficial …'],
].map(([t, u, d, w, topic, img, ex]) => ({ t, slug: u, url: BLOG_LOCAL[u] || NDM + u, ext: !BLOG_LOCAL[u], d, min: Math.max(2, Math.round(w / 220)), topic, img: POST_IMG + img, ex }));
const BLOG_STEP = 9;

/* ---------------------------------------------------------------- motion helpers */
/* words rise out of a blur one after another once the heading reveals (Orléva journal headings), in the TwoTone type */
function BlurWords({ text, className = '', start = 0 }) {
  return text.split(' ').map((w, i) => (
    <Fragment key={i}><span className={`bw ${className}`} style={{ '--d': `${start + i * 0.06}s` }}>{w}</span>{' '}</Fragment>
  ));
}
function BlurTitle({ as: Tag = 'h2', id, lead, strong, dark, size = 'text-[clamp(36px,4.2vw,62px)]', className = '' }) {
  const n = lead.split(' ').length;
  return (
    <Tag id={id} className={`rv bw-wrap font-aeonik font-normal leading-[1.08] tracking-[-0.035em] ${dark ? 'text-white' : 'text-ndm-ink'} ${size} ${className}`}>
      <BlurWords text={lead} /><br /><BlurWords text={strong} start={n * 0.06} className={`tt-strong ${dark ? 'text-ndm-sky' : 'text-ndm-deep'}`} />
    </Tag>
  );
}
/* like useReveal, but also picks up cards added later (filters, load more) */
function useRevealLive(ref, dep) {
  useEffect(() => {
    const root = ref.current; if (!root) return;
    const els = root.querySelectorAll('.rv:not(.in)');
    if (REDUCED || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [dep]);
}
/* same meta line as the home page journal: topic · read time */
const StoryMeta = ({ p }) => (
  <span className="flex items-center gap-2.5 font-inter text-[14px] text-ndm-muted">
    {p.topic}<i className="size-1 rounded-full bg-ndm-muted/70" />{p.min} min read
  </span>
);

/* ---------------------------------------------------------------- hero: light, type-led, centred title with soft rings top right */
function BlogHero() {
  const ref = useRef(null), rings = useRef(null);
  useReveal(ref);
  useOnScroll(() => {
    const el = rings.current; if (!el || REDUCED) return;
    el.style.transform = `translate3d(0,${(Math.min(window.scrollY, 700) * 0.25).toFixed(1)}px,0)`;
  }, []);
  return (
    <section ref={ref} aria-labelledby="blog-title" className="relative isolate overflow-hidden bg-ndm-paper px-[var(--gx)] pb-[clamp(8px,2vw,24px)] pt-[clamp(176px,15vw,230px)]">
      <div ref={rings} aria-hidden="true" className="pointer-events-none absolute -right-[clamp(150px,13vw,220px)] -top-[clamp(10px,3vw,60px)] -z-10 size-[clamp(360px,40vw,620px)]">
        {[1, 0.8, 0.62, 0.45, 0.3].map((s, i) => (
          <span key={s} className="blog-ring absolute inset-0 m-auto rounded-full border border-ndm-blue/20" style={{ width: `${s * 100}%`, height: `${s * 100}%`, '--i': i }} />
        ))}
        <span className="blog-dot absolute inset-0 m-auto size-[5%] rounded-full bg-ndm-blue/45" />
      </div>
      <div className="mx-auto max-w-[1240px] text-center">
        <Eyebrow className="rv">The NewDermaMed Journal</Eyebrow>
        <BlurTitle as="h1" id="blog-title" size="text-[clamp(44px,6.6vw,108px)]" className="mt-6" lead="Skin care tips and" strong="honest treatment guides." />
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- featured story: one wide card, photo left */
function FeaturedStory({ p }) {
  const ref = useRef(null), pic = useRef(null);
  useReveal(ref);
  useOnScroll(() => {
    const el = ref.current, img = pic.current; if (!el || !img || REDUCED) return;
    const r = el.getBoundingClientRect(), vh = window.innerHeight;
    img.style.transform = `translate3d(0,${((clamp01((vh - r.top) / (vh + r.height)) - 0.5) * -40).toFixed(1)}px,0) scale(1.12)`;
  }, []);
  return (
    <section ref={ref} aria-labelledby="featured-title" className="relative z-10 bg-ndm-paper px-[var(--gx)] pt-[clamp(64px,7vw,110px)]">
      <article className="rv lead-card group mx-auto grid max-w-[1320px] gap-6 rounded-[22px] p-3 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:items-center md:gap-[clamp(24px,4vw,64px)] md:p-3.5">
        <a href={p.url} {...newTab(p)} tabIndex={-1} aria-hidden="true" className="rv rv-clip relative block aspect-[4/3] overflow-hidden rounded-[16px] bg-ndm-line md:aspect-[5/4]">
          <img ref={pic} src={p.img} alt="" decoding="async" className="h-full w-full object-cover will-change-transform" style={{ transform: 'scale(1.12)' }} />
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 font-inter text-[12px] text-ndm-ink backdrop-blur-[6px]">Latest article</span>
        </a>
        <div className="px-3 pb-5 md:px-0 md:pb-0 md:pr-[clamp(8px,3vw,48px)]">
          <StoryMeta p={p} />
          <h2 id="featured-title" className="mt-4 font-aeonik text-[clamp(32px,3.6vw,56px)] font-normal leading-[1.05] tracking-[-0.03em] text-ndm-ink">{p.t}</h2>
          <p className="mt-5 max-w-[46ch] font-inter text-[16px] leading-[1.6] text-ndm-muted">{p.ex}</p>
          <p className="mt-2 font-inter text-[13.5px] text-ndm-muted">{p.d}</p>
          <Btn href={p.url} {...newTab(p)} v="ink" className="btn-buy mt-8">Read article{p.ext && <span className="sr-only"> (opens in a new tab)</span>}</Btn>
        </div>
      </article>
    </section>
  );
}

/* ---------------------------------------------------------------- latest stories: topic filters, three-up grid, load more */
function StoryCard({ p, i }) {
  const hid = `story-${p.slug.replace(/[^a-z0-9]+/g, '-')}`;
  return (
    <li className="rv story-card" style={{ transitionDelay: `${(i % 3) * 0.08}s` }}>
      <article aria-labelledby={hid} className="story-box group relative flex h-full flex-col overflow-hidden rounded-[22px] p-3 pb-6">
        <a href={p.url} {...newTab(p)} tabIndex={-1} aria-hidden="true" className="relative block aspect-[16/10] overflow-hidden rounded-[16px] bg-ndm-mist">
          <img src={p.img} alt="" loading="lazy" decoding="async" className="story-img absolute inset-0 h-full w-full object-cover" />
        </a>
        <div className="relative mt-5 flex items-center justify-between gap-2 px-3">
          <span className="promo-tag truncate rounded-full px-3 py-1.5 font-mont text-[10.5px] uppercase tracking-[.12em]">{p.topic}</span>
          <span className="shrink-0 font-inter text-[13px] text-ndm-muted">{p.min} min read</span>
        </div>
        <h3 id={hid} className="relative mt-4 px-3 font-aeonik text-[clamp(21px,1.7vw,25px)] font-normal leading-[1.15] tracking-[-0.02em] text-ndm-ink">
          <a href={p.url} {...newTab(p)} className="transition-colors hover:text-ndm-deep">{p.t}</a>
        </h3>
        <p className="relative mt-2 line-clamp-3 px-3 font-inter text-[15px] leading-[1.55] text-ndm-muted">{p.ex}</p>
        <div className="relative mt-auto flex items-center justify-between gap-3 px-3 pt-6">
          <time className="whitespace-nowrap font-inter text-[13px] text-ndm-muted">{p.d.replace(/^([A-Z][a-z]{2})[a-z]+/, '$1')}</time>
          <Btn href={p.url} {...newTab(p)} v="ink" sm className="btn-buy" aria-describedby={hid}>Read article{p.ext && <span className="sr-only"> (opens in a new tab)</span>}</Btn>
        </div>
      </article>
    </li>
  );
}

function LatestStories({ posts }) {
  const ref = useRef(null), grid = useRef(null);
  const [topic, setTopic] = useState('All');
  const [shown, setShown] = useState(BLOG_STEP);
  const list = topic === 'All' ? posts : posts.filter((p) => p.topic === topic);
  const view = list.slice(0, shown);
  useReveal(ref);
  useRevealLive(grid, `${topic}:${shown}`);
  const pick = (t) => { setTopic(t); setShown(BLOG_STEP); };
  return (
    <section ref={ref} id="stories" aria-labelledby="stories-title" className="relative z-10 scroll-mt-[100px] bg-ndm-paper px-[var(--gx)] py-[clamp(80px,9vw,128px)]">
      <div className="mx-auto max-w-[1320px]">
        <Eyebrow className="rv">Latest stories</Eyebrow>
        <BlurTitle id="stories-title" className="mt-5 max-w-[18ch]" lead="Ideas for healthier," strong="more confident skin." />
        <div className="rv no-scrollbar -mx-[var(--gx)] mt-9 flex gap-2 overflow-x-auto px-[var(--gx)] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0" role="group" aria-label="Filter by topic" style={{ transitionDelay: '.15s' }}>
          {BLOG_TOPICS.map((t) => {
            const n = t === 'All' ? posts.length : posts.filter((p) => p.topic === t).length;
            const on = t === topic;
            return (
              <button key={t} type="button" onClick={() => pick(t)} aria-pressed={on}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 font-inter text-[14px] transition-colors ${on ? 'bg-ndm-ink text-white' : 'bg-white text-ndm-ink ring-1 ring-ndm-ink/10 hover:ring-ndm-ink/30'}`}>
                {t}<span className={`text-[12px] tabular-nums ${on ? 'text-white/60' : 'text-ndm-muted'}`}>{n}</span>
              </button>
            );
          })}
        </div>
        <ul ref={grid} key={topic} className="mt-[clamp(36px,4vw,56px)] grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-live="polite">
          {view.map((p, i) => <StoryCard key={p.url} p={p} i={i} />)}
        </ul>
        {list.length > shown && (
          <div className="mt-[clamp(48px,5vw,72px)] flex flex-col items-center gap-3">
            <p className="font-inter text-[13.5px] text-ndm-muted">Showing {view.length} of {list.length} stories</p>
            <Btn v="line" onClick={() => setShown((s) => s + BLOG_STEP)}>Load more stories</Btn>
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- newsletter: mist band, centred, inline email form */
function BlogNewsletter() {
  const ref = useRef(null);
  useReveal(ref);
  const [sent, setSent] = useState(false);
  return (
    <section ref={ref} aria-labelledby="news-title" className="relative z-10 bg-ndm-mist px-[var(--gx)] py-[clamp(80px,9vw,128px)] text-center">
      <Eyebrow className="rv">Newsletter</Eyebrow>
      <BlurTitle id="news-title" className="mx-auto mt-5 max-w-[20ch]" lead="Skin notes from our team," strong="every now and then." />
      <p className="rv mx-auto mt-5 max-w-[48ch] font-inter text-[15.5px] leading-[1.6] text-ndm-muted" style={{ transitionDelay: '.2s' }}>
        Occasional skin care tips, new treatment guides and clinic news. No spam, and you can unsubscribe at any time.
      </p>
      {sent ? (
        <p role="status" className="mx-auto mt-9 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-inter text-[14.5px] text-ndm-ink ring-1 ring-ndm-ink/10">
          <IconCheckBadge className="text-ndm-deep" />Thank you, you are on the list.
        </p>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="rv mx-auto mt-9 flex max-w-[520px] flex-col gap-2.5 sm:flex-row" style={{ transitionDelay: '.26s' }}>
          <label className="min-w-0 flex-1">
            <span className="sr-only">Email address</span>
            <input required type="email" autoComplete="email" placeholder="Your email address" className={fieldCls} />
          </label>
          <Btn v="ink" type="submit">Subscribe</Btn>
        </form>
      )}
      <p className="mt-4 font-inter text-[12.5px] text-ndm-muted">By subscribing you agree to receive emails from NewDermaMed.</p>
    </section>
  );
}
