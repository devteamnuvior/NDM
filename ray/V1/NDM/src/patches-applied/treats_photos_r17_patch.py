M = {
 "img: 'assets/pricing/price-2.jpg' },\n  { t: 'Skin Booster'": "img: 'assets/treatments/lip-filler.jpg', pos: '50% 50%' },\n  { t: 'Skin Booster'",
 "From $399', img: 'assets/pricing/price-3.jpg' }": "From $399', img: 'assets/treatments/skin-booster.jpg', pos: '50% 45%' }",
 "From $245', img: 'assets/pricing/price-4.jpg' }": "From $245', img: 'assets/treatments/microneedling.jpg', pos: '50% 45%' }",
 "From $249', img: 'assets/pricing/price-5.jpg' }": "From $249', img: 'assets/treatments/age-element-facial.jpg', pos: '50% 42%' }",
 "From $990', img: 'assets/pricing/price-6.jpg' }": "From $990', img: 'assets/treatments/laser-resurfacing.jpg', pos: '50% 45%' }",
 "From $395', img: 'assets/journal/rosacea-redness.webp' }": "From $395', img: 'assets/treatments/photo-rejuvenation.jpg', pos: '50% 42%' }",
 "From $149', img: 'assets/pricing/price-7.jpg' }": "From $149', img: 'assets/treatments/chemical-peel.jpg', pos: '50% 38%' }",
 "From $699', img: 'assets/journal/microdermabrasion.webp' }": "From $699', img: 'assets/treatments/sculptra.jpg', pos: '50% 40%' }",
 "<img src={x.img} alt=\"\" loading=\"lazy\" className=\"absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.05]\" style={{ transitionTimingFunction: 'var(--e-out)' }} />":
 "<img src={x.img} alt=\"\" loading=\"lazy\" className=\"absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.05]\" style={{ transitionTimingFunction: 'var(--e-out)', objectPosition: x.pos }} />",
}
for p in ['index.html', 'promotion.html']:
    s = open(p).read()
    for a, b in M.items():
        assert s.count(a) == 1, (p, a[:60], s.count(a)); s = s.replace(a, b)
    open(p, 'w').write(s); print(p, 'ok')
