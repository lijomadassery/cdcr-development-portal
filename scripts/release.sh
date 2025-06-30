#!/bin/bash

# CDCR Backstage Release Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're on the master branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "master" ]; then
    print_error "Must be on master branch to create a release. Current branch: $current_branch"
    exit 1
fi

# Check if working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    print_error "Working directory is not clean. Please commit all changes first."
    git status --short
    exit 1
fi

# Get current version
if [ -f "VERSION" ]; then
    current_version=$(cat VERSION)
else
    current_version="0.0.0"
fi

print_status "Current version: $current_version"

# Parse version type argument
version_type=${1:-patch}

# Parse current version
IFS='.' read -r -a version_parts <<< "$current_version"
major=${version_parts[0]}
minor=${version_parts[1]}
patch=${version_parts[2]}

# Calculate new version
case $version_type in
    major)
        major=$((major + 1))
        minor=0
        patch=0
        ;;
    minor)
        minor=$((minor + 1))
        patch=0
        ;;
    patch)
        patch=$((patch + 1))
        ;;
    *)
        print_error "Invalid version type: $version_type. Use: major, minor, or patch"
        exit 1
        ;;
esac

new_version="$major.$minor.$patch"
tag_name="v$new_version"

print_status "Creating release: $new_version"

# Update VERSION file
echo "$new_version" > VERSION

# Create commit
git add VERSION
git commit -m "chore: bump version to $new_version"

# Create and push tag
git tag -a "$tag_name" -m "Release $new_version

Features in this release:
- Production-ready Backstage deployment
- CDCR Dark theme as default
- ZScaler proxy configuration
- Multi-cluster Kubernetes support

🤖 Generated with [Claude Code](https://claude.ai/code)"

# Push changes and tag
git push origin master
git push origin "$tag_name"

print_status "✅ Release $new_version created successfully!"
print_status "🐳 Docker images will be built with tags:"
print_status "   - ghcr.io/lijomadassery/backstage:$new_version"
print_status "   - ghcr.io/lijomadassery/backstage:$major.$minor"
print_status "   - ghcr.io/lijomadassery/backstage:latest"

echo
print_warning "🏗️  GitHub Actions is building the Docker images now."
print_warning "📋 Give this to the platform engineer: $tag_name"