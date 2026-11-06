# Home page, round 5 (2026-11-06): the hero's four proof points move to the right (a small glass card on wide screens),
# so the left side reads calmer. Already applied, do not run again.
p = 'index.html'
s = open(p, encoding='utf-8').read()
def rep(a, b):
    global s
    assert s.count(a) == 1, (a[:80], s.count(a)); s = s.replace(a, b)
rep('<div ref={inner} className="hf-in px-[var(--gx)] pt-[118px] pb-[76px] md:pt-[clamp(150px,24vh,240px)] md:pb-[clamp(30px,5.5vh,60px)]">\n        {c ?',
    '<div ref={inner} className="hf-in px-[var(--gx)] pt-[118px] pb-[76px] md:grid md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-x-12 md:pt-[clamp(150px,24vh,240px)] md:pb-[clamp(30px,5.5vh,60px)]">\n        <div>\n        {c ?')
rep('''          <Btn href="#start" v="glass">Find your treatment</Btn>
        </div>
        <ul className="mt-6 grid max-w-[calc(100%-8px)] grid-cols-2 gap-x-4 gap-y-2.5 font-inter text-[13px] font-medium leading-[1.35] text-white/85 sm:mt-7 sm:flex sm:flex-wrap sm:gap-x-7 sm:text-[14px]" aria-label="Why clients choose NewDermaMed">''',
    '''          <Btn href="#start" v="glass">Find your treatment</Btn>
        </div>
        </div>
        <ul className="mt-6 grid max-w-[calc(100%-8px)] grid-cols-2 gap-x-4 gap-y-2.5 font-inter text-[13px] font-medium leading-[1.35] text-white/85 sm:mt-7 sm:text-[14px] md:mt-0 md:max-w-none md:grid-cols-1 md:gap-y-3.5 md:rounded-[20px] md:border md:border-white/15 md:bg-white/[.08] md:px-6 md:py-5 md:backdrop-blur-[12px]" aria-label="Why clients choose NewDermaMed">''')
rep('<li key={t} className="flex items-start gap-2 sm:items-center sm:gap-2.5">', '<li key={t} className="flex items-start gap-2 sm:items-center sm:gap-2.5 md:whitespace-nowrap">')
open(p, 'w', encoding='utf-8').write(s); print(p, 'ok')

# section joins: the peach glows move to a layer that fades out at each section's top and bottom, so no glow is ever cut by an
# edge (that cut was the line above Questions & answers); every light section on the home page sits on the same paper colour
GLOW = '''
  /* light sections: one paper colour; soft peach glows on a layer that fades at the top and bottom edges, so the joins never show */
  main>section[aria-labelledby="start-title"],main>section[aria-labelledby="aptos"],main>section[aria-labelledby="team"],main>section[aria-labelledby="results"],main>section[aria-labelledby="testimonials"],main>section[aria-labelledby="process"],main>section[aria-labelledby="visit"],main>section[aria-labelledby="faq"],main>section[aria-labelledby="book"]{background-color:#FAFAF8!important;background-image:none!important;isolation:isolate}
  main>section[aria-labelledby="start-title"]::before,main>section[aria-labelledby="aptos"]::before,main>section[aria-labelledby="team"]::before,main>section[aria-labelledby="results"]::before,main>section[aria-labelledby="testimonials"]::before,main>section[aria-labelledby="visit"]::before,main>section[aria-labelledby="faq"]::before,main>section[aria-labelledby="book"]::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;-webkit-mask:linear-gradient(180deg,transparent 0,#000 22%,#000 78%,transparent 100%);mask:linear-gradient(180deg,transparent 0,#000 22%,#000 78%,transparent 100%)}
  main>section[aria-labelledby="start-title"]::before{background:radial-gradient(38% 46% at 4% 60%,rgba(255,196,166,.22),transparent 70%)}
  main>section[aria-labelledby="aptos"]::before{background:radial-gradient(40% 48% at 96% 45%,rgba(255,190,160,.22),transparent 70%)}
  main>section[aria-labelledby="team"]::before{background:radial-gradient(42% 60% at 94% 40%,rgba(255,190,160,.26),transparent 70%),radial-gradient(36% 55% at 4% 70%,rgba(255,206,182,.2),transparent 70%)}
  main>section[aria-labelledby="results"]::before{background:radial-gradient(40% 46% at 3% 35%,rgba(255,206,182,.22),transparent 70%)}
  main>section[aria-labelledby="testimonials"]::before{background:radial-gradient(40% 50% at 96% 50%,rgba(255,190,160,.2),transparent 70%)}
  main>section[aria-labelledby="visit"]::before{background:radial-gradient(42% 50% at 95% 70%,rgba(255,190,160,.22),transparent 70%)}
  main>section[aria-labelledby="faq"]::before{background:radial-gradient(42% 52% at 94% 35%,rgba(255,190,160,.24),transparent 70%),radial-gradient(36% 46% at 4% 72%,rgba(255,206,182,.2),transparent 70%)}
  main>section[aria-labelledby="book"]::before{background:radial-gradient(40% 46% at 4% 40%,rgba(255,206,182,.22),transparent 70%)}
'''
s = open(p, encoding='utf-8').read()
a = '  .marquee-mask{'
assert s.count(a) == 1
s = s.replace(a, GLOW + a)
open(p, 'w', encoding='utf-8').write(s); print('glow ok')
