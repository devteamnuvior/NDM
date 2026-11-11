"""Design finish for the main look (Nov 2026): depth, legibility and phone polish. Wording, components and the colour
system stay as they are; the only layout touches are the phone home hero, two heading line breaks and the offer card in
the treatment hero.

One CSS block, between the "finish:start" and "finish:end" comments, goes at the end of the main <style> of both shells
(index.html and promotion.html, so every generated page gets it on the next rebuild):
- text: selection colour, balanced headings, tidier last lines in paragraphs; the FAQ heading and the closing heading
  now start their second colour on its own line (the house rule for two-tone headings);
- buttons: a soft gloss and a grounded shadow on the amber, blue and glass pills (white and outline pills untouched);
- headings on film (home hero, inner-page heroes, footer): a text shadow, and the second colour in a lighter tint of
  the brand sky (#7FD3F5) so it holds on bright frames;
- footer film: stronger overlays, so the closing heading reads on every frame, phones first;
- inner-page heroes (treatment, concern, Aptos): a phone overlay that is strongest behind the title and the text;
- phones: the two floating buttons (search, chat) share one size and one finish;
- treatment hero offer card (the glass card under the title): its arrow can no longer end up alone on a row of its own;
  on phones a card with a saving figure is always two tidy rows, and from 640px a saving that drops to a second row
  lines up with the title.
index.html also gets the home hero finish: a phone scrim measured in px from the bottom, a one-column proof list, the
brand band inside the first screen with a free slot for the floating buttons, a frosted proof card on wide screens.
Two small attributes in the Hero follow from it: the band no longer lifts the floating buttons, and on phones the chat
note waits until the hero is passed (the "1" badge still shows), so it never covers the headline or the buttons.
Everything is scoped to the main look (html:not([data-campaign]) in CSS, !CAMPAIGN_LOOK in JSX): campaign looks and
black-friday.html keep their own look and behaviour.
In the CSS below "@@" stands for html:not([data-campaign]) and "@~" for the same with no added weight (:where), used
where the page's own rules and utilities must keep winning.
Run from the project folder; safe to run twice (the block is replaced in place). Then rebuild the pages."""
import os, sys
ROOT = sys.argv[1] if len(sys.argv) > 1 else '.'
REACT = '<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" crossorigin></script>'
START, END = '/* finish:start', '/* finish:end */'

