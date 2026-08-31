#!/usr/bin/env sh
# Tier 2 acceptance suite: litewrite + a real remoteStorage server + Playwright,
# all as containers. The single entry point for both a laptop and CI -
# `make accept` and `npm run test:accept` both just call this. See CLAUDE.md.
set -eu

compose="docker compose -f docker-compose.acceptance.yml"

cleanup() {
  $compose down --volumes --remove-orphans
}
trap cleanup EXIT

$compose build
$compose up --detach app remotestorage
$compose run --rm tests
