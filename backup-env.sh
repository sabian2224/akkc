#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# AKKC – encrypt the .env secrets file for off-VPS backup.
# The .env file is the ONLY irreplaceable local state on the VPS. This produces
# an encrypted copy you can safely store in a password manager / cloud drive.
#
#   ./backup-env.sh           Produce ./backups/env-<date>.gpg (symmetric, prompts for passphrase)
#
# Restore with:
#   gpg -d backups/env-YYYY-MM-DD.gpg > .env && chmod 600 .env
# ---------------------------------------------------------------------------
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -f .env ]; then
  echo "ERROR: .env not found in $(pwd)." >&2
  exit 1
fi

if ! command -v gpg >/dev/null 2>&1; then
  echo "ERROR: gpg not installed. Run: sudo apt-get install -y gnupg" >&2
  exit 1
fi

mkdir -p backups
out="backups/env-$(date +%F).gpg"

# Symmetric AES-256 encryption; you'll be prompted for a passphrase.
gpg --symmetric --cipher-algo AES256 --output "$out" .env
chmod 600 "$out"

echo "Encrypted backup written to: $out"
echo "Store this OFF the VPS (password manager / encrypted drive)."
echo "Restore: gpg -d $out > .env && chmod 600 .env"
