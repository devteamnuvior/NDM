#!/usr/bin/env bash
# First-time setup of the local WordPress: start the containers, install WordPress, and leave only
# what a headless backend needs. Safe to run again: every step checks before it changes anything.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "cms/.env is missing. Copy .env.example to .env and set the passwords first." >&2
  exit 1
fi
set -a; . ./.env; set +a

for name in WP_ADMIN_USER WP_ADMIN_PASSWORD WP_ADMIN_EMAIL NDM_CMS_URL; do
  if [ -z "${!name:-}" ] || [[ "${!name}" == change-me* ]]; then
    echo "Set ${name} in cms/.env before running setup." >&2
    exit 1
  fi
done

wp() { docker compose run --rm -T cli wp "$@"; }

echo "Starting the containers..."
docker compose up -d --wait db
docker compose up -d wordpress

echo "Waiting for WordPress files and the database..."
for _ in $(seq 1 60); do
  if wp db check >/dev/null 2>&1; then break; fi
  sleep 2
done

if wp core is-installed >/dev/null 2>&1; then
  echo "WordPress is already installed."
else
  echo "Installing WordPress..."
  wp core install \
    --url="${NDM_CMS_URL}" \
    --title="${WP_SITE_TITLE:-NewDermaMed CMS}" \
    --admin_user="${WP_ADMIN_USER}" \
    --admin_password="${WP_ADMIN_PASSWORD}" \
    --admin_email="${WP_ADMIN_EMAIL}" \
    --skip-email
fi

echo "Applying the headless baseline..."
# pretty permalinks: the REST API answers at /wp-json/
wp rewrite structure '/%postname%/' >/dev/null
# no comments, pingbacks or open registration on a headless backend
wp option update default_comment_status closed >/dev/null
wp option update default_ping_status closed >/dev/null
wp option update default_pingback_flag 0 >/dev/null
wp option update users_can_register 0 >/dev/null
# plugins that ship with WordPress and are not needed
wp plugin delete hello akismet >/dev/null 2>&1 || true
# the site's own theme (WordPress requires one; it never renders, see the ndm-headless plugin); the rest go
wp theme activate ndm-headless >/dev/null
wp theme delete --all >/dev/null 2>&1 || true

echo "Setting up WooCommerce for the Pricing page..."
# WooCommerce holds the price list (products, variations, categories); ndm-pricing serves it to the site
wp plugin is-installed woocommerce >/dev/null 2>&1 || wp plugin install woocommerce >/dev/null
wp plugin activate woocommerce ndm-pricing >/dev/null
wp option update woocommerce_currency CAD >/dev/null
wp option update woocommerce_default_country "CA:ON" >/dev/null
# no store pages exist on this host, so there is nothing for the setup wizard to build
wp option update woocommerce_onboarding_profile '{"skipped":true}' --format=json >/dev/null

# the website's own account: it can place order requests and nothing else (role ndm_site, made by ndm-pricing)
if ! wp user get ndm-site --field=ID >/dev/null 2>&1; then
  wp user create ndm-site site@example.test --role=ndm_site --user_pass="$(openssl rand -hex 24)" >/dev/null
  echo "Created the website account ndm-site. Give the Next.js server its application password:"
  echo "  docker compose run --rm cli wp user application-password create ndm-site website --porcelain"
  echo "  then set WORDPRESS_AUTH_USER=ndm-site and WORDPRESS_AUTH_APP_PASSWORD in web/.env.local"
fi

echo
echo "Done."
echo "  Admin:    ${NDM_CMS_URL}/wp-admin/"
echo "  REST API: ${NDM_CMS_URL}/wp-json/"
echo "  Health:   ${NDM_CMS_URL}/wp-json/ndm/v1/health"
