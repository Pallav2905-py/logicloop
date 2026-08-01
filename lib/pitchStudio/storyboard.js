/**
 * lib/pitchStudio/storyboard.js
 *
 * Generates the 8–12 scene storyboard JSON from project data using Gemini.
 * Provider-agnostic: swap out the generateWithGemini function to use any LLM.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * @typedef {Object} Scene
 * @property {number} index
 * @property {string} title
 * @property {number} duration  - seconds
 * @property {string} narration
 * @property {string} caption
 * @property {string} imagePrompt
 * @property {'fade'|'slide'|'crossfade'|'zoom'} transition
 * @property {'zoom_in'|'zoom_out'|'pan_left'|'pan_right'|'static'} cameraMotion
 */

/**
 * @typedef {Object} Storyboard
 * @property {Scene[]} scenes
 * @property {number} totalDuration
 * @property {string} presenterScript
 */

function buildStoryboardPrompt(project) {
  const title = project.title || 'AI-Powered Startup';
  const idea = project.idea || '';
  const validation = project.validation || {};
  const research = project.research || {};
  const evaluation = project.evaluation || {};
  const techStack = project.techStack || {};
  const roadmap = project.roadmap || {};
  const scores = project.innovationScore || {};

  return `You are a world-class startup pitch video director. Generate a cinematic 8-scene storyboard for a professional investor pitch video.

PROJECT:
- Name: "${title}"
- Idea: "${idea}"
- Why it matters: "${validation.whyItMatters || ''}"
- Target users: ${(validation.potentialUsers || []).join(', ')}
- Business value: "${validation.businessValue || ''}"
- Market analysis: "${research.marketAnalysis || ''}"
- Innovation score: ${scores.overall || 85}/100
- Key strengths: ${(evaluation.positiveAnalysis || []).slice(0, 2).join('; ')}
- Tech stack: ${[...(techStack.frontend || []), ...(techStack.backend || []), ...(techStack.ai || [])].slice(0, 6).join(', ')}
- Roadmap: ${roadmap.week1?.title || ''} → ${roadmap.week2?.title || ''} → ${roadmap.week3?.title || ''} → ${roadmap.week4?.title || ''}

REQUIREMENTS:
- Generate exactly 8 scenes
- Total video duration: 60–80 seconds
- Tone: Confident, investor-focused, Apple/YC Demo Day style
- Each narration: 1-2 sentences, 15-25 words, spoken in 5-10 seconds
- Narration must be authoritative, no filler words, no hedging

SCENE STRUCTURE (follow this arc):
1. Hook / Title (4-5s) — Grab attention with the bold vision
2. The Problem (7-9s) — Paint the pain point vividly
3. Market Opportunity (7-9s) — Show the scale of the opportunity
4. Our Solution (8-10s) — Reveal the product/solution
5. How It Works (7-9s) — Core technology or process
6. Innovation Score / Validation (7-9s) — AI-validated data & metrics
7. Roadmap & Traction (6-8s) — Timeline to market
8. Call to Action / Close (5-7s) — Bold closing statement + ask

IMAGE PROMPT STYLE: Each imagePrompt must be a detailed AI art direction note (40-60 words). Use: futuristic enterprise illustrations, isometric 3D graphics, dark gradient backgrounds (#0F172A to #1E293B), glowing blue (#2563EB) or violet (#7C3AED) accent elements, minimal text, premium consulting aesthetic, 16:9 aspect ratio. NO stock photo style. NO people faces.

Return ONLY valid JSON, no markdown:

{
  "scenes": [
    {
      "index": 1,
      "title": "Scene title (2-4 words)",
      "duration": 5,
      "narration": "Confident, punchy narration sentence.",
      "caption": "Short 3-5 word caption for subtitle overlay",
      "imagePrompt": "Detailed 40-60 word AI art direction prompt for this specific scene",
      "transition": "fade",
      "cameraMotion": "zoom_in"
    }
  ],
  "totalDuration": 65,
  "presenterScript": "Full verbatim 60-80 second presenter script with natural pauses marked as [pause]."
}

Valid transitions: fade, slide, crossfade, zoom
Valid cameraMotion: zoom_in, zoom_out, pan_left, pan_right, static`;
}

async function generateWithGemini(prompt, apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Storyboard: Gemini returned non-JSON response.');
  }
}

