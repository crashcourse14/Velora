#!/bin/bash

# Check if commit message was provided
if [ -z "$1" ]; then
  echo "Usage: ./build.sh \"commit message\""
  exit 1
fi

COMMIT_MSG="$1"

# Get current date/time
DATE=$(date "+%Y-%m-%d %H:%M:%S")


git init
git add .
git commit -m "$COMMIT_MSG"

git push

COMMIT_COUNT=$(git rev-list --count HEAD)

# Write version file
echo "Latest Build: $DATE (CST) - Commit: $COMMIT_MSG - COMMITS: $COMMIT_COUNT" > src/version.txt

echo "Done. version.txt updated."