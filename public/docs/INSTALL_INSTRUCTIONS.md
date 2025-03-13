# Documentation System Installation Instructions

To render the markdown documentation in the Infinity UI, you need to install the following dependencies:

```bash
npm install unified remark-parse remark-rehype rehype-react remark-gfm next-mdx-remote gray-matter flexsearch
```

Or add them to your package.json manually and run `npm install`:

```json
{
  "dependencies": {
    // ...existing dependencies
    "unified": "^10.1.2",
    "remark-parse": "^10.0.1",
    "remark-rehype": "^10.1.0",
    "rehype-react": "^7.1.2",
    "remark-gfm": "^3.0.1",
    "next-mdx-remote": "^4.4.1",
    "gray-matter": "^4.0.3",
    "flexsearch": "^0.7.31"
  }
}
```

## Files Created

The documentation system consists of:

1. Markdown files in `/public/docs/` directory
2. Image placeholders in `/public/docs/images/` (add actual images when available)
3. React components in `/src/app/documentation/` for rendering

## To Do

1. Install the dependencies listed above
2. Add actual screenshots and diagram images to replace the placeholders
3. Link the Documentation item in the sidebar to the documentation page
4. [Optional] Enhance the search functionality to allow searching across all documentation 