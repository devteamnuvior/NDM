#!/bin/sh
# Start a local web server for the NewDermaMed prototype and open the home page.
# Needs Python 3 (python.org) or Node.js (nodejs.org), and an internet connection for the CDN scripts and fonts.
cd "$(dirname "$0")/NDM" || exit 1
PORT="${PORT:-8080}"
URL="http://localhost:$PORT/index.html"
open_later() {
  ( sleep 1
    if command -v open >/dev/null 2>&1; then open "$URL"
    elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$URL"
    else echo "Open $URL in your browser."; fi ) &
}
echo "NewDermaMed prototype: $URL  (press Ctrl+C to stop)"
if command -v python3 >/dev/null 2>&1; then
  open_later; exec python3 -m http.server "$PORT"
elif command -v npx >/dev/null 2>&1; then
  open_later; exec npx --yes http-server -p "$PORT" -c-1 .
else
  echo "Python 3 or Node.js is needed to run a local server."
fi
