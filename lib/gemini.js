import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateMockProjectData } from './mockGenerator';

export function buildPrompt(idea) {
  return `You are an AI Ensemble Evaluation Engine that simulates a panel of expert reviewers. A user has submitted the following project idea:

"${idea}"

Your task is to generate a comprehensive, highly realistic, implementation-ready project analysis AND a full multi-perspective evaluation by 5 independent AI evaluators. Return ONLY a valid JSON object — no markdown, no code blocks, just raw JSON.

The JSON must strictly follow this schema:

{
  "title": "Short, catchy, professional project name derived directly from the idea (3-6 words)",
  "innovationScore": {
    "overall": 87,
    "novelty": 84,
    "feasibility": 90,
    "marketDemand": 88,
    "confidence": 89,
    "technicalComplexity": 72,
    "researchCoverage": 83,
    "riskIndex": 32
  },
  "evaluation": {
    "evaluators": [
      {
        "name": "Innovation Analyst",
        "role": "Originality & Novelty Assessment",
        "score": 88,
        "confidence": 91,
        "summary": "2-3 sentence assessment of the idea's originality, uniqueness, and innovation potential tailored to this specific idea",
        "strengths": ["Specific strength 1 about novelty", "Specific strength 2", "Specific strength 3"],
        "concerns": ["Specific concern 1 about originality", "Specific concern 2"]
      },
      {
        "name": "Technical Architect",
        "role": "Feasibility & Implementation Complexity",
        "score": 82,
        "confidence": 88,
        "summary": "2-3 sentence technical assessment of implementation feasibility, system complexity, and engineering challenges specific to this idea",
        "strengths": ["Specific technical strength 1", "Specific technical strength 2", "Specific technical strength 3"],
        "concerns": ["Specific technical concern 1", "Specific technical concern 2"]
      },
      {
        "name": "Market Strategist",
        "role": "Market Demand & Commercialization",
        "score": 85,
        "confidence": 87,
        "summary": "2-3 sentence market assessment with commercialization viability, customer demand, and competitive positioning specific to this idea",
        "strengths": ["Specific market strength 1", "Specific market strength 2", "Specific market strength 3"],
        "concerns": ["Specific market concern 1", "Specific market concern 2"]
      },
      {
        "name": "Risk Analyst",
        "role": "Risks, Limitations & Failure Points",
        "score": 68,
        "confidence": 85,
        "summary": "2-3 sentence critical risk assessment identifying key weaknesses, failure scenarios, and scalability limitations for this specific idea",
        "strengths": ["Specific mitigating factor 1", "Specific mitigating factor 2"],
        "concerns": ["Specific critical risk 1", "Specific critical risk 2", "Specific critical risk 3"]
      },
      {
        "name": "Research Mentor",
        "role": "Research Gaps & Future Directions",
        "score": 90,
        "confidence": 92,
        "summary": "2-3 sentence research assessment identifying open research problems, literature gaps, and long-term innovation opportunities for this idea",
        "strengths": ["Specific research opportunity 1", "Specific research opportunity 2", "Specific research opportunity 3"],
        "concerns": ["Specific research limitation 1", "Specific research limitation 2"]
      }
    ],
    "consensusScore": 83,
    "positiveAnalysis": [
      "Specific positive insight 1 arguing for the idea's value",
      "Specific positive insight 2",
      "Specific positive insight 3",
      "Specific positive insight 4"
    ],
    "criticalAnalysis": [
      "Specific critical concern 1 arguing against or identifying a flaw",
      "Specific critical concern 2",
      "Specific critical concern 3",
      "Specific critical concern 4"
    ],
    "consensusSummary": "2-3 sentence balanced summary of the panel consensus, weighing all 5 evaluator perspectives to reach a final recommendation",
    "confidenceLevel": 88,
    "confidenceExplanation": "Brief 1-sentence explanation of why this confidence level was assigned based on evidence coverage, reasoning consistency, and data quality",
    "keyRisks": ["Specific key risk 1", "Specific key risk 2", "Specific key risk 3"],
    "keyOpportunities": ["Specific key opportunity 1", "Specific key opportunity 2", "Specific key opportunity 3"]
  },
  "validation": {
    "summary": "2-3 sentence compelling summary explaining why this specific idea is worth building and its core value proposition",
    "whyItMatters": "1-2 sentences on the real-world societal, industry, or business impact of solving this problem",
    "potentialUsers": ["Specific Target Role/User 1", "Specific Target Role/User 2", "Specific Target Role/User 3", "Specific Target Role/User 4"],
    "businessValue": "1-2 sentences detailing realistic monetization strategies, ROI, or strategic enterprise value"
  },
  "research": {
    "existingSolutions": [
      { "name": "Real or Realistic Product 1", "description": "Specific explanation of what it does and where it falls short for this use case", "url": "https://..." },
      { "name": "Real or Realistic Product 2", "description": "Specific explanation of what it does and where it falls short for this use case", "url": "https://..." },
      { "name": "Real or Realistic Product 3", "description": "Specific explanation of what it does and where it falls short for this use case", "url": "https://..." }
    ],
    "marketAnalysis": "2-3 detailed sentences with realistic market dynamics, TAM/CAGR projections, and industry demand for this idea",
    "challenges": ["Specific technical/operational challenge 1", "Specific challenge 2", "Specific challenge 3", "Specific challenge 4"],
    "futureTrends": ["Specific future trend 1", "Specific trend 2", "Specific trend 3"],
    "summary": "2-3 sentences summarizing the competitive and research landscape for this domain"
  },
  "gaps": [
    {
      "gap": "Clear, specific unaddressed gap in existing market solutions",
      "opportunity": "Actionable strategic opportunity created by this gap",
      "potentialInnovation": "Concrete, novel technical feature or innovation to exploit this gap"
    },
    {
      "gap": "Second specific market or technical gap",
      "opportunity": "Second actionable opportunity",
      "potentialInnovation": "Second concrete innovation"
    },
    {
      "gap": "Third specific market or technical gap",
      "opportunity": "Third actionable opportunity",
      "potentialInnovation": "Third concrete innovation"
    }
  ],
  "architecture": "graph TD\\n  A[Client Web App] --> B[API Gateway / Edge Router]\\n  B --> C[Auth & Session Manager]\\n  B --> D[Core Logic Engine]\\n  D --> E[(Database Store)]\\n  D --> F[AI Processing Service]",
  "techStack": {
    "frontend": ["React / Next.js", "TailwindCSS", "Framer Motion"],
    "backend": ["Node.js / FastAPI", "Express", "REST/GraphQL API"],
    "database": ["PostgreSQL / MongoDB", "Redis Cache"],
    "authentication": ["NextAuth.js", "JWT"],
    "deployment": ["Vercel / Docker", "AWS / Cloudflare"],
    "cloud": ["AWS S3", "Cloudflare CDN"],
    "ai": ["Relevant AI APIs / Models"]
  },
  "github": [
    { "name": "owner/repo-name", "stars": "15.4k", "description": "Real or highly relevant existing open-source GitHub repository for this project", "url": "https://github.com/..." },
    { "name": "owner/repo-name-2", "stars": "9.2k", "description": "Another relevant open-source repository", "url": "https://github.com/..." }
  ],
  "apis": [
    { "name": "Relevant API 1", "description": "What specific data or capabilities this API provides for this project", "website": "https://..." },
    { "name": "Relevant API 2", "description": "What specific data or capabilities this API provides for this project", "website": "https://..." }
  ],
  "datasets": [
    { "name": "Relevant Dataset 1", "description": "What dataset or data source is useful for training/testing this specific project", "url": "https://..." },
    { "name": "Relevant Dataset 2", "description": "Another relevant dataset or data source", "url": "https://..." }
  ],
  "roadmap": {
    "week1": {
      "title": "Foundation & System Design",
      "tasks": ["Specific, realistic task 1", "Specific task 2", "Specific task 3", "Specific task 4"]
    },
    "week2": {
      "title": "Core Intelligence & Features",
      "tasks": ["Specific task 1", "Specific task 2", "Specific task 3", "Specific task 4"]
    },
    "week3": {
      "title": "Integration & Pipeline Testing",
      "tasks": ["Specific task 1", "Specific task 2", "Specific task 3", "Specific task 4"]
    },
    "week4": {
      "title": "Optimization & Deployment",
      "tasks": ["Specific task 1", "Specific task 2", "Specific task 3", "Specific task 4"]
    }
  },
  "documentation": {
    "readme": "# Full markdown README tailored specifically to this project idea...",
    "folderStructure": "Project tree structure tailored specifically to the components of this project idea...",
    "apiDocs": "Detailed markdown API documentation with realistic endpoints for this project...",
    "futureScope": "Markdown future roadmap for phase 2 and phase 3 of this project..."
  }
}

CRITICAL RULES:
1. Return ONLY the JSON object — no backticks, no markdown prose.
2. Every field MUST be genuinely tailored to the input idea: "${idea}". NEVER use generic placeholders.
3. The 5 evaluator scores should realistically differ from each other (range 60-95). The Risk Analyst typically scores lower.
4. consensusScore should be a weighted average of all 5 evaluator scores.
5. riskIndex in innovationScore should be 0-50 range (lower = safer/better).
6. Provide real, existing or highly realistic open source GitHub repos, APIs, and datasets relevant to the specific domain.
7. All URLs should be valid, realistic HTTPS links.
8. Make the architecture a valid Mermaid.js diagram using "graph TD" syntax.`;
}

export async function generateProjectData(idea) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('[Gemini] GEMINI_API_KEY not configured. Falling back to mock generator.');
    return generateMockProjectData(idea);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
    const prompt = buildPrompt(idea);

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
    } catch (e) {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error(`Failed to parse JSON: ${e.message}`);
      }
    }

    return parsed;
  } catch (error) {
    console.error('[Gemini] Call failed, using mock generator fallback:', error.message);
    return generateMockProjectData(idea);
  }
}
