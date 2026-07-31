import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import { generateProjectData } from '@/lib/gemini';
import { saveInMemoryProject } from '@/lib/memoryStore';

export async function POST(request) {
  try {
    const body = await request.json();
    const { idea } = body;

    if (!idea || typeof idea !== 'string' || idea.trim().length < 5) {
      return NextResponse.json(
        { error: 'Please provide a valid project idea (at least 5 characters).' },
        { status: 400 }
      );
    }

    // Generate structured data from Gemini (or mock fallback)
    const projectData = await generateProjectData(idea.trim());

    // Try MongoDB first, fallback to memoryStore
    const conn = await connectToDatabase();
    let project;

    if (conn) {
      project = await Project.create({
        ...projectData,
        idea: idea.trim(),
      });
    } else {
      project = saveInMemoryProject({
        ...projectData,
        idea: idea.trim(),
      });
    }

    return NextResponse.json({ success: true, project }, { status: 201 });
  } catch (error) {
    console.error('[/api/generate] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate project. Please try again.' },
      { status: 500 }
    );
  }
}
