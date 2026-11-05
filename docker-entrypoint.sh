#!/bin/sh
set -eu

if [ "$(id -u)" = "0" ]; then
  backup_dir="${BACKUP_DIR:-/app/backups}"
  mkdir -p "$backup_dir"
  chown -R nextjs:nodejs "$backup_dir"
  exec gosu nextjs "$@"
fi

exec "$@"
