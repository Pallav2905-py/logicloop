import os

with open('app/api/projects/[id]/pitch-deck/route.js', 'r') as f:
    content = f.read()

# We need to replace the entire buildFallbackDeckJson function.
import re

new_fallback = """function buildFallbackDeckJson(project) {
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
}"""

# Use regex to replace the function definition entirely
pattern = re.compile(r'function buildFallbackDeckJson\(project\) \{[\s\S]*?\}\n\n\/\/ ─── POST', re.MULTILINE)
new_content = pattern.sub(new_fallback + '\n\n// ─── POST', content)

with open('app/api/projects/[id]/pitch-deck/route.js', 'w') as f:
    f.write(new_content)
print("Updated route.js")
