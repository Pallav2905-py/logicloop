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
import { buildPitchDeck } from '@/lib/pptxBuilder';

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
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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
  const evaluation = project.evaluation || {};
  const validation = project.validation || {};
  const research = project.research || {};
  const techStack = project.techStack || {};
  const roadmap = project.roadmap || {};

  return {
    title,
    subtitle: validation.summary || idea.slice(0, 80),
    theme: 'modern',
    presentationTips: [
      'Start with a strong hook that highlights the problem clearly.',
      'Use the innovation scores to demonstrate credibility.',
      'Keep each slide focused on one key message.',
      'Practice transitions between slides for a smooth delivery.',
      'End with a clear, memorable call to action.',
    ],
    estimatedDurationMinutes: 8,
    versions: {
      thirtySeconds: `${title} solves ${idea.slice(0, 60)} by leveraging AI and modern technology. Our solution achieves a ${scores.overall || 85}/100 innovation score and is ready for development.`,
      twoMinutes: `${title} addresses a critical gap in the market: ${validation.whyItMatters || idea}. Our solution provides ${validation.summary || 'a comprehensive AI-powered platform'}. With a ${scores.overall || 85}/100 overall innovation score and ${evaluation.consensusScore || 83}/100 consensus rating, our approach has been validated across multiple dimensions. We target ${(validation.potentialUsers || []).slice(0, 2).join(' and ')} and plan to launch within 4-6 weeks using an agile development approach.`,
      fiveMinutes: `${title} is a comprehensive solution to a real and growing market challenge. ${validation.whyItMatters || ''} Existing solutions like ${(research.existingSolutions || []).map((s) => s.name).slice(0, 2).join(' and ')} fall short because they don't address the core innovation gap we've identified. Our platform achieves ${scores.overall || 85}/100 overall innovation, ${scores.novelty || 82}/100 novelty, and ${scores.feasibility || 88}/100 feasibility. Target users include ${(validation.potentialUsers || []).join(', ')}. ${validation.businessValue || ''} Our 4-week development roadmap is aggressive but realistic. We invite you to join us in building the future of this space.`,
    },
    slides: [
      {
        type: 'cover',
        title,
        subtitle: validation.summary?.slice(0, 80) || 'AI-Powered Innovation',
        tagline: idea.slice(0, 120),
        speakerNotes: `Welcome everyone. Today I'm excited to present ${title} — a project that ${validation.whyItMatters || 'addresses a critical market need'}. Let's dive in.`,
        icon: '🚀',
      },
      {
        type: 'problem',
        title: 'The Problem',
        headline: validation.whyItMatters || 'A critical gap exists in the market',
        bullets: (research.challenges || ['Complex workflows lack automation', 'Existing tools are fragmented', 'High cost and low efficiency']).slice(0, 3),
        statistic: research.marketAnalysis || 'A rapidly growing market with significant unmet demand.',
        speakerNotes: `The problem we're solving is real and urgent. ${validation.whyItMatters || ''} Current solutions leave users frustrated and underserved.`,
        icon: '⚠️',
      },
      {
        type: 'currentSolutions',
        title: 'Existing Solutions & Gaps',
        bullets: (research.existingSolutions || []).slice(0, 3).map((s) => `${s.name}: ${s.description}`),
        marketGap: 'None of the existing solutions provide a complete, AI-native, integrated experience.',
        speakerNotes: `Let's look at what's out there today. While these solutions exist, they all share a critical limitation — none of them solve the problem end-to-end.`,
        icon: '🔍',
      },
      {
        type: 'solution',
        title: 'Our Solution',
        headline: validation.summary?.slice(0, 100) || `${title} — The complete solution`,
        bullets: (project.gaps || []).slice(0, 3).map((g) => g.potentialInnovation || g.opportunity),
        highlight: evaluation.keyOpportunities?.[0] || 'A unique, defensible approach powered by AI.',
        speakerNotes: `Here's what makes ${title} different. We've built a solution that directly addresses each gap we identified, using cutting-edge AI technology.`,
        icon: '💡',
      },
      {
        type: 'innovationAnalysis',
        title: 'Innovation Analysis',
        scores: {
          overall: scores.overall || 85,
          novelty: scores.novelty || 82,
          feasibility: scores.feasibility || 88,
          marketDemand: scores.marketDemand || 85,
          consensusScore: evaluation.consensusScore || 83,
          confidenceLevel: evaluation.confidenceLevel || 88,
        },
        positiveInsights: (evaluation.positiveAnalysis || []).slice(0, 3),
        criticalInsights: (evaluation.criticalAnalysis || []).slice(0, 2),
        speakerNotes: `Our AI evaluation engine, powered by 5 independent expert models, validated this project with strong scores across all dimensions. Let me walk you through what this means.`,
        icon: '📊',
      },
      {
        type: 'marketOpportunity',
        title: 'Market Opportunity',
        targetUsers: validation.potentialUsers || ['Enterprise teams', 'Startups', 'Developers'],
        marketSize: research.marketAnalysis || 'Large and growing market',
        growthTrends: (research.futureTrends || []).slice(0, 3),
        businessOpportunity: validation.businessValue || 'Significant monetization potential',
        speakerNotes: `The market opportunity here is substantial. Let me show you who our users are and the scale of the opportunity.`,
        icon: '🌍',
      },
      {
        type: 'architecture',
        title: 'System Architecture',
        description: 'A modern, scalable architecture designed for reliability and performance.',
        components: ['Client Application', 'API Layer & Auth', 'Core Processing Engine', 'Data & AI Services'],
        techFlow: 'Client → API Gateway → Auth → Core Logic → AI Processing → Database',
        speakerNotes: `Our architecture is designed for scale from day one. Here's how the system components work together.`,
        icon: '🏗️',
      },
      {
        type: 'techStack',
        title: 'Technology Stack',
        categories: {
          frontend: techStack.frontend || ['React', 'Next.js'],
          backend: techStack.backend || ['Node.js', 'Express'],
          database: techStack.database || ['MongoDB', 'PostgreSQL'],
          cloud: techStack.cloud || ['AWS', 'Vercel'],
          ai: techStack.ai || ['Gemini AI', 'OpenAI'],
          deployment: techStack.deployment || ['Docker', 'Vercel'],
        },
        whyThisStack: 'This stack was chosen for developer velocity, scalability, and production readiness.',
        speakerNotes: `We chose each technology in this stack deliberately. This combination gives us speed, reliability, and the AI capabilities our platform requires.`,
        icon: '⚙️',
      },
      {
        type: 'researchHighlights',
        title: 'Research & Validation',
        summary: research.summary || 'Comprehensive research validates the market opportunity.',
        keyFindings: (research.futureTrends || ['Growing market demand', 'AI adoption accelerating', 'Clear user need validated']).slice(0, 3),
        researchGaps: (project.gaps || []).slice(0, 2).map((g) => g.gap),
        futureOpportunities: (research.futureTrends || []).slice(0, 3),
        speakerNotes: `Our research validates both the problem and our approach. Let me share the key findings that give us confidence.`,
        icon: '🔬',
      },
      {
        type: 'roadmap',
        title: 'Development Roadmap',
        phases: ['week1', 'week2', 'week3', 'week4'].map((w) => ({
          phase: w.replace('week', 'Week '),
          label: roadmap[w]?.title || `Phase ${w.slice(-1)}`,
          tasks: (roadmap[w]?.tasks || []).slice(0, 3),
        })),
        speakerNotes: `Our 4-week development plan is structured for maximum delivery with minimal risk. Each week has clear milestones.`,
        icon: '🗓️',
      },
      {
        type: 'costFeasibility',
        title: 'Cost & Feasibility',
        feasibilityScore: scores.feasibility || 85,
        riskIndex: scores.riskIndex || 30,
        implementationDifficulty: 'Moderate',
        estimatedTeamSize: '3-5 engineers',
        estimatedTimeToMVP: '4-6 weeks',
        estimatedCostRange: 'Cloud: $200-500/mo | APIs: $100-300/mo | Dev time: 4-6 sprints',
        riskMitigations: (evaluation.keyRisks || ['Phased rollout reduces delivery risk', 'Proven tech stack reduces technical risk', 'Iterative development ensures quality']).slice(0, 3),
        speakerNotes: `The cost structure is lean and the feasibility score of ${scores.feasibility || 85}/100 gives us strong confidence in delivery. Let me walk you through the numbers.`,
        icon: '💰',
      },
      {
        type: 'futureScope',
        title: 'Future Scope & Scalability',
        phase2Features: (evaluation.keyOpportunities || ['Advanced AI personalization', 'Enterprise integrations', 'Mobile application']).slice(0, 3),
        scalabilityStrategy: 'Microservices architecture enables horizontal scaling. Database sharding and CDN distribution ensure global performance.',
        researchExpansion: (project.gaps || []).slice(0, 2).map((g) => g.opportunity || g.gap),
        longTermVision: `${title} becomes the industry standard platform in its category, serving millions of users globally.`,
        speakerNotes: `This is just the beginning. The architecture we've built allows us to scale to millions of users and expand into adjacent markets.`,
        icon: '🔭',
      },
      {
        type: 'closing',
        title: 'Thank You',
        summary: validation.summary || `${title} represents a significant opportunity to transform how users interact with AI-powered tools.`,
        callToAction: 'Let\'s build the future together',
        generatedBy: 'IntelliGrade AI',
        speakerNotes: `Thank you for your time and attention. ${title} is ready to move from concept to reality. We'd love your support and feedback. Questions?`,
        icon: '🎯',
      },
    ],
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
    const base64 = await buildPitchDeck(deckJson);

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
