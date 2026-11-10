"""round 17: the Procedures menu's Aptos panel gets back its purple NAMICA card (AptosCard) between the treatment list and the
consultation photo card, with the "Treatment" list (AptosMenu), as in the designer's screenshot. Other categories are unchanged.
usage: python3 r17_aptos_menu_card.py index.html promotion.html"""
import sys
R = [
 ('''      <div className="grid gap-4 p-4 2xl:p-5 grid-cols-[210px_1fr_340px] 2xl:grid-cols-[260px_1fr_340px]">
      <ul className="rounded-[16px] bg-ndm-mist/70 p-2" role="list">
        {PROCEDURES.map((c) => {''',
  '''      <div className={`grid gap-4 p-4 2xl:p-5 ${act === 'aptos' ? 'grid-cols-[210px_minmax(0,1.7fr)_minmax(0,1fr)_minmax(0,1fr)] 2xl:grid-cols-[260px_minmax(0,1.7fr)_minmax(0,1fr)_minmax(0,1fr)]' : 'grid-cols-[210px_1fr_340px] 2xl:grid-cols-[260px_1fr_340px]'}`}>
      <ul className="rounded-[16px] bg-ndm-mist/70 p-2" role="list">
        {PROCEDURES.map((c) => {'''),
 ('''            {slug(cat.label).endsWith('.html')
              ? <a href''',
  '''            {slug(cat.label).endsWith('.html') && act !== 'aptos'
              ? <a href'''),
 ('''        {(
        <div className={`mt-4 grid gap-6 ${cat.groups.length > 1 ? 'grid-cols-[1.9fr_1fr]' : ''}`}>''',
  '''        {act === 'aptos' ? <AptosMenu items={cat.groups[0].items.filter((it) => it !== cat.label)} onLink={onLink} /> : (
        <div className={`mt-4 grid gap-6 ${cat.groups.length > 1 ? 'grid-cols-[1.9fr_1fr]' : ''}`}>'''),
 ('''      <a href="#/book" onClick={onLink} className="group relative overflow-hidden rounded-[16px] min-h-[380px] text-white">
        <img src="assets/clinic/clinic-2.jpg"''',
  '''      {act === 'aptos' && <AptosCard onLink={onLink} />}
      <a href="#/book" onClick={onLink} className="group relative overflow-hidden rounded-[16px] min-h-[380px] text-white">
        <img src="assets/clinic/clinic-2.jpg"'''),
]
for p in sys.argv[1:]:
    s = open(p, encoding='utf-8').read()
    a = s.index('function MegaMenu('); b = s.index('\n}\n', a)
    body = s[a:b]
    for x, y in R:
        c = body.count(x); assert c == 1, (p, x[:60], c)
        body = body.replace(x, y)
    s = s[:a] + body + s[b:]
    open(p, 'w', encoding='utf-8').write(s); print('ok', p)
