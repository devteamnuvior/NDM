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
# keep the one active default theme (WordPress requires one; it never renders, see the ndm-headless plugin)
wp theme delete --all >/dev/null 2>&1 || true

echo
echo "Done."
echo "  Admin:    ${NDM_CMS_URL}/wp-admin/"
echo "  REST API: ${NDM_CMS_URL}/wp-json/"
echo "  Health:   ${NDM_CMS_URL}/wp-json/ndm/v1/health"
