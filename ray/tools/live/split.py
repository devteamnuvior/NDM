# split the crawl JSON into one HTML file per page (untouched) plus an index, so later steps can read pages one at a time
import json, os, re, sys, hashlib
src, out = sys.argv[1], sys.argv[2]
d = json.load(open(src, encoding='utf-8'))
os.makedirs(out, exist_ok=True)
idx = []
for u, p in d['pages'].items():
    path = re.sub(r'^https?://[^/]+/?', '', u).strip('/') or 'home'
    name = re.sub(r'[^a-z0-9/_-]+', '_', path.lower())
    fp = os.path.join(out, name + '.html')
    os.makedirs(os.path.dirname(fp), exist_ok=True)
    open(fp, 'w', encoding='utf-8').write(p['html'])
    idx.append({'url': u, 'file': name + '.html', 'status': p['status'], 'bytes': len(p['html']), 'md5': hashlib.md5(p['html'].encode('utf-8')).hexdigest()})
json.dump({'site': d['site'], 'crawled': d['crawled'], 'lists': d['lists'], 'pages': idx}, open(os.path.join(out, '_index.json'), 'w'), indent=1)
json.dump(d['rest'], open(os.path.join(out, '_rest.json'), 'w'), indent=1)
print(out, len(idx), 'pages written')
