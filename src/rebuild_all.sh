#!/bin/sh
# Rebuild every generated page in order, check each one, refresh the crawler copies (round 29).
cd "$(dirname "$0")/.." || exit 1
python3 src/sync_prices.py . src >/dev/null || exit 1
for b in build_pricing build_about build_blog build_article build_procedure build_aptos build_cart build_before_after build_concern build_bf_sale build_account build_legal; do
  [ -f src/$b.py ] || continue
  python3 src/$b.py . src >/dev/null 2>&1 || { echo "FAIL $b"; python3 src/$b.py . src 2>&1 | tail -3; }
done
python3 src/build_blackfriday.py . >/dev/null 2>&1 || echo "FAIL build_blackfriday"
python3 src/nbsp_off.py *.html
for f in *.html; do
  [ "$f" = index-fraunces.html ] && continue
  node tools/jsxcheck.js "$f" --html 2>&1 | grep -q "^OK" || { echo "JSX FAIL $f"; node tools/jsxcheck.js "$f" --html 2>&1 | head -3; }
  d=$(node tools/jsxcheck.js "$f" --html | sed 's/.*top-level: //' | tr ',' '\n' | sed 's/ //g' | sort | uniq -d | tr '\n' ' ')
  [ -n "$d" ] && echo "DUP $f: $d"
done
[ "$1" = "pre" ] && { python3 tools/prerender.py . botox.html | tail -1; python3 tools/prerender.py . wrinkles-fine-lines.html | tail -1; }
python3 src/nbsp_off.py botox.html wrinkles-fine-lines.html
echo rebuilt
