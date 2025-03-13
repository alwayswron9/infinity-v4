# Infinity Documentation

This directory contains the markdown documentation for Infinity.

## Directory Structure

- `/docs/` - Main documentation directory
  - `/images/` - Images used in documentation
    - `/screenshots/` - UI screenshots
    - `/diagrams/` - Architecture and flow diagrams
    - `/icons/` - Icons used in the documentation
  - `index.md` - Documentation home page
  - `1-introduction.md` - Introduction to Infinity
  - `2-getting-started.md` - Getting started guide
  - And other documentation files...

## Adding Images

When adding screenshots, diagrams or icons:

1. Place images in the appropriate subdirectory under `/docs/images/`
2. Use relative paths in markdown files: `/docs/images/category/filename.png`
3. Keep images optimized for web (compress when possible)
4. Use descriptive filenames

## Documentation Format

All documentation files should:

1. Include frontmatter with title, description, and lastUpdated fields
2. Follow the structure of existing documents
3. Use markdown formatting consistently
4. Include appropriate headers, lists, and tables

## Rendering in the UI

To render these markdown files in the Infinity UI, we use [next-mdx-remote](https://github.com/hashicorp/next-mdx-remote) package. This needs to be installed:

```bash
npm install next-mdx-remote
```

Then create a documentation page component that loads and renders the markdown files:

```jsx
// src/app/documentation/[...slug]/page.tsx

import { MDXRemote } from 'next-mdx-remote/rsc'
import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'

export async function generateStaticParams() {
  // Logic to generate paths for all markdown files
  // ...
}

export default async function DocPage({ params }: { params: { slug: string[] } }) {
  const slug = params.slug?.join('/') || 'index'
  const filePath = path.join(process.cwd(), 'public', 'docs', `${slug}.md`)
  
  let source
  try {
    source = await fs.readFile(filePath, 'utf8')
  } catch (error) {
    return <div>Document not found</div>
  }

  const { content, data } = matter(source)
  
  return (
    <div className="documentation-page">
      <h1>{data.title}</h1>
      <div className="last-updated">Last updated: {data.lastUpdated}</div>
      <div className="markdown-content">
        <MDXRemote source={content} />
      </div>
    </div>
  )
}
```

Create a layout component for the documentation section:

```jsx
// src/app/documentation/layout.tsx

import Link from 'next/link'

export default function DocLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="documentation-layout">
      <aside className="documentation-sidebar">
        <nav>
          <h3>Getting Started</h3>
          <ul>
            <li><Link href="/documentation/1-introduction">Introduction</Link></li>
            <li><Link href="/documentation/2-getting-started">Getting Started</Link></li>
            {/* More navigation links */}
          </ul>
        </nav>
      </aside>
      <main className="documentation-content">
        {children}
      </main>
    </div>
  )
}
```

## Styling

Add styles for the documentation in your CSS/SCSS files:

```css
.documentation-layout {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.documentation-sidebar {
  width: 250px;
  padding-right: 2rem;
}

.documentation-content {
  flex: 1;
  max-width: 800px;
}

.markdown-content {
  /* Styles for markdown content */
}

/* Add more styling as needed */
```

## Updates and Maintenance

When updating documentation:

1. Always update the `lastUpdated` date in the frontmatter
2. Keep a consistent style across all documents
3. Update the index page with links to new content
4. Verify all internal links are working

## Search Functionality

To add search functionality to the documentation, consider using a library like [FlexSearch](https://github.com/nextapps-de/flexsearch):

```bash
npm install flexsearch
```

Then implement a search component that indexes and searches across all documentation files.

For more complex documentation needs, consider dedicated documentation frameworks like [Docusaurus](https://docusaurus.io/) or [Nextra](https://nextra.site/). 