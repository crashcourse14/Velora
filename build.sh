#!/bin/bash

# Check if commit message was provided
if [ -z "$1" ]; then
  echo "Usage: ./build.sh \"commit message\""
  exit 1
fi

COMMIT_MSG="$1"

# Get current date/time
DATE=$(date "+%Y-%m-%d %H:%M:%S")

# Ensure src folder exists
mkdir -p src

VERSION_FILE="src/version.txt"

# VERSION SYSTEM (v1.0.0 style)

# If version file doesn't exist, start at v1.0.0
if [ ! -f "$VERSION_FILE" ]; then
  echo "v1.0.0" > "$VERSION_FILE"
fi

VERSION=$(cat "$VERSION_FILE")

# Extract version (remove leading "v")
VERSION=${VERSION#v}

IFS='.' read -r MAJOR MINOR PATCH <<< "$VERSION"

# Increment PATCH version each build
PATCH=$((PATCH + 1))

NEW_VERSION="v$MAJOR.$MINOR.$PATCH"

echo "$NEW_VERSION" > "$VERSION_FILE"


# GIT OPERATIONS


git init
git add .
git commit -m "$COMMIT_MSG"

git push


# METADATA


COMMIT_COUNT=$(git rev-list --count HEAD)
AUTHOR=$(git log -1 --pretty=format:'%an')
FILE_COUNT=$(git ls-files | wc -l)



echo "BUILD: $DATE | VERSION: $NEW_VERSION | CC: $COMMIT_COUNT | BCA: $AUTHOR | FC: $FILE_COUNT | MSG: $COMMIT_MSG" > src/version.txt

echo "Done. version.txt updated to $NEW_VERSION"