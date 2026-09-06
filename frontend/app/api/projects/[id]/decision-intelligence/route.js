import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import { generateDecisionAnalytics } from '@/lib/decisionEngine';
import { getInMemoryProjectById, updateInMemoryProject } from '@/lib/memoryStore';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    let project = null;

    if (id.startsWith('mem_')) {
      project = getInMemoryProjectById(id);
    } else {
      const conn = await connectToDatabase();
      if (conn) {
        project = await Project.findById(id);
      }
      if (!project) {
        project = getInMemoryProjectById(id);
      }
    }

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Return cached analytics if they exist to save time and API costs
    if (project.decisionAnalytics && project.decisionAnalytics.executiveSummary) {
      console.log(`[API:DecisionIntelligence] Returning cached analytics for project ${id}`);
      return NextResponse.json(project.decisionAnalytics);
    }

    // Generate new analytics using Gemini 3.5 Flash and Gemini 3.1 Flash Image
    console.log(`[API:DecisionIntelligence] Generating fresh analytics for project ${id}`);
    const generatedAnalytics = await generateDecisionAnalytics(project);

    // Cache the result in the database or memory
    project.decisionAnalytics = generatedAnalytics;
    if (project.save) {
      await project.save();
    } else {
      updateInMemoryProject(id, { decisionAnalytics: generatedAnalytics });
    }

    return NextResponse.json(generatedAnalytics);
  } catch (error) {
    console.error('[API:DecisionIntelligence] Error:', error.message);
    return NextResponse.json(
      { error: 'Failed to generate decision intelligence data' },
      { status: 500 }
    );
  }
}
