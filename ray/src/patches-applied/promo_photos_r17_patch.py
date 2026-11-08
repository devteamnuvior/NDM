import re,sys
p='promotion.html'; s=open(p).read()
rep={
"n: 'Radiesse® Collagen Lift', img: 'assets/pricing/price-1.jpg'":"n: 'Radiesse® Collagen Lift', img: 'assets/promotion/collagen-lift.webp', pos: '50% 42%'",
"n: 'Radiesse® Jawline Lift', img: 'assets/pricing/price-3.jpg'":"n: 'Radiesse® Jawline Lift', img: 'assets/promotion/jawline.webp', pos: '50% 50%'",
"n: 'Hand Rejuvenation with Radiesse®', img: 'assets/pricing/price-2.jpg'":"n: 'Hand Rejuvenation with Radiesse®', img: 'assets/promotion/hands.webp', pos: '50% 58%'",
"n: 'Non-Surgical Butt Lift (60 mL)', img: 'assets/hero/treatment-room.jpg'":"n: 'Non-Surgical Butt Lift (60 mL)', img: 'assets/promotion/butt-lift.webp', pos: '50% 56%'",
"n: 'Hip Dip Enhancement', img: 'assets/journal/rosacea-redness.webp'":"n: 'Hip Dip Enhancement', img: 'assets/promotion/hip-dip.webp', pos: '50% 56%'",
"n: 'Crepey Arm Rejuvenation with Radiesse®', img: 'assets/journal/microdermabrasion.webp'":"n: 'Crepey Arm Rejuvenation with Radiesse®', img: 'assets/promotion/crepey-arms.webp', pos: '50% 55%'",
"n: 'Above the Knee Tightening', img: 'assets/journal/laser-hair-removal.webp'":"n: 'Above the Knee Tightening', img: 'assets/promotion/above-knee.webp', pos: '50% 55%'",
"n: 'Liquid Facelift with Sculptra®', img: 'assets/pricing/price-7.jpg'":"n: 'Liquid Facelift with Sculptra®', img: 'assets/promotion/sculptra-face.webp', pos: '50% 45%'",
"<img src={s.img} alt=\"\" loading=\"lazy\" draggable=\"false\" className=\"h-full w-full object-cover\" />":"<img src={s.img} alt=\"\" loading=\"lazy\" draggable=\"false\" className=\"h-full w-full object-cover\" style={{ objectPosition: s.pos }} />",
"style={{ transitionTimingFunction: 'var(--e-out)' }} />\n              </div>\n              <div className=\"relative mt-5 flex items-center justify-between gap-2 px-3\">":"style={{ transitionTimingFunction: 'var(--e-out)', objectPosition: s.pos }} />\n              </div>\n              <div className=\"relative mt-5 flex items-center justify-between gap-2 px-3\">",
}
for a,b in rep.items():
    assert s.count(a)==1,(a,s.count(a)); s=s.replace(a,b)
open(p,'w').write(s); print('ok')