# both shells
SHARED = r'''
  @@ ::selection{background:#0F80C3;color:#fff}
  /* text-wrap-style, not the text-wrap shorthand: the shorthand would also switch wrapping back on inside one-line rows.
     Two-tone headings with no fixed line break (or with one that is hidden on phones) keep their natural wrap, so
     balancing never pulls the second colour off its own line. */
  @~ :is(h1,h2,h3){text-wrap-style:balance}
  @~ :is(h1,h2,h3):has(>.tt-strong):not(:has(>br:not(.hidden))){text-wrap-style:auto}
  @~ p{text-wrap-style:pretty}
  /* the two headings that had no line break before the second colour (house rule: it starts its own line): the FAQ
     heading everywhere, the closing heading up to the width where its first sentence still fits on one line */
  @~ #faq>.tt-strong{display:block}
  @@ footer>[data-nav="dark"] h2{text-wrap-style:balance}
  @media (max-width:1099px){
    @@ footer>[data-nav="dark"] h2>.tt-strong{display:block}
  }
  /* buttons: outer shadows first, inset highlights last (hover lists stay shorter and fade cleanly) */
  @~ .btn-book:where(:not(.btn-hot):not(.btn-on-dark)){box-shadow:0 12px 28px -16px rgba(15,128,195,.65),inset 0 1px 0 rgba(255,255,255,.22)}
  @~ .btn-hot:where(:not(.btn-on-dark)){background-image:linear-gradient(180deg,#FFAE2B 0%,#FFA617 55%,#FA9E10 100%);box-shadow:0 14px 30px -12px rgba(255,166,23,.8),0 3px 8px -2px rgba(176,104,0,.35),inset 0 1px 0 rgba(255,255,255,.35),inset 0 -1px 0 rgba(160,90,0,.18)}
  @~ .btn-ink{box-shadow:0 10px 22px -14px rgba(15,128,195,.75),inset 0 1px 0 rgba(255,255,255,.18)}
  @~ .btn-glass{box-shadow:inset 0 1px 0 rgba(255,255,255,.28);-webkit-backdrop-filter:blur(14px) saturate(140%);backdrop-filter:blur(14px) saturate(140%)}
  @@ .hdr-bar a.bg-ndm-amber{background-image:linear-gradient(180deg,#FFAE2B,#FFA617 55%,#FA9E10);box-shadow:0 10px 22px -12px rgba(255,166,23,.9),inset 0 1px 0 rgba(255,255,255,.35)}
  @@ .hdr-bar a.bg-ndm-amber:hover{background-image:none}
  /* footer film: the two overlays (inline styles, hence !important) and the words on top */
  @@ footer>[data-nav="dark"]>video+div{background:linear-gradient(90deg,rgba(18,14,11,.68) 0%,rgba(18,14,11,.4) 45%,rgba(18,14,11,.08) 80%)!important}
  @@ footer>[data-nav="dark"]>video+div+div{background:linear-gradient(180deg,rgba(10,10,10,.18) 0%,rgba(10,10,10,.05) 35%,rgba(10,10,10,.45) 100%)!important}
  @@ footer>[data-nav="dark"] h2{text-shadow:0 1px 2px rgba(4,8,12,.4),0 10px 30px rgba(4,8,12,.45)}
  @@ footer>[data-nav="dark"] h2 .tt-strong{color:#7FD3F5}
  @@ footer>[data-nav="dark"] h2+p{text-shadow:0 1px 2px rgba(4,8,12,.45),0 2px 16px rgba(4,8,12,.5)}
  /* inner-page heroes (treatment, concern, Aptos): the phone overlay is strongest behind the title and the text */
  @@ section[aria-labelledby="proc-title"]>.lg\:hidden{background:linear-gradient(180deg,rgba(11,15,19,.6) 0%,rgba(11,15,19,.42) 22%,rgba(11,15,19,.58) 45%,rgba(11,15,19,.74) 70%,rgba(11,15,19,.9) 100%)!important}
  @@ [data-nav="dark"] #proc-title{text-shadow:0 2px 4px rgba(4,8,12,.3),0 14px 34px rgba(4,8,12,.45)}
  @@ [data-nav="dark"] #proc-title .tt-strong{color:#7FD3F5}
  @@ [data-nav="dark"] #proc-title+p{text-shadow:0 1px 2px rgba(4,8,12,.45),0 2px 16px rgba(4,8,12,.5)}
  @media (max-width:767px){
    @@ footer>[data-nav="dark"]>video+div{background:linear-gradient(180deg,rgba(10,13,16,.66) 0,rgba(10,13,16,.6) 420px,rgba(10,13,16,.36) 620px,rgba(10,13,16,.36) 100%)!important}
    /* floating search and chat: one size, one finish (their offsets in JS already leave 64px per button) */
    @@ .float-search,@@ .chat-btn{width:48px;height:48px;background-image:linear-gradient(180deg,#1C8FD0,#0F80C3 55%,#0C74B3);box-shadow:0 14px 28px -14px rgba(11,15,19,.55),0 4px 10px -4px rgba(15,128,195,.5),0 0 0 1px rgba(255,255,255,.14),inset 0 1px 0 rgba(255,255,255,.28)}
  }
  /* treatment hero offer card (the glass card under the title). Before, its arrow could end up alone on a row of its
     own, and the saving's divider at the start of a row. Cards are told apart by their number of children (two: text
     and arrow; three: text, saving, arrow), so the rules work in every browser; .flex-wrap keeps the Aptos card out. */
  @media (max-width:639px){
    /* no saving figure: the arrow is parked at the right edge, centred, and the text keeps clear of it */
    @@ a.offer-glass.flex-wrap>span:first-child:nth-last-child(2){margin-right:52px}
    @@ a.offer-glass.flex-wrap>span:first-child:nth-last-child(2)+span{position:absolute;right:12px;top:50%;margin-top:-18px}
    /* with a saving figure: always two rows (the offer, then the saving and the arrow) with a hairline between them */
    @@ a.offer-glass.flex-wrap>span:first-child:nth-last-child(3){flex-basis:100%;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,.2)}
    @@ a.offer-glass.flex-wrap>.offer-big{padding-left:0;border-left:0}
  }
  @media (min-width:640px){
    /* the arrow is parked on every card; when the saving drops to a second row its divider slides under the card's
       left edge (the card clips it) and the saving lines up with the title */
    @@ a.offer-glass.flex-wrap{padding-right:64px;column-gap:calc(16px + clamp(16px,2vw,28px))}
    @@ a.offer-glass.flex-wrap>span[aria-hidden]{position:absolute;right:12px;top:50%;margin-top:-18px}
    @@ a.offer-glass.flex-wrap>.offer-big{margin-left:calc(-1px - clamp(16px,2vw,28px))}
  }
'''

