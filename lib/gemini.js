import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateMockProjectData } from './mockGenerator';

export function buildPrompt(idea) {
  return `You are an expert AI research and innovation analyst. A user has submitted the following project idea:

"${idea}"

Your task is to generate a comprehensive, highly realistic, implementation-ready project analysis tailored specifically and uniquely to this exact idea. Return ONLY a valid JSON object — no markdown, no code blocks, no explanation text, just raw JSON.

The JSON must strictly follow this schema:

{
  "title": "Short, catchy, professional project name derived directly from the idea (3-6 words)",
  "innovationScore": {
    "overall": 87,
    "novelty": 84,
    "feasibility": 90,
    "marketDemand": 88
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
    { "name": "owner/repo-name", "stars": "15.4k", "description": "Real or highly relevant existing open-source GitHub repository for building or learning for this project", "url": "https://github.com/..." },
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

CRITICAL RULES FOR GENUINE RESPONSES:
1. Return ONLY the JSON object — no markdown backtick blocks surrounding the json output if possible, or clean standard json.
2. Every field MUST be genuinely tailored to the user's input: "${idea}". NEVER return generic placeholders like "Solution Name" or "Task 1".
3. Provide real, existing or highly realistic open source GitHub repos, APIs, and datasets relevant to the specific domain.
4. Make the architecture field a valid Mermaid.js diagram using "graph TD" syntax with valid node labels.
5. All URLs should be valid, realistic HTTPS links (e.g. https://github.com/..., https://huggingface.co/..., etc.).`;
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
