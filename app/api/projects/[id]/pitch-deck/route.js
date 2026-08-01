/**
 * /api/projects/[id]/pitch-deck/route.js
 *
 * POST — Generates pitch deck JSON via Gemini, builds PPTX via pptxgenjs,
 *        and streams the .pptx binary to the client.
 *
 * GET  — Returns only the pitch deck JSON (for preview UI, no download).
 */

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { connectToDatabase } from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import { getInMemoryProjectById } from '@/lib/memoryStore';
import { buildPitchDeckPrompt } from '@/lib/pitchDeckPrompt';
import { generatePitchDeck } from '@/lib/pptxBuilder';

// ─── Shared: fetch project ─────────────────────────────────────────────────
async function getProject(id) {
  if (id.startsWith('mem_')) {
    return getInMemoryProjectById(id);
  }
  const conn = await connectToDatabase();
  let project = null;
  if (conn) {
    project = await Project.findById(id).lean();
  }
  if (!project) {
    project = getInMemoryProjectById(id);
  }
  return project;
}

// ─── Shared: call Gemini and return deck JSON ──────────────────────────────
async function generateDeckJson(project) {
  const apiKey = process.env.GEMINI_API_KEY;
  const prompt = buildPitchDeckPrompt(project);

  // If no API key — build a minimal but complete fallback deck
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return buildFallbackDeckJson(project);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      parsed = JSON.parse(match[0]);
    } else {
      throw new Error('Gemini returned non-JSON response for pitch deck.');
    }
  }

  return parsed;
}

// ─── Fallback deck JSON when no Gemini API key ─────────────────────────────
function buildFallbackDeckJson(project) {
  const title = project.title || 'AI-Generated Project';
  const idea = project.idea || '';
  const scores = project.innovationScore || {};
  const validation = project.validation || {};
  const research = project.research || {};
  const techStack = project.techStack || {};
  const roadmap = project.roadmap || {};
  
  return {
    theme: "Enterprise Dark",
    pitchScripts: {
      thirtySeconds: "This is a 30-second pitch.",
      twoMinutes: "This is a 2-minute pitch.",
      fiveMinutes: "This is a 5-minute pitch."
    },
    slides: {
      slide1_cover: {
        title: title,
        subtitle: validation.summary?.slice(0, 80) || 'AI-Powered Innovation',
        imagePrompt: "Futuristic enterprise abstract.",
        speakerNotes: "Welcome everyone."
      },
      slide2_problem: {
        headline: validation.whyItMatters || 'A critical gap exists in the market',
        bullets: (research.challenges || ['Complex workflows', 'Fragmented tools', 'High cost']).slice(0, 3),
        imagePrompt: "Problem visualization.",
        speakerNotes: "The problem we are solving is real."
      },
      slide3_market: {
        headline: "Market Opportunity",
        marketSize: research.marketAnalysis || "$10B+",
        growthRate: "15% CAGR",
        targetUsers: validation.potentialUsers || ["Enterprise", "SMBs"],
        chartData: [
          {name: "2024", value: 10},
          {name: "2025", value: 25},
          {name: "2026", value: 45}
        ],
        speakerNotes: "The market is growing."
      },
      slide4_currentSolutions: {
        headline: "Existing Solutions & Gaps",
        competitors: (research.existingSolutions || []).slice(0, 2).map(c => ({name: c.name, pros: "Established", cons: "Legacy architecture"})),
        marketGap: "No existing solution provides an integrated experience.",
        speakerNotes: "Competitors are falling behind."
      },
      slide5_solution: {
        headline: "Our Solution",
        usp: validation.summary?.slice(0, 50) || "The complete solution.",
        features: ["Feature 1", "Feature 2", "Feature 3"],
        imagePrompt: "Solution visualization.",
        speakerNotes: "This is how we solve it."
      },
      slide6_innovation: {
        headline: "Innovation Engine",
        scores: {
          overall: scores.overall || 85,
          confidence: 90
        },
        positiveReasoning: ["High novelty", "Strong technical fit"],
        criticalReasoning: ["Market adoption risk"],
        speakerNotes: "Our AI analysis shows strong potential."
      },
      slide7_architecture: {
        headline: "System Architecture",
        flowSteps: ["Client", "API Gateway", "AI Engine", "Database"],
        speakerNotes: "Our scalable architecture."
      },
      slide8_techStack: {
        headline: "Technology Stack",
        frontend: techStack.frontend || ["Next.js", "React"],
        backend: techStack.backend || ["Node.js", "Express"],
        database: techStack.database || ["MongoDB", "PostgreSQL"],
        ai: techStack.ai || ["OpenAI", "Gemini"],
        speakerNotes: "We use modern technologies."
      },
      slide9_businessModel: {
        headline: "Business Model",
        revenueStreams: ["SaaS Subscription", "Enterprise Licensing"],
        commercialStrategy: ["Direct Sales", "Partner Network"],
        speakerNotes: "How we make money."
      },
      slide10_roadmap: {
        headline: "Development Roadmap",
        milestones: [
          {time: "Week 1", goal: roadmap.week1?.title || "Design"},
          {time: "Week 2", goal: roadmap.week2?.title || "Development"},
          {time: "Week 3", goal: roadmap.week3?.title || "Testing"},
          {time: "Week 4", goal: roadmap.week4?.title || "Launch"}
        ],
        speakerNotes: "Our timeline to market."
      },
      slide11_financials: {
        headline: "Financials & Feasibility",
        budgetRequired: "$50k",
        teamSize: "3-5 Eng",
        timeToMarket: "4-6 weeks",
        cloudCost: "$500/mo",
        investmentReadiness: 85,
        speakerNotes: "Financial projections."
      },
      slide12_future: {
        headline: "Future Vision",
        expansionOpportunities: ["Vertical integration", "Global expansion", "API monetization"],
        imagePrompt: "Futuristic growth visualization.",
        speakerNotes: "Where we are heading."
      },
      slide13_thankYou: {
        headline: "Thank You",
        contact: "Let's build the future together.",
        speakerNotes: "Thank you."
      }
    }
  };
}

// ─── POST /api/projects/[id]/pitch-deck → download .pptx ──────────────────
export async function POST(request, { params }) {
  try {
    const { id } = await params;

    let body = {};
    try {
      body = await request.json();
    } catch {
      // Body may be empty or plain stream
    }

    const project = await getProject(id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    // Stage 1: Use provided deckJson if available, otherwise call Gemini
    const deckJson = body.deckJson || (await generateDeckJson(project));

    // Stage 2: pptxgenjs builds the PowerPoint
    const base64 = await generatePitchDeck(project, deckJson);

    const buffer = Buffer.from(base64, 'base64');
    const filename = `${(project.title || 'pitch-deck').replace(/[^a-z0-9]/gi, '-').toLowerCase()}-pitch-deck.pptx`;

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('[pitch-deck POST] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate pitch deck.' }, { status: 500 });
  }
}

// ─── GET /api/projects/[id]/pitch-deck → preview JSON only ────────────────
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const project = await getProject(id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    // Stage 1 only — return JSON for UI preview
    const deckJson = await generateDeckJson(project);

    return NextResponse.json({ deckJson });
  } catch (error) {
    console.error('[pitch-deck GET] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate pitch deck preview.' }, { status: 500 });
  }
}
