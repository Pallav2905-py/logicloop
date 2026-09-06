import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import { getInMemoryProjects } from '@/lib/memoryStore';

export async function GET() {
  try {
    const conn = await connectToDatabase();
    let projects = [];

    if (conn) {
      projects = await Project.find({})
        .select('title idea innovationScore createdAt')
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
    } else {
      projects = getInMemoryProjects().map(p => ({
        _id: p._id,
        title: p.title,
        idea: p.idea,
        innovationScore: p.innovationScore,
        createdAt: p.createdAt,
      }));
    }

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('[/api/projects] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects.' }, { status: 500 });
  }
}
