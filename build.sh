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
AUTHOR=$(git log -1 --pretty=format:'%an')
FILE_COUNT=$(git ls-files | wc -l)

# Write version file
echo "BUILD: $DATE (CST) | COMMIT: $COMMIT_MSG | COMMIT COUNT: $COMMIT_COUNT | LATEST COMMIT AUTHOR: $AUTHOR | FILE COUNT: $FILE_COUNT " > src/version.txt

echo "Done. version.txt updated."