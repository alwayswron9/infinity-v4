import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface VersionInfo {
  version: string;
  releaseDate: Date;
  content: string;
  releaseNotes: string;
}

// Check if code is running on server
const isServer = typeof window === 'undefined';

/**
 * Parses a version file and extracts the metadata and content
 */
export function parseVersionFile(filePath: string): VersionInfo {
  if (!isServer) {
    throw new Error('This function can only be run on the server');
  }
  
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);
  
  // Extract release notes - improved to handle multi-line content
  let releaseNotes = '';
  const lines = content.split('\n');
  let captureNotes = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Start capturing after "## Release Notes"
    if (line === '## Release Notes') {
      captureNotes = true;
      continue;
    }
    
    // Stop capturing when we hit the next section
    if (captureNotes && line.startsWith('## ')) {
      break;
    }
    
    // Add non-empty lines to the release notes
    if (captureNotes && line) {
      releaseNotes += (releaseNotes ? ' ' : '') + line;
    }
  }

  return {
    version: data.version,
    releaseDate: new Date(data.release_date),
    content,
    releaseNotes
  };
}

// Cached version data for client-side rendering
let cachedVersions: VersionInfo[] | null = null;

/**
 * Gets all versions sorted by semver (newest first)
 */
export function getAllVersions(): VersionInfo[] {
  // Return mock data for client-side
  if (!isServer) {
    // Return cached data if available
    if (cachedVersions) return cachedVersions;
    
    // Default mock for client-side rendering
    return [
      {
        version: '0.2.0',
        releaseDate: new Date('2024-03-05'),
        content: '',
        releaseNotes: 'Started making release notes'
      },
      {
        version: '0.1.0',
        releaseDate: new Date('2024-03-02'),
        content: '',
        releaseNotes: 'Everything else'
      }
    ];
  }
  
  const versionsDir = path.join(process.cwd(), 'versions');
  
  if (!fs.existsSync(versionsDir)) {
    return [];
  }
  
  const versionFiles = fs.readdirSync(versionsDir)
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(versionsDir, file));
  
  const versions = versionFiles.map(file => parseVersionFile(file));
  
  // Sort by version (assuming semver format)
  const sortedVersions = versions.sort((a, b) => {
    const aParts = a.version.split('.').map(Number);
    const bParts = b.version.split('.').map(Number);
    
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aVal = aParts[i] || 0;
      const bVal = bParts[i] || 0;
      
      if (aVal !== bVal) {
        return bVal - aVal; // Descending order (newest first)
      }
    }
    
    return 0;
  });
  
  // Cache for client use
  cachedVersions = sortedVersions;
  return sortedVersions;
}

/**
 * Gets the latest version
 */
export function getLatestVersion(): VersionInfo | null {
  const versions = getAllVersions();
  return versions.length > 0 ? versions[0] : null;
}

/**
 * Gets a specific version by version number
 */
export function getVersionByNumber(versionNumber: string): VersionInfo | null {
  const versions = getAllVersions();
  return versions.find(v => v.version === versionNumber) || null;
} 