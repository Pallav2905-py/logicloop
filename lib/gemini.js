import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateMockProjectData } from './mockGenerator';

export function buildPrompt(idea) {
  return `You are an expert AI research and innovation analyst. A user has submitted the following project idea:

"${idea}"

Your task is to generate a comprehensive, implementation-ready project analysis. Return ONLY a valid JSON object — no markdown, no code blocks, no explanation text, just raw JSON.

The JSON must strictly follow this schema:

{
  "title": "Short catchy project name derived from the idea (3-6 words)",
  "innovationScore": {
    "overall": 85,
    "novelty": 80,
    "feasibility": 90,
    "marketDemand": 85
  },
  "validation": {
    "summary": "2-3 sentence summary of why this idea is worth building",
    "whyItMatters": "1-2 sentences on the societal or business impact",
    "potentialUsers": ["user type 1", "user type 2", "user type 3", "user type 4"],
    "businessValue": "1-2 sentences on monetization or strategic value"
  },
  "research": {
    "existingSolutions": [
      { "name": "Solution Name", "description": "What it does", "url": "https://example.com" },
      { "name": "Solution Name 2", "description": "What it does", "url": "https://example.com" },
      { "name": "Solution Name 3", "description": "What it does", "url": "https://example.com" }
    ],
    "marketAnalysis": "2-3 sentences about market size, growth, and key players",
    "challenges": ["Challenge 1", "Challenge 2", "Challenge 3", "Challenge 4"],
    "futureTrends": ["Trend 1", "Trend 2", "Trend 3"],
    "summary": "2-3 sentences summarizing the research landscape"
  },
  "gaps": [
    {
      "gap": "Specific gap in existing solutions",
      "opportunity": "How this gap creates an opportunity",
      "potentialInnovation": "A specific innovation to exploit this gap"
    },
    {
      "gap": "Another gap",
      "opportunity": "Another opportunity",
      "potentialInnovation": "Another innovation"
    },
    {
      "gap": "Third gap",
      "opportunity": "Third opportunity",
      "potentialInnovation": "Third innovation"
    }
  ],
  "architecture": "graph TD\\n  A[Client App] --> B[API Gateway]\\n  B --> C[Auth Service]\\n  B --> D[Core Engine]\\n  D --> E[(Database Store)]\\n  D --> F[AI Service]",
  "techStack": {
    "frontend": ["React", "Next.js", "TailwindCSS"],
    "backend": ["Node.js", "Express", "REST API"],
    "database": ["PostgreSQL", "Redis"],
    "authentication": ["NextAuth.js", "JWT"],
    "deployment": ["Vercel", "Docker"],
    "cloud": ["AWS S3", "CloudFront"],
    "ai": ["OpenAI GPT-4", "Pinecone"]
  },
  "github": [
    { "name": "repo-name/project", "stars": "12.4k", "description": "What this repo does", "url": "https://github.com/example/repo" },
    { "name": "repo-name/project2", "stars": "8.1k", "description": "What this repo does", "url": "https://github.com/example/repo2" }
  ],
  "apis": [
    { "name": "API Name", "description": "What this API provides", "website": "https://api.example.com" },
    { "name": "API Name 2", "description": "What this API provides", "website": "https://api.example2.com" }
  ],
  "datasets": [
    { "name": "Dataset Name", "description": "What data it contains and its size", "url": "https://dataset.example.com" },
    { "name": "Dataset Name 2", "description": "What data it contains and its size", "url": "https://dataset.example2.com" }
  ],
  "roadmap": {
    "week1": {
      "title": "Foundation & Setup",
      "tasks": ["Task 1", "Task 2", "Task 3", "Task 4"]
    },
    "week2": {
      "title": "Core Features",
      "tasks": ["Task 1", "Task 2", "Task 3", "Task 4"]
    },
    "week3": {
      "title": "Integration & Testing",
      "tasks": ["Task 1", "Task 2", "Task 3", "Task 4"]
    },
    "week4": {
      "title": "Polish & Deploy",
      "tasks": ["Task 1", "Task 2", "Task 3", "Task 4"]
    }
  },
  "documentation": {
    "readme": "# Project Title\\n\\n## Overview\\nProject description here.\\n\\n## Features\\n- Feature 1\\n- Feature 2",
    "folderStructure": "/project-root\\n├── /src\\n│   ├── /components\\n│   ├── /pages\\n│   └── /api\\n├── /public\\n├── package.json\\n└── README.md",
    "apiDocs": "## API Reference\\n\\n### POST /api/endpoint\\n**Description:** Endpoint description",
    "futureScope": "## Future Roadmap\\n\\n### Phase 2\\n- Feature enhancement 1\\n- Feature enhancement 2"
  }
}

IMPORTANT RULES:
1. Return ONLY the JSON object — no backticks, no markdown, no prose
2. Make the architecture field a valid Mermaid.js diagram using "graph TD" syntax
3. Use real, specific technology names relevant to the idea "${idea}"
4. Ensure all URLs look plausible and realistic`;
}

export async function generateProjectData(idea) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('[Gemini] GEMINI_API_KEY not configured. Falling back to mock generator.');
    return generateMockProjectData(idea);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
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
