#!/usr/bin/env sh
# Tier 2 acceptance suite: litewrite + a real remoteStorage server + Playwright,
# all as containers. The single entry point for both a laptop and CI -
# `make accept` and `npm run test:accept` both just call this. See CLAUDE.md.
set -eu

compose="docker compose -f docker-compose.acceptance.yml"

cleanup() {
  status=$?
  if [ "$status" -ne 0 ]; then
    echo "--- acceptance stack failed (exit $status); container status and logs follow ---" >&2
    $compose ps --all || true
    $compose logs --no-color --timestamps || true
  fi
  $compose down --volumes --remove-orphans
}
trap cleanup EXIT

$compose build
# Pull the (large) tests image up front. Otherwise compose fetches it lazily
# once app/remotestorage are already up, and the concurrent pull+extract can
# starve their healthchecks of disk/CPU on a loaded CI runner.
$compose pull tests
$compose up --detach app remotestorage
$compose run --rm tests
