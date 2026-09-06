/**
 * pitchDeckPrompt.js
 *
 * Builds the Gemini prompt that produces STRICT JSON for the pitch deck.
 * Follows a 13-slide McKinsey/BCG consulting-grade presentation format.
 */

export function buildPitchDeckPrompt(project) {
  const title = project.title || 'Untitled Project';

  return `You are a world-class presentation designer at McKinsey & Company, specializing in investor pitch decks for startups.
Your goal is to generate the CONTENT for a premium, 13-slide pitch deck based on the provided project data.

PROJECT DATA:
- Title: "${title}"
- Idea: "${project.idea || ''}"
- Scores: Overall ${project.innovationScore?.overall || 85}/100, Feasibility ${project.innovationScore?.feasibility || 88}/100, Market ${project.innovationScore?.marketDemand || 85}/100
- Positive Insights: ${(project.evaluation?.positiveAnalysis || []).slice(0, 3).join(' | ')}
- Critical Insights: ${(project.evaluation?.criticalAnalysis || []).slice(0, 3).join(' | ')}
- Validation: ${project.validation?.summary || ''}
- Target Users: ${(project.validation?.potentialUsers || []).join(', ')}
- Business Value: ${project.validation?.businessValue || ''}
- Competitors: ${(project.research?.existingSolutions || []).map(s => s.name).join(', ')}
- Tech Stack: ${Object.entries(project.techStack || {}).map(([k,v]) => Array.isArray(v) ? v.join(', ') : '').filter(v => v).join(' | ')}

TASK:
Generate exactly 13 slides. Return ONLY a valid JSON object. No markdown, no explanation.

RULES:
1. Max 6 bullets per slide.
2. Max 12 words per bullet. No paragraphs. One key idea per slide.
3. Every slide must have 'speakerNotes' (natural speech).
4. Do NOT include markdown in strings (no **bold**, no *italics*).
5. For specific slides (cover, problem, solution, futureVision), generate an 'imagePrompt'.
   - The imagePrompt must be highly descriptive for an AI image generator (e.g., "A modern isometric 3D illustration of an enterprise cloud network on a dark background, glowing blue nodes, high quality, premium consulting style").
   - Do NOT ask for text in the image.

EXPECTED JSON SCHEMA:

{
  "theme": "Enterprise Dark",
  "pitchScripts": {
    "thirtySeconds": "A punchy 30-second elevator pitch script.",
    "twoMinutes": "A 2-minute pitch covering problem, solution, market, and ask.",
    "fiveMinutes": "A 5-minute detailed pitch script to accompany the slides."
  },
  "slides": {
    "slide1_cover": {
      "title": "${title}",
      "subtitle": "A compelling 5-7 word tagline.",
      "imagePrompt": "Detailed AI image prompt for the cover slide, futuristic, clean, enterprise.",
      "speakerNotes": "Welcome and opening hook."
    },
    "slide2_problem": {
      "headline": "One-line core problem statement.",
      "bullets": ["Pain point 1", "Pain point 2", "Pain point 3"],
      "imagePrompt": "Detailed AI image prompt illustrating the pain point abstractly.",
      "speakerNotes": "..."
    },
    "slide3_market": {
      "headline": "Market Opportunity",
      "marketSize": "e.g., $5.2B TAM",
      "growthRate": "e.g., 14.5% CAGR",
      "targetUsers": ["User segment 1", "User segment 2", "User segment 3"],
      "chartData": [
        {"name": "2024", "value": 10},
        {"name": "2025", "value": 15},
        {"name": "2026", "value": 25},
        {"name": "2027", "value": 45}
      ],
      "speakerNotes": "..."
    },
    "slide4_currentSolutions": {
      "headline": "Existing Solutions & Gaps",
      "competitors": [
        {"name": "Competitor A", "pros": "Pro 1", "cons": "Con 1"},
        {"name": "Competitor B", "pros": "Pro 2", "cons": "Con 2"}
      ],
      "marketGap": "One sentence defining the gap.",
      "speakerNotes": "..."
    },
    "slide5_solution": {
      "headline": "Our Solution",
      "usp": "One-line Unique Selling Proposition.",
      "features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
      "imagePrompt": "Detailed AI image prompt illustrating the product/solution abstractly.",
      "speakerNotes": "..."
    },
    "slide6_innovation": {
      "headline": "Innovation Engine",
      "scores": {
        "overall": 85,
        "confidence": 92
      },
      "positiveReasoning": ["Reason 1", "Reason 2"],
      "criticalReasoning": ["Constraint 1", "Constraint 2"],
      "speakerNotes": "..."
    },
    "slide7_architecture": {
      "headline": "System Architecture",
      "flowSteps": ["Step 1: User input", "Step 2: Processing", "Step 3: Database storage", "Step 4: Output generation"],
      "speakerNotes": "..."
    },
    "slide8_techStack": {
      "headline": "Technology Stack",
      "frontend": ["Next.js", "React"],
      "backend": ["Node.js", "Express"],
      "database": ["MongoDB"],
      "ai": ["OpenAI", "Gemini"],
      "speakerNotes": "..."
    },
    "slide9_businessModel": {
      "headline": "Business Model",
      "revenueStreams": ["Subscription ($X/mo)", "Enterprise License"],
      "commercialStrategy": ["Go-to-market step 1", "Go-to-market step 2"],
      "speakerNotes": "..."
    },
    "slide10_roadmap": {
      "headline": "Development Roadmap",
      "milestones": [
        {"time": "Month 1", "goal": "MVP Launch"},
        {"time": "Month 3", "goal": "1,000 Users"},
        {"time": "Month 6", "goal": "Series A Prep"},
        {"time": "Year 1", "goal": "Profitability"}
      ],
      "speakerNotes": "..."
    },
    "slide11_financials": {
      "headline": "Financials & Feasibility",
      "budgetRequired": "$50,000",
      "teamSize": "4 Engineers",
      "timeToMarket": "3 Months",
      "cloudCost": "$500/mo initially",
      "investmentReadiness": 88,
      "speakerNotes": "..."
    },
    "slide12_future": {
      "headline": "Future Vision",
      "expansionOpportunities": ["Vertical expansion 1", "Vertical expansion 2", "Vertical expansion 3"],
      "imagePrompt": "Detailed AI image prompt illustrating futuristic growth and expansion.",
      "speakerNotes": "..."
    },
    "slide13_thankYou": {
      "headline": "Thank You",
      "contact": "Contact us to join the journey",
      "speakerNotes": "..."
    }
  }
}
`;
}
