/**
 * decisionPrompt.js
 *
 * Senior Partner McKinsey & Company Executive Due Diligence Prompt.
 * Generates structured JSON for Executive AI Summary, Decision Metrics,
 * Buildability Matrix, Trade-offs, Bottlenecks, Impact x Effort Matrix, and Cost Optimizations.
 */

export function buildDecisionDiligencePrompt(project) {
  const title = project.title || 'Untitled Project';
  const idea = project.idea || '';
  const scores = project.innovationScore || {};
  const evaluation = project.evaluation || {};
  const validation = project.validation || {};
  const research = project.research || {};
  const techStack = project.techStack || {};
  const roadmap = project.roadmap || {};
  const gaps = project.gaps || [];

  return `You are a Senior Partner at McKinsey & Company specializing in Technology Strategy, Venture Capital Due Diligence, Product Innovation, and AI Investments.

PROJECT FOR DUE DILIGENCE:
- Title: "${title}"
- Idea: "${idea}"
- Innovation Scores: Overall ${scores.overall || 85}, Novelty ${scores.novelty || 82}, Feasibility ${scores.feasibility || 88}, Market Demand ${scores.marketDemand || 85}, Risk Index ${scores.riskIndex || 32}
- Consensus Summary: ${evaluation.consensusSummary || ''}
- Positive Analysis: ${(evaluation.positiveAnalysis || []).join(' | ')}
- Critical Analysis: ${(evaluation.criticalAnalysis || []).join(' | ')}
- Target Users: ${(validation.potentialUsers || []).join(', ')}
- Business Value: ${validation.businessValue || ''}
- Existing Solutions: ${(research.existingSolutions || []).map((s) => s.name).join(', ')}
- Tech Stack: ${JSON.stringify(techStack)}

TASK:
Perform a complete executive due diligence assessment for C-suite decision makers and VC partners. Return ONLY a valid JSON object — no markdown, no prose, no backticks.

Strict JSON Schema:

{
  "executiveSummary": {
    "recommendationText": "150-250 word McKinsey-style executive summary paragraph analyzing project viability, why it stands out, biggest innovation, biggest business opportunity, biggest challenge, overall risk, estimated time to MVP, investment recommendation, and final verdict.",
    "verdict": "BUILD", // "BUILD" | "BUILD AFTER REFINEMENT" | "NOT RECOMMENDED"
    "verdictExplanation": "One analytical paragraph explaining exactly why this verdict was reached."
  },
  "enterpriseMetrics": {
    "technicalMaturityIndex": 88,
    "commercialReadinessIndex": 84,
    "marketAttractiveness": 90,
    "executionComplexity": 65,
    "operationalRisk": 28,
    "researchConfidence": 92,
    "scalabilityPotential": 89,
    "innovationNovelty": 86,
    "investmentPotential": 87,
    "expectedRoiPercent": 320,
    "timeToMarketScore": 85,
    "maintainabilityScore": 88
  },
  "buildabilityMatrix": [
    { "feature": "Core Authentication & Roles", "difficulty": "Low", "businessImpact": "High", "devTimeDays": 1, "priorityStars": 5 },
    { "feature": "AI Intelligence & Engine", "difficulty": "Medium", "businessImpact": "High", "devTimeDays": 4, "priorityStars": 5 },
    { "feature": "Analytics & Reporting Dashboard", "difficulty": "Medium", "businessImpact": "High", "devTimeDays": 3, "priorityStars": 4 },
    { "feature": "Billing & Subscription Gateway", "difficulty": "Low", "businessImpact": "Medium", "devTimeDays": 2, "priorityStars": 4 },
    { "feature": "Real-time Notifications & Alerts", "difficulty": "Low", "businessImpact": "Low", "devTimeDays": 1, "priorityStars": 3 }
  ],
  "tradeOffMatrix": [
    {
      "component": "Database Architecture",
      "current": "MongoDB",
      "alternative": "PostgreSQL",
      "prosCurrent": "Flexible JSON document schema, fast iteration for unstructured AI outputs",
      "consCurrent": "Complex relational join queries and multi-table ACID transactions",
      "whenToUseCurrent": "Rapid MVP development with evolving document schemas",
      "whenToUseAlt": "Strict relational financial transactions & complex SQL reporting"
    },
    {
      "component": "Framework Architecture",
      "current": "Next.js App Router",
      "alternative": "Vite + React SPA + Express API",
      "prosCurrent": "Unified full-stack architecture, built-in serverless endpoints, SEO optimization",
      "consCurrent": "Serverless memory limits for heavy long-running AI computations",
      "whenToUseCurrent": "Production SaaS applications with server rendering & fast edge deployment",
      "whenToUseAlt": "Heavy client-side interactive canvas tools without SEO needs"
    }
  ],
  "successProbabilities": {
    "mvpSuccess": 91,
    "mvpExplanation": "High developer velocity and proven stack minimize delivery risk.",
    "funding": 78,
    "fundingExplanation": "Strong innovation novelty and addressable TAM attract seed investors.",
    "marketAdoption": 84,
    "marketAdoptionExplanation": "Direct alignment with user pain points and clear competitive gap.",
    "scaling": 82,
    "scalingExplanation": "Stateless serverless backend architecture supports seamless horizontal scaling."
  },
  "resourceAllocation": [
    { "role": "Frontend Engineer", "headcount": 1.0, "hours": 50, "priority": "High", "dependencies": "UI Design Specs" },
    { "role": "Backend / API Engineer", "headcount": 1.0, "hours": 55, "priority": "High", "dependencies": "Database Schema" },
    { "role": "AI / ML Engineer", "headcount": 1.0, "hours": 40, "priority": "High", "dependencies": "API Key Provisioning" },
    { "role": "UI/UX Designer", "headcount": 0.5, "hours": 15, "priority": "Medium", "dependencies": "User Stories" },
    { "role": "QA & Security Engineer", "headcount": 0.5, "hours": 15, "priority": "Medium", "dependencies": "Core MVP Code" },
    { "role": "DevOps Engineer", "headcount": 0.5, "hours": 10, "priority": "Low", "dependencies": "Vercel / AWS Account" }
  ],
  "implementationBottlenecks": [
    { "potentialBottleneck": "AI API Rate Limits & Cost Spikes", "likelihood": "Medium", "impact": "High", "mitigation": "Implement Redis response caching and client-side fallback mocks" },
    { "potentialBottleneck": "Multi-Tenant Data Privacy", "likelihood": "Low", "impact": "High", "mitigation": "Enforce strict tenant ID row-level isolation policies" },
    { "potentialBottleneck": "Large Payload Formatting", "likelihood": "Low", "impact": "Medium", "mitigation": "Stream JSON chunks using Server-Sent Events (SSE)" }
  ],
  "confidenceDistribution": {
    "research": 92,
    "architecture": 89,
    "techStack": 95,
    "timeline": 84,
    "cost": 78,
    "deployment": 91
  },
  "complexityHeatmap": {
    "frontend": 3,
    "backend": 4,
    "database": 2,
    "infrastructure": 3,
    "ai": 5,
    "devops": 3
  },
  "evidenceScore": {
    "sources": [
      { "source": "GitHub Open Source Projects", "stars": 5 },
      { "source": "Peer-Reviewed Research Papers", "stars": 4 },
      { "source": "Industry Benchmark Datasets", "stars": 4 },
      { "source": "Gartner/McKinsey Industry Reports", "stars": 5 },
      { "source": "Developer Community Validation", "stars": 4 }
    ],
    "reliabilityPercent": 92
  },
  "costOptimization": {
    "currentMonthlyCost": 250,
    "optimizedMonthlyCost": 110,
    "savingsPercent": 56,
    "recommendations": [
      { "currentService": "AWS ECS Container Fleet", "optimizedService": "Railway / Vercel Serverless", "savings": "$90/mo" },
      { "currentService": "Standard AWS S3 Storage", "optimizedService": "Cloudflare R2 (Zero Egress Fees)", "savings": "$30/mo" },
      { "currentService": "Dedicated Redis Enterprise Cluster", "optimizedService": "Upstash Serverless Redis", "savings": "$20/mo" }
    ]
  },
  "moscowPrioritization": [
    { "feature": "Core AI Generation Engine", "priority": "Must Have", "impact": "High", "devTimeDays": 4 },
    { "feature": "Executive Decision Dashboard", "priority": "Must Have", "impact": "High", "devTimeDays": 3 },
    { "feature": "PowerPoint (.pptx) Export", "priority": "Must Have", "impact": "High", "devTimeDays": 2 },
    { "feature": "PDF / CSV Data Export", "priority": "Should Have", "impact": "Medium", "devTimeDays": 1 },
    { "feature": "Custom Theme Customization", "priority": "Could Have", "impact": "Low", "devTimeDays": 1 },
    { "feature": "Native Mobile Application", "priority": "Won't Have", "impact": "Low", "devTimeDays": 14 }
  ],
  "technicalDebtPrediction": [
    { "subsystem": "Authentication & Session State", "debtLevel": "Low", "prevention": "Use standard Auth.js / NextAuth tokens" },
    { "subsystem": "Database Schema Migrations", "debtLevel": "Medium", "prevention": "Use Mongoose / Prisma strict schema versioning" },
    { "subsystem": "AI Prompt Template Versioning", "debtLevel": "High", "prevention": "Decouple prompt strings into version-controlled prompt modules" },
    { "subsystem": "Automated E2E Test Coverage", "debtLevel": "High", "prevention": "Setup Playwright integration testing early" }
  ],
  "roadmapConfidence": [
    { "week": "Week 1", "confidence": 96, "riskLevel": "Low" },
    { "week": "Week 2", "confidence": 91, "riskLevel": "Medium" },
    { "week": "Week 3", "confidence": 84, "riskLevel": "Medium" },
    { "week": "Week 4", "confidence": 76, "riskLevel": "High" }
  ],
  "decisionTree": {
    "condition": "Is MVP Budget < $500/mo?",
    "ifTrue": "Deploy to Vercel + Railway + Upstash",
    "ifFalse": "Deploy to AWS ECS + ElastiCache + RDS",
    "subCondition": "Does project require > 100k concurrent active users?",
    "subIfTrue": "Migrate to Kubernetes Microservices Architecture",
    "subIfFalse": "Maintain Modular Serverless Next.js Monolith"
  },
  "investmentMatrix": {
    "investmentRequired": "Low",
    "expectedReturn": "High",
    "paybackPeriodMonths": 8,
    "riskLevel": "Low",
    "recommendation": "Strong Buy"
  },
  "swotVisualization": {
    "strengthsScore": 88,
    "weaknessesScore": 32,
    "opportunitiesScore": 85,
    "threatsScore": 40
  },
  "kpiProjections": [
    { "period": "Month 1", "users": 150, "arr": 2500 },
    { "period": "Month 6", "users": 1800, "arr": 32000 },
    { "period": "Month 12", "users": 9500, "arr": 165000 }
  ],
  "topImprovements": [
    { "improvement": "Implement Redis Response Caching", "impact": "High", "difficultyDays": 1, "roi": "High" },
    { "improvement": "Add Offline Mocks & Fallbacks", "impact": "High", "difficultyDays": 1, "roi": "High" },
    { "improvement": "OAuth 2.0 Social Login", "impact": "Medium", "difficultyDays": 1, "roi": "Medium" },
    { "improvement": "Automated PDF Summary Export", "impact": "Medium", "difficultyDays": 2, "roi": "Medium" }
  ],
  "innovationBenchmark": {
    "innovationVsAvgStartup": 28,
    "researchDepthVsAvgStartup": 41,
    "technicalComplexityVsAvgStartup": 19,
    "commercialPotentialVsAvgStartup": 36
  },
  "impactEffortMatrix": {
    "quickWins": [
      { "feature": "AI Decision Intelligence Dashboard", "impact": "High", "effort": "Low" },
      { "feature": "PowerPoint (.pptx) Export", "impact": "High", "effort": "Low" }
    ],
    "strategicBets": [
      { "feature": "Multi-Agent AI Ensemble Evaluation", "impact": "High", "effort": "High" },
      { "feature": "Real-time Code Architecture Generator", "impact": "High", "effort": "High" }
    ],
    "fillIns": [
      { "feature": "Dark / Light Mode Toggle", "impact": "Low", "effort": "Low" },
      { "feature": "Export Raw JSON Project Schema", "impact": "Low", "effort": "Low" }
    ],
    "avoid": [
      { "feature": "Custom In-House LLM Model Training", "impact": "Low", "effort": "High" },
      { "feature": "Native Mobile App Re-write", "impact": "Low", "effort": "High" }
    ]
  }
}

CRITICAL RULES:
1. Return ONLY raw JSON — no code blocks, no markdown formatting.
2. Every value must be SPECIFICALLY tailored to "${title}" and "${idea}".
3. Ensure executiveSummary.recommendationText is 150-250 words reading like a McKinsey partner report.
4. Ensure all numbers are realistic integers.`;
}
