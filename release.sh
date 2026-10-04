#!/bin/bash

FIREFOX_PACKAGE="/tmp/strava-pace-converter.xpi"
CHROME_PACKAGE="/tmp/strava-pace-converter-chrome.zip"

echo "Cleaning up old builds..."
rm -f "$FIREFOX_PACKAGE" "$CHROME_PACKAGE"

echo "Building Firefox extension..."
zip -r "$FIREFOX_PACKAGE" . -x \
    "images/*" \
    "*.sh" \
    "*.md" \
    "*.xcf" \
    ".git/*" \
    ".DS_Store" \
    "LICENSE"

echo "Building Chrome extension..."

# Create a temporary copy of the project
BUILD_DIR=$(mktemp -d)
cp -r . "$BUILD_DIR/"

# Remove Firefox-specific manifest fields
python3 - "$BUILD_DIR/manifest.json" <<'PY'
import json
import sys

path = sys.argv[1]

with open(path) as f:
    manifest = json.load(f)

manifest.pop("browser_specific_settings", None)
manifest.pop("developer", None)

with open(path, "w") as f:
    json.dump(manifest, f, indent=2)
    f.write("\n")
PY

(
    cd "$BUILD_DIR"

    zip -r "$CHROME_PACKAGE" . -x \
        "images/*" \
        "*.sh" \
        "*.md" \
        "*.xcf" \
        ".git/*" \
        ".DS_Store" \
        "LICENSE"
)

rm -rf "$BUILD_DIR"

echo "-----------------------------------"
echo "Done!"
echo "Firefox: $FIREFOX_PACKAGE"
echo "Chrome:  $CHROME_PACKAGE"
