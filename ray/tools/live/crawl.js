// Crawl the live site from inside the browser (paste into the DevTools console on https://newdermamedlaserclinic.com/
// or https://shop.newdermamedlaserclinic.com/; the servers answer 403 to curl, so the pages are read from a real browser).
// It reads the sitemaps, fetches every page's HTML, the WordPress REST lists (pages, posts, products, categories, menus /
// brands) and then downloads one gzipped JSON: { site, crawled, lists: {sitemap: [urls]}, rest: {...}, fails: [], pages: {url: {status, html}} }.
// Next steps (from the project folder): python3 -I tools/live/split.py <json.gz> src/live/main  (or src/live/shop), then the
// extract_*.py scripts write src/live/*.json, and the build_live_*.py scripts build the pages. Chrome blocks a second
// automatic download from a site: allow downloads for the site in the address bar if the file does not appear.
(async () => {
  const out = { site: location.origin, crawled: new Date().toISOString(), lists: {}, rest: {}, fails: [], pages: {} };
  const text = async (u) => { const r = await fetch(u, { credentials: 'omit' }); return [r.status, await r.text()]; };
  const json = async (u) => { const r = await fetch(u, { credentials: 'omit' }); return r.ok ? r.json() : null; };
  const idx = (await text('/sitemap_index.xml'))[1];
  const maps = [...idx.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const urls = new Set([location.origin + '/']);
  for (const m of maps) {
    const x = (await text(m))[1];
    const list = [...x.matchAll(/<loc>([^<]+)<\/loc>/g)].map((k) => k[1]).filter((u) => !/\.(jpe?g|png|webp|gif|svg|mp4)$/i.test(u));
    out.lists[m.split('/').pop()] = list; list.forEach((u) => urls.add(u));
  }
  const all = async (path) => { const rows = []; for (let p = 1; p < 50; p++) { const r = await json(`${path}${path.includes('?') ? '&' : '?'}per_page=100&page=${p}`); if (!r || !r.length) break; rows.push(...r); if (r.length < 100) break; } return rows; };
  out.rest.pages = await all('/wp-json/wp/v2/pages?status=publish');
  out.rest.posts = await all('/wp-json/wp/v2/posts?status=publish');
  out.rest.products = await all('/wp-json/wc/store/v1/products');
  out.rest.categories = await all('/wp-json/wc/store/v1/products/categories');
  out.rest.brands = (await json('/wp-json/wc/store/v1/products/brands?per_page=100')) || [];
  out.rest.menus = (await json('/wp-json/wp/v2/menus')) || {};
  const list = [...urls]; let i = 0;
  const worker = async () => { while (i < list.length) { const u = list[i++]; try { const [status, html] = await text(u); out.pages[u] = { status, html }; } catch (e) { out.fails.push([u, String(e)]); } } };
  await Promise.all([worker(), worker(), worker(), worker()]);
  const raw = new Blob([JSON.stringify(out)]);
  const gz = await new Response(raw.stream().pipeThrough(new CompressionStream('gzip'))).blob();
  const a = document.createElement('a'); a.href = URL.createObjectURL(gz); a.download = (location.host.startsWith('shop.') ? 'ndm-shop' : 'ndm-live-site') + '.json.gz'; document.body.appendChild(a); a.click(); a.remove();
  console.log('pages', Object.keys(out.pages).length, 'fails', out.fails.length, 'bytes', gz.size);
})();
