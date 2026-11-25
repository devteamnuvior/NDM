/* ---------------------------------------------------------------- pricing page data, the live price list of newdermamedlaserclinic.com/pricing (CAD, read 2026-11-25) */
/* item: [name, note, [[option, price, regular price or 0, badge, price with the checkout code], ...]]; read from the live price list by src/price_data_from_live.py */
const PRICE_CATS = [
  { id: 'aptos-thread-method', name: 'Aptos Thread Method', blurb: '', items: [
    ['Aptos Excellence Visage Method EV PLA/PCL (up to 24 months)', '', [['Nose lift/correction', 2500, 0, ''], ['Fox eyebrow / eyebrow lift', 2500, 0, ''], ['Mid face', 2500, 0, ''], ['Lower face or submental', 2500, 0, ''], ['Face – Mid & Lower', 3400, 4400, 'Save $1000 Off'], ['Neck', 2900, 3900, 'Save $1000 Off'], ['Face + neck', 5900, 6900, 'Save $1000 Off']]],
  ] },
  { id: 'botox-dysport', name: 'Botox / Dysport', unit: true, blurb: '', items: [
    ['Botox Cosmetic', '', [['Regular', 12, 0, ''], ['60 units', 504, 0, '30% OFF'], ['120 units', 1008, 0, '30% OFF'], ['180 units', 1512, 0, '30% OFF'], ['220 units', 1848, 2640, '30% OFF']]],
    ['Dysport', '', [['Regular', 11, 0, ''], ['60 units', 594, 660, '10% OFF'], ['120 units', 1056, 1320, '20% OFF'], ['180 units', 1386, 1980, '30% OFF'], ['220 units', 1694, 2420, '30% OFF']]],
    ['Hyperhidrosis', '', [['Regular', 9, 0, ''], ['50 units', 420, 0, ''], ['100 units', 840, 0, '']]],
  ] },
  { id: 'laser-vein', name: 'Laser Vein', blurb: '', items: [
    ['Laser Vein Removal One Small Area', '', [['Single session', 240, 0, ''], ['Package of 3', 576, 720, '20% OFF'], ['Package of 6', 1004, 1440, '30% OFF']]],
    ['Laser Vein Removal One Large Area', '', [['Single session', 450, 0, ''], ['Package of 3', 1080, 1350, '20% OFF'], ['Package of 6', 1890, 2700, '30% OFF']]],
  ] },
  { id: 'dermal-fillers', name: 'Dermal Fillers', blurb: '', items: [
    ['Lip Enhancement', 'definition, volume, hydration', [['1 Syringe', 750, 0, ''], ['2 Syringes', 900, 1500, '40% OFF']]],
    ['Standard Contour Areas', 'Cheeks (mid-face / cheek enhancement), Smile Lines (Nasolabial folds), Marionette Lines, Pre-jowl sulcus, Temples', [['1 Syringe', 800, 0, ''], ['2 Syringes', 960, 1600, '40% OFF'], ['3 Syringes', 1800, 2400, '25% OFF'], ['4 Syringes', 2400, 3200, '25% OFF']]],
  ] },
  { id: 'skin-booster-and-bio-stimulators', name: 'Skin Booster and Bio-stimulators', blurb: '', items: [
    ['Skin Booster – HA (Hyaluronic Acid)', '', [['1 syringe', 399, 750, '47% OFF'], ['2 Syringes', 798, 1500, '47% OFF']]],
    ['Bio-Stimulator – Radiesse', '', [['1 Syringe', 599, 900, '33% OFF'], ['2 Syringes', 1198, 1800, '33% OFF']]],
    ['Bio-Stimulator – Sculptra', '', [['1 Vial', 599, 900, '33% OFF'], ['2 Vials', 1198, 1800, '33% OFF']]],
    ['Bio-Stimulator – Hand Rejuvenation with Radiesse', '', [['1 Syringe', 599, 900, '33% OFF'], ['2 Syringes', 1198, 1800, '33% OFF']]],
  ] },
  { id: 'non-surgical-butt-lift', name: 'Non-Surgical Butt Lift', blurb: '', items: [
    ['Non-Surgical Butt Lift', '', [['60 mL', 3999, 0, '']]],
    ['Hip Dip Contouring', '', [['Standard', 1999, 0, '']]],
  ] },
  { id: 'microneedling', name: 'Microneedling', blurb: '', items: [
    ['Microneedling-Face', '', [['Single session', 490, 0, ''], ['Package of 3', 1029, 1470, 'BLACK FRIDAY 30% OFF', 720.3], ['Package of 6', 2058, 2940, 'BLACK FRIDAY 30% OFF', 1440.6]]],
    ['Microneedling with PRP - Face', '', [['Single session', 1000, 0, ''], ['Package of 3', 2100, 3000, 'BLACK FRIDAY 30% OFF', 1470], ['Package of 6', 1800, 6000, '70% OFF']]],
    ['Microneedling with PDRN (Salmon DNA) - Face', '', [['Single session', 590, 0, ''], ['Package of 3', 1239, 1770, 'BLACK FRIDAY 30% OFF', 867.3], ['Package of 6', 2478, 3540, 'BLACK FRIDAY 30% OFF', 1734.6]]],
    ['Microneedling with Exosomes - Face', '', [['Single session', 590, 0, ''], ['Package of 3', 1239, 1770, 'BLACK FRIDAY 30% OFF', 867.3], ['Package of 6', 2478, 3540, 'BLACK FRIDAY 30% OFF', 1734.6]]],
    ['Microneedling - Neck', '', [['Single session', 490, 0, ''], ['Package of 3', 1029, 1470, 'BLACK FRIDAY 30% OFF', 720.3], ['Package of 6', 2058, 2940, 'BLACK FRIDAY 30% OFF', 1440.6]]],
  ] },
  { id: 'laser-acne-treatment', name: 'Laser Acne Treatment', blurb: '', items: [
    ['Laser Acne Full Face', '', [['Single session', 395, 0, ''], ['Package of 3', 787.5, 1125, 'BLACK FRIDAY 30% OFF', 551.25], ['Package of 6', 1575, 2250, 'BLACK FRIDAY 30% OFF', 1102.5]]],
    ['Laser Acne Upper Back', '', [['Single session', 750, 0, ''], ['Package of 3', 1575, 2250, 'BLACK FRIDAY 30% OFF', 1102.5], ['Package of 6', 3150, 4500, 'BLACK FRIDAY 30% OFF', 2205]]],
  ] },
  { id: 'laser-skin-resurfacing', name: 'Laser Skin Resurfacing', blurb: '', items: [
    ['Laser Skin Resurfacing Face', '', [['Single session', 990, 0, ''], ['Package of 3', 2079, 2970, 'BLACK FRIDAY 30% OFF', 1455.3], ['Package of 6', 4158, 5940, 'BLACK FRIDAY 30% OFF', 2910.6]]],
    ['Laser Skin Resurfacing Face & Neck', '', [['Single session', 1800, 0, ''], ['Package of 3', 3780, 5400, 'BLACK FRIDAY 30% OFF', 2646], ['Package of 6', 7560, 10800, 'BLACK FRIDAY 30% OFF', 5292]]],
    ['Fractional Laser Skin Resurfacing Face', '', [['Single session', 1270, 0, ''], ['Package of 3', 2667, 3810, 'BLACK FRIDAY 30% OFF', 1866.9], ['Package of 6', 5334, 7620, 'BLACK FRIDAY 30% OFF', 3733.8]]],
    ['Fractional Laser Skin Resurfacing Face & Neck', '', [['Single session', 2080, 0, ''], ['Package of 3', 4368, 6240, 'BLACK FRIDAY 30% OFF', 3057.6], ['Package of 6', 8736, 12480, 'BLACK FRIDAY 30% OFF', 6115.2]]],
    ['Micro Laser Peel Face', '', [['Single session', 679, 0, ''], ['Package of 3', 1425.9, 2037, 'BLACK FRIDAY 30% OFF', 998.13], ['Package of 6', 2851.8, 4074, 'BLACK FRIDAY 30% OFF', 1996.26]]],
    ['Micro Laser Peel Face + Neck', '', [['Single session', 1178, 0, ''], ['Package of 3', 2473.8, 3534, 'BLACK FRIDAY 30% OFF', 1731.66], ['Package of 6', 4947.6, 7068, 'BLACK FRIDAY 30% OFF', 3463.32]]],
    ['Micro Laser Peel Extra Small', '', [['Single session', 300, 0, ''], ['Package of 3', 630, 900, 'BLACK FRIDAY 30% OFF', 441], ['Package of 6', 1260, 1800, 'BLACK FRIDAY 30% OFF', 882]]],
    ['Micro Laser Peel Small', '', [['Single session', 589, 0, ''], ['Package of 3', 1236.9, 1767, 'BLACK FRIDAY 30% OFF', 865.83], ['Package of 6', 2473.8, 3534, 'BLACK FRIDAY 30% OFF', 1731.66]]],
    ['Micro Laser Peel Medium', '', [['Single session', 900, 0, ''], ['Package of 3', 1890, 2700, 'BLACK FRIDAY 30% OFF', 1323], ['Package of 6', 3780, 5400, 'BLACK FRIDAY 30% OFF', 2646]]],
    ['Micro Laser Peel Large', '', [['Single session', 1180, 0, ''], ['Package of 3', 2478, 3540, 'BLACK FRIDAY 30% OFF', 1734.6], ['Package of 6', 4956, 7080, 'BLACK FRIDAY 30% OFF', 3469.2]]],
    ['Ultra Laser Peel Face', '', [['Single session', 489, 0, ''], ['Package of 3', 1026.9, 1467, 'BLACK FRIDAY 30% OFF', 718.83], ['Package of 6', 2053.8, 2934, 'BLACK FRIDAY 30% OFF', 1437.66]]],
  ] },
  { id: 'photo-rejuvenation', name: 'Photo-Rejuvenation', blurb: '', items: [
    ['Photo-Rejuvenation Face', '', [['Single session', 395, 0, ''], ['Package of 3', 829.5, 1185, 'BLACK FRIDAY 30% OFF', 580.65], ['Package of 6', 1659, 2370, 'BLACK FRIDAY 30% OFF', 1161.3]]],
    ['Photo-Rejuvenation Small', '', [['Single session', 390, 0, '']]],
  ] },
  { id: '4d-rejuvalift', name: '4D Rejuvalift', blurb: '', items: [
    ['4D Rejuvalift Face', '', [['Single session', 1200, 0, ''], ['Package of 3', 2520, 3600, 'BLACK FRIDAY 30% OFF', 1764], ['Package of 6', 5040, 7200, 'BLACK FRIDAY 30% OFF', 3528]]],
    ['4D Rejuvalift Large', '', [['Single session', 1200, 0, ''], ['Package of 3', 2520, 3600, 'BLACK FRIDAY 30% OFF', 1764], ['Package of 6', 5040, 7200, 'BLACK FRIDAY 30% OFF', 3528]]],
  ] },
  { id: '2d-3d-laser-skin-tightening', name: '2D & 3D Laser Skin Tightening', blurb: '', items: [
    ['2D Skin Tightening Face', '', [['Single session', 480, 0, ''], ['Package of 3', 1008, 1440, 'BLACK FRIDAY 30% OFF', 705.6], ['Package of 6', 2016, 2880, 'BLACK FRIDAY 30% OFF', 1411.2]]],
    ['2D Skin Tightening Large Area', '', [['Single session', 960, 0, ''], ['Package of 3', 2016, 2880, 'BLACK FRIDAY 30% OFF', 1411.2], ['Package of 6', 4032, 5760, 'BLACK FRIDAY 30% OFF', 2822.4]]],
    ['Smooth Eye Tightening', '', [['Single session', 600, 0, ''], ['Package of 3', 1260, 1800, 'BLACK FRIDAY 30% OFF', 882], ['Package of 6', 2520, 3600, 'BLACK FRIDAY 30% OFF', 1764]]],
    ['3D Skin Tightening Face', '', [['Single session', 810, 0, ''], ['Package of 3', 1890, 2700, 'BLACK FRIDAY 30% OFF', 1323], ['Package of 6', 3780, 5400, 'BLACK FRIDAY 30% OFF', 2646]]],
    ['3D Skin Tightening Large Area', '', [['Single session', 810, 0, ''], ['Package of 3', 1890, 2700, 'BLACK FRIDAY 30% OFF', 1323], ['Package of 6', 3780, 5400, 'BLACK FRIDAY 30% OFF', 2646]]],
  ] },
  { id: '2d-3d-laser-rejuvenation', name: '2D & 3D Laser Rejuvenation', blurb: '', items: [
    ['2D Skin Rejuvenation Face', '', [['Single session', 600, 0, ''], ['Package of 3', 1260, 1800, 'BLACK FRIDAY 30% OFF', 882], ['Package of 6', 2520, 3600, 'BLACK FRIDAY 30% OFF', 1764]]],
    ['2D Skin Rejuvenation Large Area', '', [['Single session', 960, 0, ''], ['Package of 3', 2016, 2880, 'BLACK FRIDAY 30% OFF', 1411.2], ['Package of 6', 4032, 5760, 'BLACK FRIDAY 30% OFF', 2822.4]]],
    ['3D Skin Rejuvenation Face', '', [['Single session', 900, 0, ''], ['Package of 3', 1890, 2700, 'BLACK FRIDAY 30% OFF', 1323], ['Package of 6', 3780, 5400, 'BLACK FRIDAY 30% OFF', 2646]]],
    ['3D Skin Rejuvenation Large Area', '', [['Single session', 1200, 0, ''], ['Package of 3', 2520, 3600, 'BLACK FRIDAY 30% OFF', 1764], ['Package of 6', 5040, 7200, 'BLACK FRIDAY 30% OFF', 3528]]],
  ] },
  { id: 'facial', name: 'Facial', blurb: '', items: [
    ['Age Element Facial', '', [['Single session', 249, 0, ''], ['Package of 3', 597.6, 747, '20% OFF'], ['Package of 6', 1045.8, 1494, '30% OFF']]],
    ['Purifying Acne Relief Facial', '', [['Single session', 249, 0, ''], ['Package of 3', 597.6, 747, '20% OFF'], ['Package of 6', 1045.8, 1494, '30% OFF']]],
    ['Glass Glow Facial', '', [['Single session', 249, 0, ''], ['Package of 3', 597.6, 747, '20% OFF'], ['Package of 6', 1045.8, 1494, '30% OFF']]],
  ] },
  { id: 'chemical-peel', name: 'Chemical Peel', blurb: '', items: [
    ['PURIFYING Light Peel', '', [['Single session', 149, 0, ''], ['Package of 3', 312.9, 447, 'BLACK FRIDAY 30% OFF', 219.03], ['Package of 6', 625.8, 894, 'BLACK FRIDAY 30% OFF', 438.06]]],
    ['BRIGHTENING Medium Peel', '', [['Single session', 299, 0, ''], ['Package of 3', 627.9, 897, 'BLACK FRIDAY 30% OFF', 439.53], ['Package of 6', 1255.8, 1794, 'BLACK FRIDAY 30% OFF', 879.06]]],
    ['PRO Deep Peel', '', [['Single session', 399, 0, ''], ['Package of 3', 837.9, 1197, 'BLACK FRIDAY 30% OFF', 586.53], ['Package of 6', 1675.8, 2394, 'BLACK FRIDAY 30% OFF', 1173.06]]],
    ['Acnelan', '', [['Single session', 249, 0, ''], ['Package of 3', 522.9, 747, 'BLACK FRIDAY 30% OFF', 366.03], ['Package of 6', 1045.8, 1494, 'BLACK FRIDAY 30% OFF', 732.06]]],
  ] },
  { id: 'depigmenting-treatment', name: 'Depigmenting Treatment', blurb: '', items: [
    ['Cosmelan', '', [['Single session', 799.2, 999, '20% OFF']]],
    ['Dermamelan', '', [['Single session', 1119.2, 1399, '20% OFF']]],
  ] },
  { id: 'hair-loss', name: 'Hair Loss', blurb: '', items: [
    ['PRP Scalp', '', [['Single session', 1000, 0, ''], ['Package of 3', 1500, 3000, '50% OFF'], ['Package of 6', 1800, 6000, '70% OFF']]],
    ['Laser Hair Rejuvenation', '', [['Single session', 350, 0, ''], ['Package of 3', 1050, 0, ''], ['Package of 6', 2100, 0, '']]],
  ] },
  { id: 'laser-hair-removal', name: 'Laser Hair Removal', blurb: '', items: [
    ['LHR - Abdomen', '', [['Single session', 190, 0, ''], ['Package of 3', 399, 570, 'BLACK FRIDAY 30% OFF', 279.3], ['Package of 5', 665, 950, 'BLACK FRIDAY 30% OFF', 465.5], ['Package of 8', 1064, 1520, 'BLACK FRIDAY 30% OFF', 744.8]]],
    ['LHR - Arms (Full)', '', [['Single session', 290, 0, ''], ['Package of 3', 609, 870, 'BLACK FRIDAY 30% OFF', 426.3], ['Package of 5', 1015, 1450, 'BLACK FRIDAY 30% OFF', 710.5], ['Package of 8', 1624, 2320, 'BLACK FRIDAY 30% OFF', 1136.8]]],
    ['LHR - Arms (Lower)', '', [['Single session', 190, 0, ''], ['Package of 3', 399, 570, 'BLACK FRIDAY 30% OFF', 279.3], ['Package of 5', 665, 950, 'BLACK FRIDAY 30% OFF', 465.5], ['Package of 8', 1064, 1520, 'BLACK FRIDAY 30% OFF', 744.8]]],
    ['LHR - Arms (Upper)', '', [['Single session', 219, 0, ''], ['Package of 3', 459.9, 657, 'BLACK FRIDAY 30% OFF', 321.93], ['Package of 5', 766.5, 1095, 'BLACK FRIDAY 30% OFF', 536.55], ['Package of 8', 1226.4, 1752, 'BLACK FRIDAY 30% OFF', 858.48]]],
    ['Hands & Fingers', '', [['Single session', 150, 0, ''], ['Package of 3', 315, 450, 'BLACK FRIDAY 30% OFF', 220.5], ['Package of 5', 525, 750, 'BLACK FRIDAY 30% OFF', 367.5], ['Package of 8', 840, 1200, 'BLACK FRIDAY 30% OFF', 588]]],
    ['LHR - Back (Full)', '', [['Single session', 390, 0, ''], ['Package of 3', 819, 1170, 'BLACK FRIDAY 30% OFF', 573.3], ['Package of 5', 1365, 1950, 'BLACK FRIDAY 30% OFF', 955.5], ['Package of 8', 2184, 3120, 'BLACK FRIDAY 30% OFF', 1528.8]]],
    ['LHR - Back (Lower)', '', [['Single session', 250, 0, ''], ['Package of 3', 525, 750, 'BLACK FRIDAY 30% OFF', 367.5], ['Package of 5', 875, 1250, 'BLACK FRIDAY 30% OFF', 612.5], ['Package of 8', 1400, 2000, 'BLACK FRIDAY 30% OFF', 980]]],
    ['LHR - Back (Upper)', '', [['Single session', 250, 0, ''], ['Package of 3', 525, 750, 'BLACK FRIDAY 30% OFF', 367.5], ['Package of 5', 875, 1250, 'BLACK FRIDAY 30% OFF', 612.5], ['Package of 8', 1400, 2000, 'BLACK FRIDAY 30% OFF', 980]]],
    ['Full Back & Shoulders', '', [['Single session', 520, 0, ''], ['Package of 3', 1092, 1560, 'BLACK FRIDAY 30% OFF', 764.4], ['Package of 5', 1820, 2600, 'BLACK FRIDAY 30% OFF', 1274], ['Package of 8', 2912, 4160, 'BLACK FRIDAY 30% OFF', 2038.4]]],
    ['Upper Back & Shoulders', '', [['Single session', 450, 0, ''], ['Package of 3', 945, 1350, 'BLACK FRIDAY 30% OFF', 661.5], ['Package of 5', 1575, 2250, 'BLACK FRIDAY 30% OFF', 1102.5], ['Package of 8', 2520, 3600, 'BLACK FRIDAY 30% OFF', 1764]]],
    ['LHR - Chest', '', [['Single session', 290, 0, ''], ['Package of 3', 609, 870, 'BLACK FRIDAY 30% OFF', 426.3], ['Package of 5', 1015, 1450, 'BLACK FRIDAY 30% OFF', 710.5], ['Package of 8', 1624, 2320, 'BLACK FRIDAY 30% OFF', 1136.8]]],
    ['Chest & Abdomen', '', [['Single session', 450, 0, ''], ['Package of 3', 945, 1350, 'BLACK FRIDAY 30% OFF', 661.5], ['Package of 5', 1575, 2250, 'BLACK FRIDAY 30% OFF', 1102.5], ['Package of 8', 2520, 3600, 'BLACK FRIDAY 30% OFF', 1764]]],
    ['Chest, Abdomen & Shoulders', '', [['Single session', 550, 0, ''], ['Package of 3', 1155, 1650, 'BLACK FRIDAY 30% OFF', 808.5], ['Package of 5', 1925, 2750, 'BLACK FRIDAY 30% OFF', 1347.5], ['Package of 8', 3080, 4400, 'BLACK FRIDAY 30% OFF', 2156]]],
    ['LHR - Legs (Full)', '', [['Single session', 490, 0, ''], ['Package of 3', 1029, 1470, 'BLACK FRIDAY 30% OFF', 720.3], ['Package of 5', 1715, 2450, 'BLACK FRIDAY 30% OFF', 1200.5], ['Package of 8', 2744, 3920, 'BLACK FRIDAY 30% OFF', 1920.8]]],
    ['LHR - Legs (Upper)', '', [['Single session', 290, 0, ''], ['Package of 3', 609, 870, 'BLACK FRIDAY 30% OFF', 426.3], ['Package of 5', 1015, 1450, 'BLACK FRIDAY 30% OFF', 710.5], ['Package of 8', 1624, 2320, 'BLACK FRIDAY 30% OFF', 1136.8]]],
    ['LHR - Legs (Lower)', '', [['Single session', 290, 0, ''], ['Package of 3', 609, 870, 'BLACK FRIDAY 30% OFF', 426.3], ['Package of 5', 1015, 1450, 'BLACK FRIDAY 30% OFF', 710.5], ['Package of 8', 1624, 2320, 'BLACK FRIDAY 30% OFF', 1136.8]]],
    ['Full Legs & Brazilian', '', [['Single session', 650, 0, ''], ['Package of 3', 1365, 1950, 'BLACK FRIDAY 30% OFF', 955.5], ['Package of 5', 2275, 3250, 'BLACK FRIDAY 30% OFF', 1592.5], ['Package of 8', 3640, 5200, 'BLACK FRIDAY 30% OFF', 2548]]],
    ['Full Legs & Bikini', '', [['Single session', 620, 0, ''], ['Package of 3', 1302, 1860, 'BLACK FRIDAY 30% OFF', 911.4], ['Package of 5', 2170, 3100, 'BLACK FRIDAY 30% OFF', 1519], ['Package of 8', 3472, 4960, 'BLACK FRIDAY 30% OFF', 2430.4]]],
    ['LHR - Brazilian', '', [['Single session', 190, 0, ''], ['Package of 3', 399, 570, 'BLACK FRIDAY 30% OFF', 279.3], ['Package of 5', 665, 950, 'BLACK FRIDAY 30% OFF', 465.5], ['Package of 8', 1064, 1520, 'BLACK FRIDAY 30% OFF', 744.8]]],
    ['Bikini', '', [['Single session', 150, 0, ''], ['Package of 3', 315, 450, 'BLACK FRIDAY 30% OFF', 220.5], ['Package of 5', 525, 750, 'BLACK FRIDAY 30% OFF', 367.5], ['Package of 8', 840, 1200, 'BLACK FRIDAY 30% OFF', 588]]],
    ['LHR - Buttocks', '', [['Single session', 350, 0, ''], ['Package of 3', 735, 1050, 'BLACK FRIDAY 30% OFF', 514.5], ['Package of 5', 1225, 1750, 'BLACK FRIDAY 30% OFF', 857.5], ['Package of 8', 1960, 2800, 'BLACK FRIDAY 30% OFF', 1372]]],
    ['Linea Alba', '', [['Single session', 120, 0, ''], ['Package of 3', 252, 360, 'BLACK FRIDAY 30% OFF', 176.4], ['Package of 5', 420, 600, 'BLACK FRIDAY 30% OFF', 294], ['Package of 8', 672, 960, 'BLACK FRIDAY 30% OFF', 470.4]]],
    ['Full face', '', [['Single Session', 290, 0, ''], ['Package of 3', 609, 870, 'BLACK FRIDAY 30% OFF', 426.3], ['Package of 5', 1015, 1450, 'BLACK FRIDAY 30% OFF', 710.5], ['Package of 8', 1624, 2320, 'BLACK FRIDAY 30% OFF', 1136.8]]],
    ['Half Face', '', [['Single session', 190, 0, ''], ['Package of 3', 399, 570, 'BLACK FRIDAY 30% OFF', 279.3], ['Package of 5', 665, 950, 'BLACK FRIDAY 30% OFF', 465.5], ['Package of 8', 1064, 1520, 'BLACK FRIDAY 30% OFF', 744.8]]],
    ['Chin', '', [['Single session', 120, 0, ''], ['Package of 3', 252, 360, 'BLACK FRIDAY 30% OFF', 176.4], ['Package of 5', 420, 600, 'BLACK FRIDAY 30% OFF', 294], ['Package of 8', 672, 960, 'BLACK FRIDAY 30% OFF', 470.4]]],
    ['LHR - Chin & Anterior Neck', '', [['Single session', 190, 0, ''], ['Package of 3', 399, 570, 'BLACK FRIDAY 30% OFF', 279.3], ['Package of 5', 665, 950, 'BLACK FRIDAY 30% OFF', 465.5], ['Package of 8', 1064, 1520, 'BLACK FRIDAY 30% OFF', 744.8]]],
    ['LHR - Lip (Upper & Lower)', '', [['Single session', 120, 0, ''], ['Package of 3', 252, 360, 'BLACK FRIDAY 30% OFF', 176.4], ['Package of 5', 420, 600, 'BLACK FRIDAY 30% OFF', 294], ['Package of 8', 672, 960, 'BLACK FRIDAY 30% OFF', 470.4]]],
    ['LHR - Lip (Upper)', '', [['Single session', 90, 0, ''], ['Package of 3', 189, 270, 'BLACK FRIDAY 30% OFF', 132.3], ['Package of 5', 315, 450, 'BLACK FRIDAY 30% OFF', 220.5], ['Package of 8', 504, 720, 'BLACK FRIDAY 30% OFF', 352.8]]],
    ['LHR - Sideburns', '', [['Single session', 120, 0, ''], ['Package of 3', 252, 360, 'BLACK FRIDAY 30% OFF', 176.4], ['Package of 5', 420, 600, 'BLACK FRIDAY 30% OFF', 294], ['Package of 8', 672, 960, 'BLACK FRIDAY 30% OFF', 470.4]]],
    ['Eyebrows', '', [['Single session', 120, 0, ''], ['Package of 3', 252, 360, 'BLACK FRIDAY 30% OFF', 176.4], ['Package of 5', 420, 600, 'BLACK FRIDAY 30% OFF', 294]]],
    ['Entire Neck', '', [['Single session', 250, 0, ''], ['Package of 3', 525, 750, 'BLACK FRIDAY 30% OFF', 367.5], ['Package of 5', 875, 1250, 'BLACK FRIDAY 30% OFF', 612.5], ['Package of 8', 1400, 2000, 'BLACK FRIDAY 30% OFF', 980]]],
    ['LHR - Neck (Front)', '', [['Single session', 150, 0, ''], ['Package of 3', 315, 450, 'BLACK FRIDAY 30% OFF', 220.5], ['Package of 5', 525, 750, 'BLACK FRIDAY 30% OFF', 367.5], ['Package of 8', 840, 1200, 'BLACK FRIDAY 30% OFF', 588]]],
    ['LHR - Neck (Back)', '', [['Single session', 150, 0, ''], ['Package of 3', 315, 450, 'BLACK FRIDAY 30% OFF', 220.5], ['Package of 5', 525, 750, 'BLACK FRIDAY 30% OFF', 367.5], ['Package of 8', 840, 1200, 'BLACK FRIDAY 30% OFF', 588]]],
    ['Areola', '', [['Single session', 120, 0, ''], ['Package of 3', 252, 360, 'BLACK FRIDAY 30% OFF', 176.4], ['Package of 5', 420, 600, 'BLACK FRIDAY 30% OFF', 294], ['Package of 8', 672, 960, 'BLACK FRIDAY 30% OFF', 470.4]]],
    ['LHR - Feet & Toes', '', [['Single session', 150, 0, ''], ['Package of 3', 315, 450, 'BLACK FRIDAY 30% OFF', 220.5], ['Package of 5', 525, 750, 'BLACK FRIDAY 30% OFF', 367.5], ['Package of 8', 840, 1200, 'BLACK FRIDAY 30% OFF', 588]]],
    ['LHR - Shoulders', '', [['Single session', 190, 0, ''], ['Package of 3', 399, 570, 'BLACK FRIDAY 30% OFF', 279.3], ['Package of 5', 665, 950, 'BLACK FRIDAY 30% OFF', 465.5], ['Package of 8', 1064, 1520, 'BLACK FRIDAY 30% OFF', 744.8]]],
    ['LHR - Underarms', '', [['Single session', 150, 0, ''], ['Package of 3', 315, 450, 'BLACK FRIDAY 30% OFF', 220.5], ['Package of 5', 525, 750, 'BLACK FRIDAY 30% OFF', 367.5], ['Package of 8', 840, 1200, 'BLACK FRIDAY 30% OFF', 588]]],
  ] },
  { id: 'laser-vaginal-tightening', name: 'Laser Vaginal Tightening', blurb: '', items: [
    ['Vaginal Tightening', '', [['Single session', 1250, 0, ''], ['Package of 3', 2625, 3750, 'BLACK FRIDAY 30% OFF', 1837.5], ['Package of 6', 5250, 7500, 'BLACK FRIDAY 30% OFF', 3675]]],
  ] },
  { id: 'coolsculpting-tight-sculpting', name: 'Coolsculpting & Tight Sculpting', blurb: '', items: [
    ['Regular Treatment Zone', '', [['Single zone', 850, 0, ''], ['2 zones', 1360, 1700, 'BLACK FRIDAY 20% OFF', 952], ['4 zones and more', 2720, 3400, 'BLACK FRIDAY 20% OFF', 1904], ['8 zones', 4760, 6800, 'BLACK FRIDAY 30% OFF', 3332]]],
    ['Coolsculpting Mini', '', [['Single zone', 1000, 0, ''], ['2 zones', 1600, 2000, 'BLACK FRIDAY 20% OFF', 1120], ['4 zones and more', 3200, 4000, 'BLACK FRIDAY 20% OFF', 2240], ['8 zones', 5600, 8000, 'BLACK FRIDAY 30% OFF', 3920]]],
    ['Coolsculpting Smooth', '', [['Single zone', 1000, 0, ''], ['2 zones', 1600, 2000, 'BLACK FRIDAY 20% OFF', 1120], ['4 zones and more', 3200, 4000, 'BLACK FRIDAY 20% OFF', 2240], ['8 zones', 5600, 8000, 'BLACK FRIDAY 30% OFF', 3920]]],
    ['Coolsculpting Double', '', [['Single zone', 1600, 0, ''], ['2 zones', 2560, 3200, 'BLACK FRIDAY 20% OFF', 1792], ['4 zones and more', 5120, 6400, 'BLACK FRIDAY 20% OFF', 3584], ['8 zones', 8960, 12800, 'BLACK FRIDAY 30% OFF', 6272]]],
    ['Tight Sculpting - Small Area', '', [['Single session', 600, 0, ''], ['Package of 3', 1260, 1800, 'BLACK FRIDAY 30% OFF', 882], ['Package of 6', 2520, 3600, 'BLACK FRIDAY 30% OFF', 1764], ['Package of 8', 3360, 4800, 'BLACK FRIDAY 30% OFF', 2352]]],
    ['Tight Sculpting - Medium Area', '', [['Single session', 800, 0, ''], ['Package of 3', 1680, 2400, 'BLACK FRIDAY 30% OFF', 1176], ['Package of 6', 3360, 4800, 'BLACK FRIDAY 30% OFF', 2352], ['Package of 8', 4480, 6400, 'BLACK FRIDAY 30% OFF', 3136]]],
  ] },
  { id: 'snoring-treatment', name: 'Snoring Treatment', blurb: '', items: [
    ['Snoring Treatment', '', [['Single session', 450, 0, ''], ['Package of 3', 1080, 1350, '20% OFF'], ['Package of 6', 1890, 2700, '30% OFF']]],
  ] },
  { id: 'toenail-fungus-removal', name: 'Toenail Fungus Removal', blurb: '', items: [
    ['TOENAIL FUNGUS REMOVAL', '', [['Single session', 300, 0, ''], ['Package of 3', 719, 900, '20% OFF'], ['Package of 6', 1260, 1800, '30% OFF']]],
  ] },
  { id: 'latisse', name: 'Latisse', blurb: '', items: [
    ['Latisse', '', [['Single session', 245, 0, '']]],
  ] },
];
/* the sale running on the live site when this list was read (null when none): its checkout code and percentage */
const PRICE_SALE = {"code": "PLUS30", "percent": 30, "phase": "black-friday", "end": "2026-12-08T04:59:59+00:00"};
/* monthly specials above the price list (round 22): Ray's "Exclusive monthly specials" cards (NDM-Ray-Dev, commit 8b887a5,
   the version in the designer's screenshot). Each card's Buy opens its category in the price list: [name, price, category id] */
const PRICE_SPECIALS = { title: 'Exclusive monthly specials', sub: 'Save on cosmetic treatment, apply for financing now', note: 'for selected packages', items: [
  /* the live page's cards, in its order (the clinic's Monthly specials list in WordPress, 2026-11-25): [name, price list target,
     treatment or nothing (the whole category)]. Price, unit and offer are read from the price list below, exactly as its own
     rows show them (user, 2026-11-25: every price on the site is the Pricing page's) */
  ['Laser Hair Removal', 'pg-laser-hair-removal'], ['Lip Filler', 'pg-dermal-fillers', 'Lip Enhancement'],
  ['Microneedling', 'pg-microneedling'], ['Chemical Peel', 'pg-chemical-peel'],
  ['CoolSculpting', 'pg-coolsculpting-tight-sculpting', 'Regular Treatment Zone'], ['Sculptra', 'pg-skin-booster-and-bio-stimulators', 'Bio-Stimulator – Sculptra'],
  ['PRP Hair Restoration', 'pg-hair-loss', 'PRP Scalp'], ['PRP Face', 'pg-microneedling', 'Microneedling with PRP - Face'],
] };