function buildFallbackStoryboard(project) {
  const title = project.title || 'AI-Powered Startup';
  const idea = project.idea || 'a revolutionary AI platform';
  const scores = project.innovationScore || {};
  const validation = project.validation || {};

  return {
    scenes: [
      {
        index: 1,
        title: 'Vision',
        duration: 5,
        narration: `${title} — where artificial intelligence meets real-world impact.`,
        caption: 'The Future is Now',
        imagePrompt: `Futuristic dark isometric 3D illustration of a glowing neural network hub, deep navy background (#0F172A), electric blue (#2563EB) pulsing nodes, premium enterprise aesthetic, 16:9`,
        transition: 'fade',
        cameraMotion: 'zoom_in',
      },
      {
        index: 2,
        title: 'The Problem',
        duration: 8,
        narration: `Businesses lose billions annually to ${idea.split(' ').slice(0, 5).join(' ')} inefficiencies. The old way is broken.`,
        caption: 'A $Billion Problem',
        imagePrompt: `Dark isometric visualization of fragmented data silos and broken workflows, red warning indicators, chaotic disconnected systems on a dark gradient background, enterprise style`,
        transition: 'slide',
        cameraMotion: 'pan_right',
      },
      {
        index: 3,
        title: 'Market Scale',
        duration: 8,
        narration: `A ${(project.research?.marketAnalysis || '$10B+ market').slice(0, 60)} opportunity, growing rapidly.`,
        caption: 'Massive Market Opportunity',
        imagePrompt: `Glowing upward trend chart in isometric 3D, dark background, blue and violet gradient bars rising dramatically, minimal labels, enterprise data visualization aesthetic`,
        transition: 'crossfade',
        cameraMotion: 'zoom_out',
      },
      {
        index: 4,
        title: 'Our Solution',
        duration: 9,
        narration: `${validation.summary?.slice(0, 100) || `${title} delivers intelligent automation that transforms how teams work.`}`,
        caption: `Introducing ${title}`,
        imagePrompt: `Premium product dashboard UI in isometric 3D perspective, dark navy background, glowing interface panels, blue accent highlights, clean minimal enterprise SaaS aesthetic`,
        transition: 'zoom',
        cameraMotion: 'zoom_in',
      },
      {
        index: 5,
        title: 'How It Works',
        duration: 8,
        narration: 'Three steps. Input. Analyze. Deliver. Powered by cutting-edge AI infrastructure.',
        caption: 'Powered by AI',
        imagePrompt: `Isometric 3D pipeline visualization: three glowing nodes connected by flowing data streams, dark background, electric blue (#2563EB) light trails, enterprise tech aesthetic`,
        transition: 'fade',
        cameraMotion: 'pan_left',
      },
      {
        index: 6,
        title: 'AI Validated',
        duration: 8,
        narration: `${scores.overall || 87} out of 100 innovation score. ${scores.feasibility || 90}% feasibility. Validated across five expert dimensions.`,
        caption: `${scores.overall || 87}/100 Innovation Score`,
        imagePrompt: `Futuristic AI scoring dashboard in isometric 3D, circular progress rings glowing blue and green, dark background, premium analytics visualization with minimal enterprise UI`,
        transition: 'crossfade',
        cameraMotion: 'static',
      },
      {
        index: 7,
        title: 'Roadmap',
        duration: 7,
        narration: 'MVP in four weeks. First customers in eight. Scale-ready architecture from day one.',
        caption: '4 Weeks to Launch',
        imagePrompt: `Isometric 3D timeline visualization with glowing milestone markers, rocket launch icon, dark gradient background, blue and violet accent nodes, clean enterprise roadmap aesthetic`,
        transition: 'slide',
        cameraMotion: 'pan_right',
      },
      {
        index: 8,
        title: "Let's Build",
        duration: 6,
        narration: `Join us in building ${title}. The market is ready. The technology is proven. The time is now.`,
        caption: "Let's Build the Future",
        imagePrompt: `Epic wide-angle isometric cityscape at night with glowing AI network overlaid across buildings, dark navy sky, electric blue connecting lines, premium futuristic enterprise vision`,
        transition: 'fade',
        cameraMotion: 'zoom_out',
      },
    ],
    totalDuration: 59,
    presenterScript: `Welcome. ${title} — where artificial intelligence meets real-world impact. [pause] Every day, businesses face ${idea.slice(0, 80)}. The cost is staggering. The solution is overdue. [pause] We are entering a massive market, growing at double-digit rates. [pause] ${title} delivers ${validation.summary?.slice(0, 120) || 'intelligent automation that transforms workflows'}. [pause] Our technology is simple by design: input, analyze, deliver. Three steps, infinite scale. [pause] With an innovation score of ${scores.overall || 87} out of 100, validated by five AI expert dimensions, we have the data to back our conviction. [pause] Four weeks to MVP. Eight weeks to first customers. The architecture scales from day one. [pause] Join us. The market is ready. The technology is proven. The time is now.`,
  };
}

/**
 * Generate a storyboard for the given project.
 * @param {Object} project
 * @returns {Promise<Storyboard>}
 */
export async function generateStoryboard(project) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('[PitchStudio:Storyboard] No API key — using fallback storyboard.');
    return buildFallbackStoryboard(project);
  }

  try {
    const prompt = buildStoryboardPrompt(project);
    const storyboard = await generateWithGemini(prompt, apiKey);

    // Validate basic structure
    if (!storyboard.scenes || !Array.isArray(storyboard.scenes)) {
      throw new Error('Invalid storyboard structure from Gemini');
    }

    return storyboard;
  } catch (err) {
    console.error('[PitchStudio:Storyboard] Gemini failed, using fallback:', err.message);
    return buildFallbackStoryboard(project);
  }
}
