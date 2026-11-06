"""Site-wide: offer and team profile popups use the booking popup's scrim (ink 55%, 6px blur). Already applied."""
import sys
OLD = [
  ('.offer-scrim{background:rgba(11,15,19,.5);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);',
   '.offer-scrim{background:rgba(11,15,19,.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);'),
  ('.team-pop-scrim{background:rgba(11,15,19,.42);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);',
   '.team-pop-scrim{background:rgba(11,15,19,.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);'),
]
for f in sys.argv[1:]:
    s = open(f).read()
    for a, b in OLD:
        assert s.count(a) == 1, (f, a[:30])
        s = s.replace(a, b)
    open(f, 'w').write(s)
    print('patched', f)
