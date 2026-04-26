#!/bin/bash


# Check if commit message was provided
if [ -z "$1" ]; then
  echo "Usage: ./build.sh \"commit message\""
  exit 1
fi
mkdir -p src

COMMIT_MSG="$1"



# GIT OPERATIONS


git init
git add .
git commit -m "$COMMIT_MSG"

git push


# METADATA


COMMIT_COUNT=$(git rev-list --count HEAD)
AUTHOR=$(git log -1 --pretty=format:'%an')
FILE_COUNT=$(git ls-files | wc -l)
DATE=$(date "+%Y-%m-%d")



echo "BUILD: $DATE | CC: $COMMIT_COUNT | BCA: $AUTHOR | FC: $FILE_COUNT | MSG: $COMMIT_MSG" > /src/version.txt

echo "Done. version.txt updated to $NEW_VERSION"