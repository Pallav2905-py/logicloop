/**
 * app/api/projects/[id]/pitch-studio/storyboard/route.js
 *
 * POST — Generate storyboard JSON for the project.
 * GET  — Same as POST (idempotent, no side effects).
 */

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import { getInMemoryProjectById } from '@/lib/memoryStore';
import { generateStoryboard } from '@/lib/pitchStudio/storyboard';
import { getTTSProvider } from '@/lib/pitchStudio/tts';

async function getProject(id) {
  if (id.startsWith('mem_')) return getInMemoryProjectById(id);
  const conn = await connectToDatabase();
  let project = null;
  if (conn) project = await Project.findById(id).lean();
  if (!project) project = getInMemoryProjectById(id);
  return project;
}

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const project = await getProject(id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    const storyboard = await generateStoryboard(project);
    const ttsProvider = getTTSProvider();

    return NextResponse.json({ storyboard, ttsProvider });
  } catch (error) {
    console.error('[pitch-studio/storyboard POST]', error);
    return NextResponse.json({ error: error.message || 'Failed to generate storyboard.' }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  return POST(request, { params });
}
