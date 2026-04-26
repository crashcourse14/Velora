#!/bin/bash

# Check if commit message was provided
if [ -z "$1" ]; then
  echo "Usage: ./build.sh \"commit message\""
  exit 1
fi

COMMIT_MSG="$1"

# Get current date/time
DATE=$(date "+%Y-%m-%d %H:%M:%S")

# Run git commands
git init
git add .
git commit -m "$COMMIT_MSG"

# Push (assumes remote already exists)
git push

# Write version file
echo "Last build: $DATE" > src/version.txt

echo "Done. version.txt updated."