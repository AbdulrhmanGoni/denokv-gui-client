#!/usr/bin/env bash

# This script downloads the missing `denokv-x86_64-apple-darwin` binary of `@deno/kv-darwin-x64` package for mac-x64 build.
# It requires GITHUB_TOKEN environment variable to be set.

set -e

if [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: GITHUB_TOKEN environment variable is not set."
  exit 1
fi

# Get the latest release info from the repository
releaseUrl="https://api.github.com/repos/AbdulrhmanGoni/denokv-x86_64-apple-darwin-binary-build/releases/latest"
curl -H "Authorization: Bearer $GITHUB_TOKEN" -sSL --retry 3 --retry-delay 3 "$releaseUrl" -o release.json

# Check release.json exists and is not empty
if [ ! -s release.json ]; then
  echo "Failed to download release info into release.json"
  exit 1
fi

# Extract the download URL of the first and only asset
download_url=$(jq -r '.assets[0].browser_download_url' release.json)
if [[ -z "$download_url" || "$download_url" == "null" ]]; then
  echo "Failed to extract 'browser_download_url' from 'release.json' file"
  cat release.json
  exit 1
fi

# Download "deno-kv-napi.darwin-x64.node" asset
binaryDist="./node_modules/@deno/kv-darwin-x64/deno-kv-napi.darwin-x64.node"
echo "Downloading binary from $download_url to $binaryDist..."
curl -H "Authorization: Bearer $GITHUB_TOKEN" -L --retry 3 --retry-delay 3 -o "$binaryDist" "$download_url"

echo "Successfully downloaded 'denokv-x86_64-apple-darwin' binary."
