#!/bin/bash

# Define the name of the output file
PACKAGE_NAME="/tmp/strava-pace-converter.xpi"

# Clean up any old builds
echo "Cleaning up old builds..."
rm -f $PACKAGE_NAME

# Create the zip (xpi) file
# -j: junk the paths (don't create a 'strava-fixer' folder inside the zip)
# -r: recursive
echo "Building $PACKAGE_NAME..."

zip -r $PACKAGE_NAME . -x \
    "images/*" \
    "*.sh" \
    "*.md" \
    "*.xcf" \
    "*.html" \
    ".git/*" \
    ".DS_Store" \
    "LICENSE"

echo "-----------------------------------"
echo "Done! Upload $PACKAGE_NAME to Mozilla."
