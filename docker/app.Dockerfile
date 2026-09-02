# Builds and serves litewrite for the acceptance stack (docker-compose.acceptance.yml).
# Not used for the live deploy, which publishes static files to gh-pages (see deploy.yml).
FROM node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293

WORKDIR /app

COPY package.json package-lock.json ./
# The ca-bundle secret is empty for everyone except a build running behind a
# TLS-inspecting proxy (it's wired to $NODE_EXTRA_CA_CERTS in
# docker-compose.acceptance.yml); only then does npm need to trust it.
RUN --mount=type=secret,id=ca-bundle sh -c '\
  if [ -s /run/secrets/ca-bundle ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/ca-bundle; fi; \
  npm ci \
'

COPY . .
RUN npm run build

EXPOSE 8000
CMD ["node", "scripts/server.js"]
