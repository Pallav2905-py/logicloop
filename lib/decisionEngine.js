/**
 * decisionEngine.js
 *
 * Transforms AI research data into dynamic executive business intelligence & analytics
 * using Gemini 3.5 Flash (for text analysis) and Nano Banana 2 (for infographic).
 */
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Generate a high-resolution Decision Intelligence infographic using Gemini 3.1 Flash Image.
 */
async function generateInfographic(projectIdea, apiKey) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-image' });

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `A premium, high-resolution enterprise decision intelligence infographic summarizing the business impact and viability of this platform: "${projectIdea}". Modern corporate style, dark background (#0F172A), blue and violet glowing accents, featuring isometric charts, data pipelines, and analytics diagrams. Highly detailed, photorealistic UI rendering.`,
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ['IMAGE'],
      },
    });

    const candidates = result.response.candidates;
    if (!candidates?.length) return null;

    for (const part of candidates[0].content.parts) {
      if (part.inlineData?.mimeType?.startsWith('image/')) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (err) {
    console.error('[DecisionEngine:Infographic] Generation failed:', err.message);
    return null;
  }
}

/**
 * Generate JSON Analytics using Gemini 3.5 Flash.
 */
async function generateAnalyticsData(project, apiKey) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

    const prompt = `You are an elite Enterprise Strategy Consultant and AI Architect analyzing a project for the executive board.
    
Project Context:
Idea: ${project.idea}
Research Summary: ${project.research?.summary || 'Not provided'}
Innovation Score: ${JSON.stringify(project.innovationScore || {})}
Validation Summary: ${project.validation?.summary || 'Not provided'}

Your task is to generate a JSON response representing the key dynamic insights for a Decision Intelligence Dashboard.
Return ONLY valid JSON, no markdown formatting blocks.

Schema:
{
  "overallRecommendation": "BUILD | PIVOT | RESEARCH FURTHER",
  "executiveSummary": {
    "viability": "High | Moderate | Low",
    "standout": "One sentence describing the core defensible moat.",
    "biggestInnovation": "One sentence on the biggest technical/business innovation.",
    "biggestOpportunity": "One sentence on the primary market opportunity.",
    "biggestChallenge": "One sentence on the main execution risk.",
    "overallRisk": "High | Moderate | Low",
    "timeToMvp": "Estimated time (e.g. 4-6 weeks)",
    "recommendation": "BUILD | PIVOT | RESEARCH FURTHER",
    "verdictReason": "One short sentence justifying the verdict.",
    "text": "A comprehensive paragraph (3-4 sentences) summarizing the viability, technical feasibility, market pull, risks, and overall ROI."
  },
  "kpis": [
    { "id": "viability", "label": "Viability Index", "value": "Number/Percentage", "trend": "Positive/Negative trend text", "explanation": "Short sentence" },
    { "id": "market", "label": "Market Demand", "value": "Number/Percentage", "trend": "...", "explanation": "..." },
    { "id": "tech", "label": "Tech Feasibility", "value": "Number/Percentage", "trend": "...", "explanation": "..." },
    { "id": "risk", "label": "Risk Factor", "value": "Number/Percentage", "trend": "...", "explanation": "..." },
    { "id": "roi", "label": "Est. ROI", "value": "Multiple (e.g., 5.2x)", "trend": "...", "explanation": "..." },
    { "id": "time", "label": "Time to Market", "value": "Months/Weeks", "trend": "...", "explanation": "..." }
  ],
  "priorityMatrix": [
    { "name": "Task name 1 (short)", "effort": 80, "impact": 90 },
    { "name": "Task name 2", "effort": 30, "impact": 85 },
    { "name": "Task name 3", "effort": 60, "impact": 40 },
    { "name": "Task name 4", "effort": 20, "impact": 30 },
    { "name": "Task name 5", "effort": 90, "impact": 20 }
  ]
}

Ensure the matrix has 5-7 actionable technical or business steps. Impact and effort must be 0-100 integers.
`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (err) {
    console.error('[DecisionEngine:Analytics] Text generation failed:', err.message);
    throw err;
  }
}

