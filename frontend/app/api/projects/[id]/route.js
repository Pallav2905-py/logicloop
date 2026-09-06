import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import { getInMemoryProjectById } from '@/lib/memoryStore';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    let project = null;

    if (id.startsWith('mem_')) {
      project = getInMemoryProjectById(id);
    } else {
      const conn = await connectToDatabase();
      if (conn) {
        project = await Project.findById(id).lean();
      }
      if (!project) {
        project = getInMemoryProjectById(id);
      }
    }

    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error('[/api/projects/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch project.' }, { status: 500 });
  }
}
