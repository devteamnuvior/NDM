# round 11: the first concern page (wrinkles-fine-lines.html): menu and chip links, the Concerns tab marked while on it,
# and it keeps the main look under campaigns (a medical page)
import sys
R = [
 ("const PAGE_LINKS = { 'aptos-thread-lift': 'aptos-thread-lift.html',",
  "const PAGE_LINKS = { 'wrinkles-fine-lines': 'wrinkles-fine-lines.html', 'aptos-thread-lift': 'aptos-thread-lift.html',"),
 ("'botox.html': 'procedures', 'aptos-thread-lift.html': 'procedures' }[HERE];",
  "'botox.html': 'procedures', 'aptos-thread-lift.html': 'procedures', 'wrinkles-fine-lines.html': 'concerns' }[HERE];"),
 ("const CAMPAIGN_SKIP = ['botox.html', 'aptos-thread-lift.html', 'what-causes-rosacea-redness.html'];",
  "const CAMPAIGN_SKIP = ['botox.html', 'aptos-thread-lift.html', 'what-causes-rosacea-redness.html', 'wrinkles-fine-lines.html'];"),
]
for p in sys.argv[1:]:
    s = open(p, encoding='utf-8').read()
    for a, b in R:
        c = s.count(a); assert c == 1, (p, a[:60], c)
        s = s.replace(a, b)
    open(p, 'w', encoding='utf-8').write(s); print('ok', p)

# also (index.html only): the home Start sheet's "Compare all 6 options" for wrinkles now opens wrinkles-fine-lines.html