/**
 * Original static baseline calculations to maintain data for charts that aren't generated dynamically.
 */
export function calculateDecisionAnalytics(project) {
  if (!project) return null;

  const scores = project.innovationScore || {};
  const evaluation = project.evaluation || {};
  const validation = project.validation || {};
  const riskIndex = scores.riskIndex || 32;
  const feasibilityScore = scores.feasibility || 88;
  const businessReadiness = scores.marketDemand || 85;
  const marketDemandScore = scores.marketDemand || 85;
  const noveltyScore = scores.novelty || 84;
  const confidenceLevel = evaluation.confidenceLevel || 88;
  const investmentReadiness = Math.round(((scores.overall || 85) * 0.4) + (businessReadiness * 0.3) + ((100 - riskIndex) * 0.3));

  // These are fallbacks for the dynamic fields
  const executiveSummary = {
    viability: 'High', standout: 'N/A', biggestInnovation: 'N/A', biggestOpportunity: 'N/A', biggestChallenge: 'N/A',
    overallRisk: 'Low', timeToMvp: '4-6 weeks', recommendation: 'BUILD', verdictReason: 'Strong data.', text: 'Loading AI insights...'
  };
  const kpis = [];
  const priorityMatrix = [];

  const evidenceReliability = {
    overallScore: confidenceLevel,
    sources: [
      { name: 'Market Competitors', reliability: 92, dataPoints: 14, status: 'Verified' },
      { name: 'Academic Papers', reliability: 85, dataPoints: 6, status: 'High' },
      { name: 'GitHub Repositories', reliability: 88, dataPoints: 11, status: 'High' },
      { name: 'API Documentation', reliability: 95, dataPoints: 8, status: 'Verified' },
    ]
  };

  const costOptimization = [
    { service: 'Database', current: 'AWS RDS', migration: 'Supabase / Neon', savings: '45%' },
    { service: 'AI Inference', current: 'OpenAI GPT-4', migration: 'Gemini 1.5 Flash / Llama 3', savings: '60%' },
    { service: 'Hosting', current: 'AWS EC2', migration: 'Vercel / Cloudflare Pages', savings: '30%' },
    { service: 'Image Storage', current: 'S3 Standard', migration: 'Cloudflare R2', savings: '80%' },
  ];

  const moscow = {
    mustHave: ['Core AI Generation', 'User Auth', 'Export Functionality'],
    shouldHave: ['Payment Gateway', 'History Log', 'Basic Analytics'],
    couldHave: ['Custom Themes', 'Team Collaboration', 'API Access'],
    wontHave: ['Mobile App', 'Enterprise SSO', 'Advanced Integrations']
  };

  const technicalDebt = [
    { component: 'Prompt Management', risk: 'High', remediation: 'Implement prompt versioning system early.' },
    { component: 'Monolithic API Route', risk: 'Medium', remediation: 'Refactor into micro-services or modular routers before month 3.' },
    { component: 'Client-side State', risk: 'Medium', remediation: 'Migrate to Redux/Zustand if components exceed 50.' },
  ];

  const roadmapConfidence = [
    { phase: 'Phase 1 (MVP)', confidence: 95, timeline: 'Weeks 1-4' },
    { phase: 'Phase 2 (Growth)', confidence: 82, timeline: 'Months 2-3' },
    { phase: 'Phase 3 (Scale)', confidence: 65, timeline: 'Months 4-6' },
  ];

  const decisionTree = [
    { condition: 'If User Retention < 20%', action: 'Pivot to B2B focused feature set' },
    { condition: 'If Cloud Costs > $500/mo', action: 'Migrate AI inference to open-source models' },
    { condition: 'If ARR hits $10k', action: 'Begin Series A fundraising prep' },
  ];

  const investmentMatrix = [
    { metric: 'Tech Feasibility', score: feasibilityScore },
    { metric: 'Commercial Feasibility', score: businessReadiness },
    { metric: 'Market Demand', score: marketDemandScore },
    { metric: 'Scalability', score: 86 },
    { metric: 'Innovation Novelty', score: noveltyScore },
    { metric: 'Defensiveness', score: 80 },
    { metric: 'Monetization Potential', score: 85 },
  ];

  const swot = {
    strengths: ['High AI Automation', 'Low initial CapEx', 'Unique Value Prop'],
    weaknesses: ['Dependency on LLM APIs', 'Lack of initial brand presence'],
    opportunities: ['B2B Enterprise Licensing', 'Vertical Expansion'],
    threats: ['Open-source alternatives', 'API price hikes']
  };

  const kpiProjection = [
    { month: 'M1', users: 100, revenue: 500, costs: 200 },
    { month: 'M2', users: 350, revenue: 1500, costs: 300 },
    { month: 'M3', users: 800, revenue: 4000, costs: 500 },
    { month: 'M6', users: 3000, revenue: 15000, costs: 1200 },
  ];

  const topImprovements = [
    'Implement semantic caching to reduce API costs',
    'Add fallback LLM providers (Anthropic/Google)',
    'Use streaming responses for perceived latency reduction',
    'Fine-tune small open-source model for core repetitive tasks'
  ];

  const innovationBenchmark = [
    { category: 'AI Integration', project: 92, industryAverage: 65 },
    { category: 'Workflow Automation', project: 88, industryAverage: 55 },
    { category: 'User Experience', project: 85, industryAverage: 72 },
    { category: 'Cost Efficiency', project: 90, industryAverage: 60 },
  ];

  const evaluators = evaluation.evaluators || [];
  const avgEvalScore = evaluators.length ? Math.round(evaluators.map(e => e.score).reduce((a, b) => a + b, 0) / evaluators.length) : 0;
  const consensusChartData = evaluators.map(e => ({ evaluator: e.name.split(' ')[0], Score: e.score, Confidence: e.confidence }));

  return {
    executiveSummary, kpis, priorityMatrix, evidenceReliability, costOptimization, moscow,
    technicalDebt, roadmapConfidence, decisionTree, investmentMatrix, swot, kpiProjection,
    topImprovements, innovationBenchmark, evaluators, avgEvalScore, consensusChartData,
    overallRecommendation: 'BUILD', investmentReadiness
  };
}

