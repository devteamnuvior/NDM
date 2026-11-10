"""round 18b: the compact booking form (hero and phone form of treatment pages) fits one screen: the category tabs sit in one
row that scrolls sideways, the options are slimmer, and the helper lines are shorter. The full form (home, pop-up) is unchanged.
usage: python3 r18b_book_compact.py index.html promotion.html"""
import sys
R = [
 ('<div role="tablist" aria-label="Type of concern" className="flex flex-wrap gap-1">',
  '<div role="tablist" aria-label="Type of concern" className={`flex gap-1 ${compact ? \'no-scrollbar -mx-1 overflow-x-auto px-1\' : \'flex-wrap\'}`}>'),
 ('className={`book-tab shrink-0 rounded-full px-4 py-2.5 font-inter text-[15px] font-semibold transition-colors',
  'className={`book-tab shrink-0 rounded-full ${compact ? \'px-3 py-1.5 text-[13px]\' : \'px-4 py-2.5 text-[15px]\'} font-inter font-semibold transition-colors'),
 ('<span className="book-opt flex min-h-[42px] w-full items-center gap-2.5 rounded-[12px] border border-ndm-ink/12 bg-white px-3.5 py-2 font-inter text-[13.5px]',
  '<span className={`book-opt flex w-full items-center gap-2.5 rounded-[12px] border border-ndm-ink/12 bg-white px-3.5 font-inter ${compact ? \'min-h-[36px] py-1.5 text-[13px]\' : \'min-h-[42px] py-2 text-[13.5px]\'}'),
 ('<p className="mt-2.5 flex min-h-[40px] flex-wrap content-start items-center gap-2 font-inter text-[13px] text-ndm-ink" aria-live="polite">',
  '<p className={`mt-2.5 flex flex-wrap content-start items-center gap-2 font-inter text-[13px] text-ndm-ink ${compact ? \'min-h-[20px]\' : \'min-h-[40px]\'}`} aria-live="polite">'),
 ('<p className="mt-2 font-inter text-[13.5px] leading-[1.5] text-ndm-muted">Choose any that apply, you can pick more than one.',
  '<p className={`mt-2 font-inter text-[13.5px] leading-[1.5] text-ndm-muted ${compact ? \'hidden\' : \'\'}`}>Choose any that apply, you can pick more than one.'),
 ('<label className="mt-5 flex cursor-pointer items-center gap-3 rounded-[14px] border border-ndm-ink/12 bg-white px-4 py-3 font-inter">',
  '<label className={`flex cursor-pointer items-center gap-3 rounded-[14px] border border-ndm-ink/12 bg-white px-4 font-inter ${compact ? \'mt-3 py-2.5\' : \'mt-5 py-3\'}`}>'),
 ('<span className="mt-0.5 block text-[12.5px] leading-[1.45] text-ndm-muted">So you and your provider can see your skin in detail before planning anything.</span>',
  '<span className={`mt-0.5 block text-[12.5px] leading-[1.45] text-ndm-muted ${compact ? \'hidden\' : \'\'}`}>So you and your provider can see your skin in detail before planning anything.</span>'),
]
for p in sys.argv[1:]:
    s = open(p, encoding='utf-8').read()
    for a, b in R:
        c = s.count(a); assert c == 1, (p, a[:70], c)
        s = s.replace(a, b)
    open(p, 'w', encoding='utf-8').write(s); print('ok', p)
# follow-up: the option tile's class now ends with `} instead of a quote (it became a template string)
