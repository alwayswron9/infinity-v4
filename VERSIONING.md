# Version Management System

This project includes a simple version management system that allows you to track and display version information, release dates, and changelogs.

## How It Works

1. Version files are stored in the `versions/` directory
2. Each version is defined in a Markdown file with a specific format (see below)
3. The system automatically determines the latest version and displays version history
4. Version information is accessible through a dedicated API endpoint at `/api/versions`
5. Versions are displayed in the Settings page under the "About" tab

## Creating a New Version

To create a new version:

1. Create a new Markdown file in the `versions/` directory with the filename pattern `vX.Y.Z.md` (e.g., `v1.0.0.md`)
2. Include the required frontmatter metadata at the top of the file
3. Document changes, known issues, and breaking changes in the appropriate sections

## Version File Format

Each version file should follow this format:

```markdown
---
version: 1.0.0
release_date: YYYY-MM-DD
---

# Version 1.0.0

## Summary
Brief description of this version.

## Changes
- Change 1
- Change 2
- Change 3

## Known Issues
- Issue 1
- Issue 2

## Breaking Changes
- Breaking change 1
- Breaking change 2
```

## Version Display

The version display component shows:

1. Version number with release date
2. Summary of the version
3. List of changes
4. List of known issues (if any)
5. List of breaking changes (if any)

The latest version is clearly labeled with a "Latest" tag.

## Implementation Details

- Version data is retrieved from the filesystem on the server side
- Client-side components fetch version data from the API endpoint
- Versions are sorted according to semantic versioning rules (newest first)
- The system is designed to work with Next.js server components and API routes 