/**
 * Main orchestrator: generates dynamic insights and merges them over static fallbacks.
 */
export async function generateDecisionAnalytics(project) {
  if (!project) return null;
  const apiKey = process.env.GEMINI_API_KEY;

  const baseAnalytics = calculateDecisionAnalytics(project);

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return baseAnalytics;
  }

  console.log('[DecisionEngine] Starting parallel generation using gemini-3.5-flash and gemini-3.1-flash-image...');
  
  try {
    const [dynamicData, infographicBase64] = await Promise.all([
      generateAnalyticsData(project, apiKey).catch(e => null),
      generateInfographic(project.idea, apiKey).catch(e => null)
    ]);

    if (dynamicData) {
      baseAnalytics.executiveSummary = dynamicData.executiveSummary || baseAnalytics.executiveSummary;
      baseAnalytics.kpis = dynamicData.kpis || baseAnalytics.kpis;
      baseAnalytics.priorityMatrix = dynamicData.priorityMatrix || baseAnalytics.priorityMatrix;
      baseAnalytics.overallRecommendation = dynamicData.overallRecommendation || baseAnalytics.overallRecommendation;
    }
    baseAnalytics.infographic = infographicBase64;
    
    return baseAnalytics;
  } catch (err) {
    console.error('[DecisionEngine] Merge error:', err);
    return baseAnalytics;
  }
}
