/**
 * pitchDeckPrompt.js
 *
 * Builds the Gemini prompt that produces STRICT JSON for the pitch deck.
 * Gemini is responsible ONLY for content — never layout, fonts, or colors.
 */

export function buildPitchDeckPrompt(project) {
  const idea = project.idea || '';
  const title = project.title || 'Untitled Project';

  // Summarise key project data inline so Gemini has rich context
  const techSummary = project.techStack
    ? Object.entries(project.techStack)
        .filter(([, v]) => Array.isArray(v) && v.length > 0)
        .map(([k, v]) => `${k}: ${v.join(', ')}`)
        .join(' | ')
    : '';

  const roadmapSummary = project.roadmap
    ? Object.entries(project.roadmap)
        .map(([week, plan]) => `${week}: ${plan?.title || ''} — ${(plan?.tasks || []).slice(0, 2).join('; ')}`)
        .join(' | ')
    : '';

  const scores = project.innovationScore
    ? `Overall ${project.innovationScore.overall}/100, Novelty ${project.innovationScore.novelty}/100, Feasibility ${project.innovationScore.feasibility}/100, Market Demand ${project.innovationScore.marketDemand}/100, Risk Index ${project.innovationScore.riskIndex}/100`
    : '';

  const evaluationSummary = project.evaluation
    ? `Consensus Score: ${project.evaluation.consensusScore}/100. Confidence: ${project.evaluation.confidenceLevel}%. Summary: ${project.evaluation.consensusSummary || ''}`
    : '';

  const existingSolutions = (project.research?.existingSolutions || [])
    .map((s) => `${s.name}: ${s.description}`)
    .join(' | ');

  const gaps = (project.gaps || [])
    .map((g) => `Gap: ${g.gap} → Opportunity: ${g.opportunity} → Innovation: ${g.potentialInnovation}`)
    .join(' | ');

  return `You are a world-class McKinsey-style presentation consultant helping create an investor-grade pitch deck for a hackathon/startup project.

PROJECT DATA:
- Title: "${title}"
- Idea: "${idea}"
- Innovation Scores: ${scores}
- Evaluation: ${evaluationSummary}
- Positive Insights: ${(project.evaluation?.positiveAnalysis || []).join(' | ')}
- Critical Insights: ${(project.evaluation?.criticalAnalysis || []).join(' | ')}
- Key Risks: ${(project.evaluation?.keyRisks || []).join(' | ')}
- Key Opportunities: ${(project.evaluation?.keyOpportunities || []).join(' | ')}
- Validation Summary: ${project.validation?.summary || ''}
- Why It Matters: ${project.validation?.whyItMatters || ''}
- Target Users: ${(project.validation?.potentialUsers || []).join(', ')}
- Business Value: ${project.validation?.businessValue || ''}
- Market Analysis: ${project.research?.marketAnalysis || ''}
- Challenges: ${(project.research?.challenges || []).join(' | ')}
- Future Trends: ${(project.research?.futureTrends || []).join(' | ')}
- Research Summary: ${project.research?.summary || ''}
- Existing Solutions: ${existingSolutions}
- Research Gaps: ${gaps}
- Tech Stack: ${techSummary}
- Roadmap: ${roadmapSummary}
- Future Scope: ${project.documentation?.futureScope || ''}

TASK:
Generate a complete 13-slide investor pitch deck. Return ONLY a valid JSON object with absolutely no markdown, no code fences, no prose, no explanation — just raw JSON.

The JSON must exactly follow this schema:

{
  "title": "exact project title",
  "subtitle": "compelling one-liner tagline for the project",
  "theme": "modern",
  "presentationTips": [
    "Tip 1 for presenting this specific project",
    "Tip 2",
    "Tip 3",
    "Tip 4",
    "Tip 5"
  ],
  "estimatedDurationMinutes": 8,
  "versions": {
    "thirtySeconds": "Concise 30-second elevator pitch script (2-3 sentences) tailored to this project",
    "twoMinutes": "Full 2-minute pitch script (5-7 sentences) covering problem, solution, market, and ask",
    "fiveMinutes": "Detailed 5-minute pitch (10-12 sentences) covering all major slides"
  },
  "slides": [
    {
      "type": "cover",
      "title": "${title}",
      "subtitle": "Compelling tagline that captures the project's essence in under 10 words",
      "tagline": "Sub-tagline: what problem it solves",
      "speakerNotes": "Opening 30-second hook to grab investor attention for this specific project",
      "icon": "🚀"
    },
    {
      "type": "problem",
      "title": "The Problem",
      "headline": "One punchy headline stating the core pain point",
      "bullets": [
        "Specific pain point 1 with real-world impact",
        "Specific pain point 2",
        "Specific pain point 3"
      ],
      "statistic": "One compelling market statistic that quantifies the problem (realistic, specific)",
      "speakerNotes": "30-45 second speaking notes explaining the problem slide for this project",
      "icon": "⚠️"
    },
    {
      "type": "currentSolutions",
      "title": "Existing Solutions & Gaps",
      "bullets": [
        "Competitor/solution 1: what it does and where it falls short",
        "Competitor/solution 2: limitation",
        "Competitor/solution 3: limitation"
      ],
      "marketGap": "One sentence describing the critical gap none of them address",
      "speakerNotes": "30-45 second notes on competitive landscape",
      "icon": "🔍"
    },
    {
      "type": "solution",
      "title": "Our Solution",
      "headline": "One sentence USP (Unique Selling Proposition)",
      "bullets": [
        "Key feature / innovation 1",
        "Key feature / innovation 2",
        "Key feature / innovation 3",
        "Key differentiator vs. existing solutions"
      ],
      "highlight": "One bold insight or breakthrough that makes this special",
      "speakerNotes": "30-45 second notes on solution and differentiation",
      "icon": "💡"
    },
    {
      "type": "innovationAnalysis",
      "title": "Innovation Analysis",
      "scores": {
        "overall": ${project.innovationScore?.overall || 85},
        "novelty": ${project.innovationScore?.novelty || 82},
        "feasibility": ${project.innovationScore?.feasibility || 88},
        "marketDemand": ${project.innovationScore?.marketDemand || 85},
        "consensusScore": ${project.evaluation?.consensusScore || 83},
        "confidenceLevel": ${project.evaluation?.confidenceLevel || 88}
      },
      "positiveInsights": [
        "${(project.evaluation?.positiveAnalysis || ['Strong market fit', 'Technical feasibility confirmed'])[0]}",
        "${(project.evaluation?.positiveAnalysis || ['Strong market fit', 'Technical feasibility confirmed', 'Clear value proposition'])[1] || 'Clear innovation pathway'}",
        "${(project.evaluation?.positiveAnalysis || ['Strong market fit', 'Technical feasibility confirmed', 'Clear value proposition', 'Scalable architecture'])[2] || 'Scalable architecture'}"
      ],
      "criticalInsights": [
        "${(project.evaluation?.criticalAnalysis || ['Market competition is high', 'Requires significant development time'])[0]}",
        "${(project.evaluation?.criticalAnalysis || ['Market competition is high', 'Requires significant development time'])[1] || 'Regulatory considerations needed'}"
      ],
      "speakerNotes": "30-45 second notes on scores and what they mean for investors",
      "icon": "📊"
    },
    {
      "type": "marketOpportunity",
      "title": "Market Opportunity",
      "targetUsers": ${JSON.stringify(project.validation?.potentialUsers || ['Enterprise teams', 'Startups', 'Developers'])},
      "marketSize": "Realistic TAM/SAM estimate based on the domain: ${project.research?.marketAnalysis || 'Growing market with significant opportunity'}",
      "growthTrends": ${JSON.stringify((project.research?.futureTrends || ['AI adoption', 'Digital transformation', 'Cloud-first strategies']).slice(0, 3))},
      "businessOpportunity": "${project.validation?.businessValue || 'Significant monetization potential through SaaS model'}",
      "speakerNotes": "30-45 second notes on market size and opportunity",
      "icon": "🌍"
    },
    {
      "type": "architecture",
      "title": "System Architecture",
      "description": "Clean description of the technical architecture flow in 2-3 sentences",
      "components": [
        "Component 1: role and responsibility",
        "Component 2: role and responsibility",
        "Component 3: role and responsibility",
        "Component 4: role and responsibility"
      ],
      "techFlow": "Brief 1-sentence description of how data flows through the system",
      "speakerNotes": "30-45 second technical walkthrough of architecture",
      "icon": "🏗️"
    },
    {
      "type": "techStack",
      "title": "Technology Stack",
      "categories": {
        "frontend": ${JSON.stringify(project.techStack?.frontend || ['React', 'Next.js'])},
        "backend": ${JSON.stringify(project.techStack?.backend || ['Node.js', 'Express'])},
        "database": ${JSON.stringify(project.techStack?.database || ['MongoDB', 'PostgreSQL'])},
        "cloud": ${JSON.stringify(project.techStack?.cloud || ['AWS', 'Vercel'])},
        "ai": ${JSON.stringify(project.techStack?.ai || ['OpenAI API'])},
        "deployment": ${JSON.stringify(project.techStack?.deployment || ['Docker', 'Vercel'])}
      },
      "whyThisStack": "1-2 sentences justifying why this specific stack is the right choice for the project",
      "speakerNotes": "30 second notes on tech choices and why they matter",
      "icon": "⚙️"
    },
    {
      "type": "researchHighlights",
      "title": "Research & Validation",
      "summary": "${project.research?.summary || 'Comprehensive research validates the market opportunity'}",
      "keyFindings": [
        "Finding 1 from research relevant to this project",
        "Finding 2",
        "Finding 3"
      ],
      "researchGaps": [
        "${(project.gaps || [{ gap: 'Primary research gap' }])[0]?.gap || 'Primary research gap'}",
        "${(project.gaps || [{ gap: 'Primary research gap' }, { gap: 'Secondary gap' }])[1]?.gap || 'Secondary research gap'}"
      ],
      "futureOpportunities": ${JSON.stringify((project.research?.futureTrends || ['AI advancement', 'Market expansion']).slice(0, 3))},
      "speakerNotes": "30-45 second notes on research credibility and validation",
      "icon": "🔬"
    },
    {
      "type": "roadmap",
      "title": "Development Roadmap",
      "phases": [
        {
          "phase": "Week 1",
          "label": "${project.roadmap?.week1?.title || 'Foundation & Design'}",
          "tasks": ${JSON.stringify((project.roadmap?.week1?.tasks || ['Setup architecture', 'Core design']).slice(0, 3))}
        },
        {
          "phase": "Week 2",
          "label": "${project.roadmap?.week2?.title || 'Core Development'}",
          "tasks": ${JSON.stringify((project.roadmap?.week2?.tasks || ['Build core features', 'API integration']).slice(0, 3))}
        },
        {
          "phase": "Week 3",
          "label": "${project.roadmap?.week3?.title || 'Integration & Testing'}",
          "tasks": ${JSON.stringify((project.roadmap?.week3?.tasks || ['Integration testing', 'Bug fixes']).slice(0, 3))}
        },
        {
          "phase": "Week 4",
          "label": "${project.roadmap?.week4?.title || 'Deployment & Launch'}",
          "tasks": ${JSON.stringify((project.roadmap?.week4?.tasks || ['Deploy to production', 'Launch']).slice(0, 3))}
        }
      ],
      "speakerNotes": "30-45 second notes on timeline and delivery milestones",
      "icon": "🗓️"
    },
    {
      "type": "costFeasibility",
      "title": "Cost & Feasibility",
      "feasibilityScore": ${project.innovationScore?.feasibility || 85},
      "riskIndex": ${project.innovationScore?.riskIndex || 30},
      "implementationDifficulty": "Moderate",
      "estimatedTeamSize": "3-5 engineers",
      "estimatedTimeToMVP": "4-6 weeks",
      "estimatedCostRange": "Realistic cost range for MVP development (cloud + API costs + dev time)",
      "riskMitigations": [
        "Risk mitigation strategy 1 specific to this project",
        "Risk mitigation strategy 2",
        "Risk mitigation strategy 3"
      ],
      "speakerNotes": "30-45 second notes on cost and risk",
      "icon": "💰"
    },
    {
      "type": "futureScope",
      "title": "Future Scope & Scalability",
      "phase2Features": [
        "Phase 2 feature 1 that naturally extends the MVP",
        "Phase 2 feature 2",
        "Phase 2 feature 3"
      ],
      "scalabilityStrategy": "2 sentences on how the architecture scales to 10x, 100x users",
      "researchExpansion": [
        "Research direction 1 for future innovation",
        "Research direction 2"
      ],
      "longTermVision": "One compelling sentence on the 3-5 year vision",
      "speakerNotes": "30-45 second notes on future potential",
      "icon": "🔭"
    },
    {
      "type": "closing",
      "title": "Thank You",
      "summary": "2-sentence recap of why this project matters and what makes it special",
      "callToAction": "Clear call to action for investors / judges / audience",
      "generatedBy": "IntelliGrade AI",
      "speakerNotes": "30 second closing statement — confident, memorable, inspiring",
      "icon": "🎯"
    }
  ]
}

CRITICAL RULES:
1. Return ONLY the JSON object — no backticks, no markdown, no prose.
2. All content must be GENUINELY tailored to this specific project idea. No generic placeholders.
3. Speaker notes must be natural speech, not bullet points — write them like someone is actually speaking.
4. All score numbers must be realistic integers (0-100 range, riskIndex 0-50).
5. Bullet points must be concise — max 12 words each.
6. The versions (30s, 2min, 5min) must be written as natural first-person speech.
7. Presentation tips must be specific to this project's domain and audience.`;
}
