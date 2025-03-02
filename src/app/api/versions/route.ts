import { NextResponse } from 'next/server';
import { getAllVersions, getLatestVersion } from '@/utils/versions';

export async function GET() {
  try {
    const versions = getAllVersions();
    const latestVersion = getLatestVersion();
    
    return NextResponse.json({
      versions,
      latestVersion,
    });
  } catch (error) {
    console.error('Error fetching versions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch version information' },
      { status: 500 }
    );
  }
} 