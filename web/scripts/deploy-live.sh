#!/bin/bash
# Deploys the site on the live server (cloud.nuvior.com) without building into the folder the
# running site reads.
#
# The site is served from one of two build folders, web/.next-a or web/.next-b. Which one is written
# in web/.env.production (NEXT_DIST_DIR, read by next.config.ts). A deploy builds into the other
# folder while the site keeps running from the current one, and only after a successful build points
# the site at the new folder and restarts it. A failed build changes nothing, and if the site does
# not answer after the restart it is pointed back at the folder it ran from.
#
# Installed as /root/ndm-deploy.sh (root only: it uses Podman and systemctl). This copy in the
# repository is the reference; after changing it, install it again:
#   install -m 700 /home/newdermamedlaser/ndm-site/web/scripts/deploy-live.sh /root/ndm-deploy.sh
#
# Run:    nohup /root/ndm-deploy.sh > /root/ndm-build.log 2>&1 &
# Result: tail -1 /root/ndm-build.log   (DEPLOY-OK, DEPLOY-FAILED ..., or BUILD-ALREADY-RUNNING)

set -u

SITE=/home/newdermamedlaser/ndm-site
WEB=$SITE/web
ENV_FILE=$WEB/.env.production
ACCOUNT=newdermamedlaser
HEALTH=http://127.0.0.1:3000/react

exec 9> /run/ndm-deploy.lock
if ! flock -n 9 || pgrep -f 'next build' > /dev/null; then
  echo BUILD-ALREADY-RUNNING
  exit 1
fi

current=$(sed -n 's/^NEXT_DIST_DIR=//p' "$ENV_FILE" 2> /dev/null | tail -1)
current=${current:-.next}
if [ "$current" = ".next-a" ]; then next=.next-b; else next=.next-a; fi

point_at() {
  if [ -f "$ENV_FILE" ] && grep -q '^NEXT_DIST_DIR=' "$ENV_FILE"; then
    sed -i "s|^NEXT_DIST_DIR=.*|NEXT_DIST_DIR=$1|" "$ENV_FILE"
  else
    echo "NEXT_DIST_DIR=$1" >> "$ENV_FILE"
  fi
  chown 1005:1009 "$ENV_FILE"
  chmod 644 "$ENV_FILE"
}

answers() {
  for _ in $(seq 1 30); do
    [ "$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$HEALTH")" = "200" ] && return 0
    sleep 1
  done
  return 1
}

sudo -u "$ACCOUNT" -H git -C "$SITE" pull -q --ff-only || { echo "DEPLOY-FAILED git pull"; exit 1; }
sudo -u "$ACCOUNT" -H git -C "$SITE" log --oneline -1 | cut -c1-70
echo "running from $current, building into $next"

rm -rf "${WEB:?}/$next"
podman --root /root/ndm-build/storage --runroot /run/ndm-build run --rm --network host \
  --cpus 8 --memory 4g --user 1005:1009 -e HOME=/tmp -e NEXT_DIST_DIR="$next" \
  -v "$WEB":/app -w /app docker.io/library/node:22-bookworm-slim npx next build
built=$?

# the build adds its folder to tsconfig.json; keep the working tree clean for the next pull
sudo -u "$ACCOUNT" -H git -C "$SITE" checkout -- web/tsconfig.json

if [ $built -ne 0 ] || [ ! -f "$WEB/$next/BUILD_ID" ]; then
  rm -rf "${WEB:?}/$next"
  echo "DEPLOY-FAILED build (the site still runs from $current)"
  exit 1
fi

point_at "$next"
systemctl restart ndm-site
if answers; then
  echo "DEPLOY-OK $next"
  exit 0
fi

point_at "$current"
systemctl restart ndm-site
if answers; then
  echo "DEPLOY-FAILED the new build did not answer (back on $current)"
else
  echo "DEPLOY-FAILED the site does not answer on $current either"
fi
exit 1
