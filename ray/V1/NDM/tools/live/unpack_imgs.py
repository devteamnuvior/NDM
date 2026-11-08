"""Unpack an image bundle (json.gz of {url: {type,size,data(base64)}}) into files under <out dir>/<host>/<path>, verbatim bytes."""
import base64, gzip, json, os, sys, hashlib
src, out = sys.argv[1], sys.argv[2]
d = json.load(gzip.open(src, 'rt', encoding='utf-8'))
n = 0; total = 0
for url, v in d['imgs'].items():
    p = url.replace('https://', '')
    fp = os.path.join(out, p)
    os.makedirs(os.path.dirname(fp), exist_ok=True)
    data = base64.b64decode(v['data'])
    assert len(data) == v['size'], url
    open(fp, 'wb').write(data); n += 1; total += len(data)
print(src.split('/')[-1], n, 'files,', round(total / 1e6, 1), 'MB; fails:', d['fails'])