# index.html only: the home hero
HOME = r'''
  /* home hero */
  @@ #hero-title{text-shadow:0 2px 4px rgba(4,8,12,.35),0 18px 40px rgba(4,8,12,.5)}
  @@ #hero-title .tt-strong{color:#7FD3F5}
  @@ .hf-in p{text-shadow:0 1px 2px rgba(4,8,12,.5),0 2px 18px rgba(4,8,12,.55)}
  @@ .hf::after{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;opacity:.09;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
  @@ .hf-band{padding-right:72px}
  @media (min-width:768px){
    @@ .hf-band{padding-right:96px}
    @@ .hf-in>ul{background:linear-gradient(160deg,rgba(255,255,255,.14),rgba(255,255,255,.05));border-color:rgba(255,255,255,.22);box-shadow:0 30px 60px -30px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.25);-webkit-backdrop-filter:blur(18px) saturate(150%);backdrop-filter:blur(18px) saturate(150%)}
  }
  @media (max-width:767px){
    /* phones: the scrim is measured in px from the bottom, where the words sit (band, proof list, buttons, text, headline) */
    @@ .hf::before{background:linear-gradient(180deg,rgba(11,15,19,.62) 0,rgba(11,15,19,0) 200px),linear-gradient(0deg,rgba(11,15,19,.88) 0,rgba(11,15,19,.8) 90px,rgba(11,15,19,.7) 200px,rgba(11,15,19,.62) 330px,rgba(11,15,19,.56) 420px,rgba(11,15,19,.48) 520px,rgba(11,15,19,.34) 580px,rgba(11,15,19,0) 720px)}
    @@ .hf-in{padding-bottom:22px}
    @@ .hf-in>ul{text-shadow:0 1px 2px rgba(4,8,12,.55),0 2px 14px rgba(4,8,12,.5)}
  }
  @media (max-width:639px){
    @@ .hf-in>ul{grid-template-columns:1fr;row-gap:8px;max-width:calc(100% - 64px)}
  }
'''

# index.html only: the Hero, main look (campaign looks keep the old behaviour)
JSX = [
    ('<div className="hf-band" data-float-avoid="">',
     '<div className="hf-band" data-float-avoid={CAMPAIGN_LOOK ? \'\' : undefined}>'),
    ('<div ref={inner} className="hf-in ',
     '<div ref={inner} data-pill-avoid={CAMPAIGN_LOOK ? undefined : \'mobile\'} className="hf-in '),
]


def block(css):
    css = css.replace('@~', ':where(html:not([data-campaign]))').replace('@@', 'html:not([data-campaign])')
    return '  ' + START + ' (design finish, main look only; written by src/patches-applied/finish_patch.py) */\n' + css.strip('\n') + '\n  ' + END + '\n'


total = 0
for name, css in (('index.html', SHARED + HOME), ('promotion.html', SHARED)):
    p = os.path.join(ROOT, name)
    s = open(p, encoding='utf-8').read()
    n = 0
    new = block(css)
    if START in s:
        a = s.rfind('\n', 0, s.index(START)) + 1
        b = s.index(END, a) + len(END)
        if s[b:b + 1] == '\n': b += 1
        if s[a:b] != new: s = s[:a] + new + s[b:]; n += 1
    else:
        i = s.rindex('</style>', 0, s.index(REACT))   # the main <style>, not the font block above it
        s = s[:i] + new + s[i:]; n += 1
    if name == 'index.html':
        for a, b in JSX:
            if b in s: continue
            assert s.count(a) == 1, (a[:80], s.count(a))
            s = s.replace(a, b); n += 1
    if n:
        open(p, 'w', encoding='utf-8').write(s); total += n
        print('patched:', name, n)
print('done,', total)
