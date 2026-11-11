"""Build black-friday-sale.html (round 23): the Black Friday landing page after bellairlaserclinic.ca/black-friday-sale, in the site's
Black Friday look (true black and signal red). Simple header and footer, many calls to book. Built from promotion.html (shared
pieces: buttons, booking pop-up, clinics, offers) with the NDM price list (src/pricing-data.jsx) and src/bf-sale-ui.jsx.
usage: python3 src/build_bf_sale.py <NDM dir> <src dir>
"""
import json
import re
import sys
from pathlib import Path

root, src = Path(sys.argv[1]), Path(sys.argv[2])
s = (root / 'promotion.html').read_text(encoding='utf-8')
OUT = 'black-friday-sale.html'


def rep(a, b, n=1):
    global s
    c = s.count(a)
    assert c == n, (a[:90], c)
    s = s.replace(a, b)


s = re.sub(r'\n<script type="application/ld\+json" id="ld-crumbs">.*?</script>', '', s, count=1)
SITE = 'https://newdermamedlaserclinic.com/'
TITLE = 'Black Friday 2026: Up to 60% Off Treatments | NewDermaMed Toronto'
DESC = ('NewDermaMed Black Friday, November 27 to 30: offers on laser, skin, injectable and body treatments at our Uptown and Downtown '
        'Toronto clinics. Build your plan and book a free consultation.')
H = lambda x: x.replace('&', '&amp;').replace('"', '&quot;').replace('<', '&lt;')
rep('<title>Promotions, NewDermaMed Toronto</title>', f'<title>{H(TITLE)}</title>')
m = re.search(r'<meta name="description" content="[^"]*">', s)
s = s.replace(m.group(0), f'<meta name="description" content="{H(DESC)}">\n<link rel="canonical" href="{SITE}{OUT}">\n'
              f'<meta property="og:title" content="{H(TITLE)}">\n<meta property="og:description" content="{H(DESC)}">\n'
              f'<meta property="og:image" content="{SITE}assets/hero/clinic-exterior.jpg">', 1)
rep('<html lang="en">', '<html lang="en" class="bfs">')
# this page has its own look: campaign colours never apply to it
rep('const CAMPAIGN_SKIP = [', f"const CAMPAIGN_SKIP = ['{OUT}', ")

ui = (src / 'bf-sale-ui.jsx').read_text(encoding='utf-8')
css = re.search(r'const BFS_CSS = `(.*?)`;', ui, re.S).group(1)
anchor = '<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" crossorigin></script>'
i = s.rindex('</style>', 0, s.index(anchor))
s = s[:i] + css + s[i:]

data = ''  # round 29: the price list (PRICE_CATS, lhrB) already lives in the shell (src/sync_prices.py)

a = s.index('\nfunction App() {')
b = s.index('ReactDOM.createRoot', a)
app = r'''
function App() {
  const KEY = 'ndm-bf-plan';
  const [plan, setPlan] = useState(() => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } });
  const [pick, setPick] = useState(null);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(plan)); } catch (e) { /* private mode: the plan lives for this visit */ } }, [plan]);
  const toggle = (x) => setPlan((p) => (p.some((y) => y.key === x.key) ? p.filter((y) => y.key !== x.key) : [...p, x]));
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-full focus:bg-[#D3121F] focus:px-4 focus:py-2 focus:font-mont focus:text-white">Skip to content</a>
      <BfsHeader count={plan.length} />
      <main id="main">
        <BfsHero />
        <BfsStats />
        <BfsConcerns pick={pick} setPick={setPick} />
        <BfsDeals pick={pick} setPick={setPick} plan={plan} toggle={toggle} />
        <BfsSpecials />
        <BfsHow />
        <BfsPlan plan={plan} toggle={toggle} clear={() => setPlan([])} />
        <BfsClinics />
      </main>
      <BfsFooter />
      <BfsPlanBar plan={plan} />
    </>
  );
}

'''
s = s[:a] + '\n/* ---------------------------------------------------------------- price list (src/pricing-data.jsx) */\n' + data + '\n' + ui + \
    '\n/* ---------------------------------------------------------------- app (Black Friday landing page) */' + app + s[b:]
(root / OUT).write_text(s, encoding='utf-8')
print('wrote', OUT, len(s))
