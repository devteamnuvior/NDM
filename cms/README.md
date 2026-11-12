# NewDermaMed CMS (headless WordPress)

WordPress is the content backend only. It serves data through its REST API; the Next.js app in
`../web` is the only frontend (pages, routing, SEO). There is no theme work here and there never
should be: no `header.php`, no templates, no page builder.

## What is in this folder

```
docker-compose.yml                 local WordPress 7.1 (PHP 8.3) + MariaDB 11.8 + wp-cli
.env.example                       local settings; copy to .env (ignored by git)
bin/setup.sh                       first-time install and headless baseline (safe to run again)
wp-content/mu-plugins/
  ndm-headless.php                 must-use plugin loader
  ndm-headless/includes/
    config.php                     settings from constants / environment, validated
    cors.php                       CORS allow-list for the REST API
    frontend.php                   no public pages: redirect to the Next.js site, noindex
    security.php                   XML-RPC off, users endpoint private, application passwords over HTTPS
    rest.php                       the site's own namespace, ndm/v1 (health check)
```

WordPress core, uploads and the database are not in git (they live in Docker volumes).

## Run it locally

```bash
cp .env.example .env      # then set the passwords and the admin user
./bin/setup.sh
```

- Admin: http://localhost:8080/wp-admin/
- REST API: http://localhost:8080/wp-json/
- Health: http://localhost:8080/wp-json/ndm/v1/health

Daily use: `docker compose up -d` / `docker compose stop`. wp-cli: `docker compose run --rm cli wp <command>`.
`docker compose down -v` deletes the local database and WordPress files.

## Settings

Read from constants in `wp-config.php` or from environment variables, never from the database.

| Name | Meaning |
|---|---|
| `NDM_FRONTEND_URL` | Address of the Next.js site. Any WordPress page request is redirected there. |
| `NDM_FRONTEND_ORIGINS` | Comma separated browser origins allowed by CORS. Exact origins only, never `*`. |
| `NDM_CMS_URL` | Address of WordPress itself (local compose file only; sets `WP_HOME` / `WP_SITEURL`). |
| `WP_ENVIRONMENT_TYPE` | `local`, `development`, `staging` or `production`. |

In production: plain `http` origins are refused, redirects to the site are permanent (301), and
application passwords need HTTPS.

## What the must-use plugin does

- **No frontend.** Posts, pages, archives, feeds and search on the WordPress host redirect to the same
  path on the Next.js site; `robots.txt` and an `X-Robots-Tag` header close the host to search engines.
- **CORS.** WordPress's default (repeat back any origin, with credentials) is replaced by the allow-list:
  read-only methods, no credentials. Server-to-server calls from Next.js are not affected by CORS.
- **Access.** Public content is readable without signing in; `/wp/v2/users` needs a signed-in caller;
  XML-RPC is off. Anything not public needs a WordPress user and an application password.
- **`ndm/v1/health`.** Says the backend is up, nothing else.

## Production (not set up yet)

Open decisions: where WordPress is hosted and the public address of the Next.js site. When they are
known, production needs: the `mu-plugins` folder deployed as is, the four settings above in its own
environment or `wp-config.php` (with `WP_ENVIRONMENT_TYPE=production`), its own database credentials
and salts, HTTPS, and `DISALLOW_FILE_EDIT`. Nothing in `.env` or `docker-compose.yml` is used there.
