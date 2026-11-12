"""Port the CSS a prototype build script adds to ONE page into src/styles/page-<name>.css.

The prototype gives each page its own <style> block; this app has one stylesheet. So every selector is tied to
<main data-page="<name>"> with :where(), which adds no specificity: the rules rank exactly as they did there.
Rules are copied from the prototype's sources by this script, never retyped.

usage (from web/): python3 scripts/port_page_css.py            # writes every page listed in PAGES
"""
import re
from pathlib import Path

SRC = Path(__file__).resolve().parents[2] / "src"
OUT = Path(__file__).resolve().parents[1] / "src" / "styles"


def split_top(s, sep=","):
    out, depth, cur = [], 0, ""
    for ch in s:
        if ch in "([":
            depth += 1
        if ch in ")]":
            depth -= 1
        if ch == sep and depth == 0:
            out.append(cur)
            cur = ""
        else:
            cur += ch
    out.append(cur)
    return out


def scoper(page):
    where = f':where(main[data-page="{page}"])'

    def one(sel):
        sel = sel.strip()
        m = re.match(r"(html\s+)?main(?![\w-])", sel)
        if m:
            return (m.group(1) or "") + f'main:where([data-page="{page}"])' + sel[m.end() :]
        return where + " " + sel

    def scope(text):
        out, i, n = "", 0, len(text)
        while i < n:
            if text[i : i + 2] == "/*":
                j = text.index("*/", i) + 2
                out += text[i:j]
                i = j
                continue
            if text[i].isspace():
                out += text[i]
                i += 1
                continue
            j = text.index("{", i)
            head = text[i:j]
            depth, k = 1, j + 1
            while depth:
                depth += {"{": 1, "}": -1}.get(text[k], 0)
                k += 1
            inner = text[j + 1 : k - 1]
            if head.strip().startswith("@media"):
                out += head + "{" + scope(inner) + "}"
            elif head.strip().startswith("@"):
                out += head + "{" + inner + "}"
            else:
                out += ",".join(one(x) for x in split_top(head)) + "{" + inner + "}"
            i = k
        return out

    return scope, where


def py_block(text, name):
    """A triple-quoted CSS string assigned to `name` in a build script."""
    m = re.search(r"\n" + name + r" = r?'''\n(.*?)\n'''", text, re.S)
    assert m, name
    return m.group(1).replace("\\\\", "\\")


def js_block(text, name):
    """A template-literal CSS string assigned to `name` in a .jsx file."""
    m = re.search(r"const " + name + r" = `\n?(.*?)\n?`;", text, re.S)
    assert m, name
    return m.group(1)


def build(page, title, head, body):
    """head: CSS blocks the build script puts in the page's <style>; body: (label, css) style blocks its sections carry."""
    scope, where = scoper(page)
    out = f"""/* {title}. Copied rule for rule from the prototype by scripts/port_page_css.py: do not edit by hand.
   The prototype adds these rules to this page only, so every selector is tied to <main data-page="{page}">
   with :where(), which adds no specificity: the rules rank exactly as they did there. */
"""
    out += "\n".join(scope(b) for b in head)
    out += f"""
/* the pricing page blurs what passes under its open category title; here that title is not sticky */
{where} .pr-group.is-open>.pr-ghead{{-webkit-backdrop-filter:none;backdrop-filter:none}}
"""
    for label, css in body:
        out += f"/* {label} */\n" + scope(css) + "\n"
    # The CSS minifier rewrites "linear-gradient(0deg, a 0%, b 55%)" into its mirror image, which renders the same but
    # no longer reads the same in the comparison with the prototype. A variable (always 0deg) keeps it as written.
    out = out.replace("linear-gradient(0deg,", "linear-gradient(var(--up,0deg),")
    (OUT / f"page-{page}.css").write_text(out)
    print(f"page-{page}.css", len(out))


treatment = (SRC / "treatment-ui.jsx").read_text()
procedure = (SRC / "procedure-ui.jsx").read_text()
media = (SRC / "media-ui.jsx").read_text()
JOURNEY = ("start your journey", js_block(procedure, "JR_CSS"))
VISIT = ("visit us", js_block(treatment, "TX_VISIT_CSS"))
MORE = ('results: the "more cases" tile', js_block(treatment, "TX_MORE_CSS"))

aptos = (SRC / "build_aptos.py").read_text()
build("aptos", "Aptos Thread Lift page", [py_block(aptos, "css"), py_block(aptos, "SPACING")], [MORE, VISIT, JOURNEY])

botox = (SRC / "build_procedure.py").read_text()
build("botox", "Botox page", [py_block(botox, "css"), js_block(media, "MEDIA_CSS"), py_block(botox, "SPACING")], [VISIT, JOURNEY])

concern = (SRC / "build_concern.py").read_text()
concern_ui = (SRC / "concern-ui.jsx").read_text()
extra = re.search(r"css = CSS_PROC \+ SPACING \+ CN_CSS \+ '''\n(.*?)\n'''", concern, re.S).group(1)
build("concern", "Concern pages (Wrinkles & fine lines)", [py_block(botox, "css"), py_block(botox, "SPACING"), js_block(concern_ui, "CN_CSS"), extra], [VISIT, JOURNEY])

about = (SRC / "build_about.py").read_text()
build("about", "About page", [py_block(about, "css")], [])

build("cart", "Cart, checkout and order confirmation pages", [py_block((SRC / "build_cart.py").read_text(), "CSS")], [])
build("blog", "Blog page", [py_block((SRC / "build_blog.py").read_text(), "css")], [])
build("article", "Blog article page", [py_block((SRC / "build_article.py").read_text(), "css")], [])

legal = (SRC / "build_legal.py").read_text()
build("legal", "Legal pages (Privacy, Terms, Refunds)", [py_block(legal, "css")], [])
# its print rule hides the header and the footer, which sit outside <main>: tie that rule to the page through <body>
f = OUT / "page-legal.css"
css = f.read_text()
a = css.index("@media print")
f.write_text(css[:a] + css[a:].replace(':where(main[data-page="legal"]) ', ':where(body:has(main[data-page="legal"])) '))
