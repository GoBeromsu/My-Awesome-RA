#!/bin/sh

# Dev entrypoint for CLSI (non-sandboxed, no Docker-in-Docker)

# Skip Docker group setup (not needed for non-sandboxed compiles)

# compatibility: initial volume setup
mkdir -p /overleaf/services/clsi/cache && chown node:node /overleaf/services/clsi/cache
mkdir -p /overleaf/services/clsi/compiles && chown node:node /overleaf/services/clsi/compiles
mkdir -p /overleaf/services/clsi/output && chown node:node /overleaf/services/clsi/output

exec runuser -u node -- "$@"
