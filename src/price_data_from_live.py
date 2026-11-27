"""Rewrites PRICE_CATS (and PRICE_SALE) in src/pricing-data.jsx from the live price list, so the prototype shows what
newdermamedlaserclinic.com/pricing shows (user, 2026-11-25).

  curl -s -H 'Accept: application/json' -A 'Mozilla/5.0' https://newdermamedlaserclinic.com/react/wp-json/ndm/v1/pricing > /tmp/pricing.json
  python3 src/price_data_from_live.py /tmp/pricing.json [src/pricing-data.jsx]

Each option is [label, price, regular price or 0, tag, price with the checkout code (only when the code applies)], read the
way the Next.js site reads it (web/src/lib/pricing-view.ts, toCategories): the variation's own promo text, else the
product's label; the regular price only while WooCommerce says the line is on sale. Nothing is typed by hand.
"""
import json
import re
import sys

SINGLE_LABEL = "Price"


def num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return float("nan")


def clean(n):
    n = round(n, 2)
    return int(n) if n == int(n) else n


def js(v):
    return json.dumps(v, ensure_ascii=False).replace("'", "\\'").replace('"', "'") if isinstance(v, str) else json.dumps(v)


def option(f, label, tag):
    price = num(f.get("price"))
    regular = num(f.get("regularPrice"))
    was = regular if f.get("onSale") and regular > price else 0
    row = [label, clean(price), clean(was) if was else 0, tag or ""]
    camp = f.get("campaign") or {}
    if camp.get("code") and camp.get("codePrice") not in (None, ""):
        row.append(clean(num(camp["codePrice"])))
    return row


def main():
    tree = json.load(open(sys.argv[1]))
    out = sys.argv[2] if len(sys.argv) > 2 else "src/pricing-data.jsx"
    lines = ["const PRICE_CATS = ["]
    total = 0
    for c in tree["categories"]:
        items = []
        extras = []
        for p in c["products"]:
            if p.get("extra"):
                # a special line under the options (the Aptos model call assessment): never a treatment, never in a "from" price
                lab = p.get("label") or {}
                price = num(p.get("price"))
                if price == price and price >= 0:
                    extras.append((p["name"], p.get("note") or "", clean(price), lab.get("text") if lab.get("enabled") and lab.get("text") else ""))
                continue
            lab = p.get("label") or {}
            tag = lab.get("text") if lab.get("enabled") and lab.get("text") else ""
            if p.get("variations"):
                opts = [option(v, v["label"], (v.get("promo") or {}).get("text") if (v.get("promo") or {}).get("enabled") and (v.get("promo") or {}).get("text") else tag) for v in p["variations"]]
            else:
                opts = [option(p, SINGLE_LABEL, tag)]
            opts = [o for o in opts if o[1] == o[1] and o[1] >= 0]
            if opts:
                items.append((p["name"], p.get("note") or "", opts))
        if not items:
            continue
        total += len(items)
        ext = (", extras: [" + ", ".join("[" + ", ".join(js(x) for x in e) + "]" for e in extras) + "]") if extras else ""
        head = f"  {{ id: {js(c['slug'])}, name: {js(c['name'])}{', unit: true' if c.get('perUnit') else ''}, blurb: {js(c.get('description') or '')}{ext}, items: ["
        lines.append(head)
        for name, note, opts in items:
            rows = ", ".join("[" + ", ".join(js(x) for x in o) + "]" for o in opts)
            lines.append(f"    [{js(name)}, {js(note)}, [{rows}]],")
        lines.append("  ] },")
    lines.append("];")
    camp = tree.get("campaign")
    sale = "null" if not camp or camp.get("over") else json.dumps({"code": camp["code"], "percent": camp["percent"], "phase": camp.get("phase"), "end": camp.get("end")})
    block = "\n".join(lines) + f"\n/* the sale running on the live site when this list was read (null when none): its checkout code and percentage */\nconst PRICE_SALE = {sale};\n"

    src = open(out).read()
    start = src.index("const PRICE_CATS = [")
    end = src.index("/* monthly specials above the price list")
    head = src[:start]
    head = re.sub(r"/\* item: .*?\*/\n", "/* item: [name, note, [[option, price, regular price or 0, badge, price with the checkout code], ...]]; extras (special lines under the options, never in a \"from\" price): [[name, note, price, tag], ...]; read from the live price list by src/price_data_from_live.py */\n", head, count=1, flags=re.S)
    open(out, "w").write(head + block + src[end:])
    print(f"{len(tree['categories'])} categories, {total} treatments, sale {sale}")


if __name__ == "__main__":
    main()
