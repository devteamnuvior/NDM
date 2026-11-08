"""Approval item F2 (Raymond, 7 Nov 2026): the footer background film came from public.biograph.com with a framerusercontent.com
poster (placeholders). Both shells now use NewDermaMed's own clinic walk-through (assets/footer/clinic-film.mp4, a 1280x720
copy of the live site's pricing-page film, with its poster). Rebuild every generated page afterwards. Safe to run twice.
usage: python3 src/patches-applied/footer_film_patch.py <NDM dir>"""
import sys
from pathlib import Path
ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else '.')
OLD_POSTER = 'poster="https://framerusercontent.com/images/HufrBRKF68pdIZICx50VDBCtHw.png?width=1920&height=1080"'
OLD_SRC = 'src="https://public.biograph.com/images/membership-footer-video.mp4"'
for name in ('promotion.html', 'index.html'):
    p = ROOT / name
    s = p.read_text(encoding='utf-8')
    n = s.count(OLD_SRC)
    s = s.replace(OLD_POSTER, 'poster="assets/footer/clinic-film-poster.webp"').replace(OLD_SRC, 'src="assets/footer/clinic-film.mp4"')
    p.write_text(s, encoding='utf-8')
    print('patched:', name, n)
