#!/usr/bin/env bash
set -euo pipefail

# Rotates a Firebase Admin service account key and prints JSON to stdout.
# Requires: gcloud auth configured with permissions to manage service account keys.
# Usage:
#   GOOGLE_PROJECT_ID=... \
#   FIREBASE_SA_EMAIL=... \
#   ./scripts/rotate_firebase_key.sh > /tmp/firebase_key.json

: "${GOOGLE_PROJECT_ID:?Missing GOOGLE_PROJECT_ID}"
: "${FIREBASE_SA_EMAIL:?Missing FIREBASE_SA_EMAIL}"

# Create a new key
KEY_JSON=$(gcloud iam service-accounts keys create /dev/stdout \
  --iam-account="${FIREBASE_SA_EMAIL}" \
  --project="${GOOGLE_PROJECT_ID}")

echo "${KEY_JSON}"

# Optional: delete oldest keys (keep last 2)
# Uncomment to enforce retention.
# EXISTING_KEYS=$(gcloud iam service-accounts keys list \
#   --iam-account="${FIREBASE_SA_EMAIL}" \
#   --project="${GOOGLE_PROJECT_ID}" \
#   --format="value(name)")
#
# COUNT=$(echo "${EXISTING_KEYS}" | wc -l | tr -d ' ')
# if [ "${COUNT}" -gt 2 ]; then
#   DELETE_KEYS=$(echo "${EXISTING_KEYS}" | head -n $((COUNT - 2)))
#   for KEY in ${DELETE_KEYS}; do
#     gcloud iam service-accounts keys delete "${KEY}" \
#       --iam-account="${FIREBASE_SA_EMAIL}" \
#       --project="${GOOGLE_PROJECT_ID}" \
#       --quiet
#   done
# fi
