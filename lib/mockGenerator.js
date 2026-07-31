// Mock generator for fallback when API keys are not provided or API calls fail
export function generateMockProjectData(idea) {
  const cleanIdea = idea.trim();
  const words = cleanIdea.split(' ');
  const title = words.slice(0, 4).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Copilot';

  return {
    title: title,
    idea: cleanIdea,
    innovationScore: {
      overall: 87,
      novelty: 85,
      feasibility: 90,
      marketDemand: 86,
    },
    validation: {
      summary: `This project addresses critical operational inefficiencies in ${cleanIdea}. By leveraging AI and modern web standards, it creates an end-to-end automated workflow.`,
      whyItMatters: `Reduces human intervention by up to 60% while accelerating output quality and delivery time.`,
      potentialUsers: [
        'Enterprise Teams',
        'Product Managers',
        'Software Engineers',
        'Research Analysts',
      ],
      businessValue: `Subscription-based SaaS business model with high customer retention and enterprise tier expansion opportunities.`,
    },
    research: {
      existingSolutions: [
        {
          name: 'Traditional Legacy Tooling',
          description: 'Siloed applications requiring high manual oversight.',
          url: 'https://example.com/legacy',
        },
        {
          name: 'First-Gen Automation Software',
          description: 'Rule-based systems lacking adaptive intelligence.',
          url: 'https://example.com/automation',
        },
        {
          name: 'Point Solution SaaS',
          description: 'Niche offering with limited integration capabilities.',
          url: 'https://example.com/point-saas',
        },
      ],
      marketAnalysis: `The target market is growing at a 22.5% CAGR, driven by rapid cloud adoption and demand for autonomous intelligence tools.`,
      challenges: [
        'Ensuring sub-second API response latency',
        'Data privacy and enterprise compliance',
        'Scalable real-time synchronization',
        'Seamless third-party integration capabilities',
      ],
      futureTrends: [
        'Agentic task automation',
        'Zero-trust cloud infrastructure',
        'Edge AI model execution',
      ],
      summary: `Market demands a cohesive, high-performance solution that unifies disparate workflows into a single intuitive interface.`,
    },
    gaps: [
      {
        gap: 'Lack of real-time multi-source data synthesis',
        opportunity: 'Unified data ingestion pipeline',
        potentialInnovation: 'Stream-processed AI feature mapping engine',
      },
      {
        gap: 'High barrier to entry for non-technical users',
        opportunity: 'Zero-code dashboard interfaces',
        potentialInnovation: 'Conversational workflow builder',
      },
      {
        gap: 'Fragmented documentation and asset handoffs',
        opportunity: 'Automated artifact generator',
        potentialInnovation: 'One-click full specification exporter',
      },
    ],
    architecture: `graph TD\n  A[Client Web App] --> B[API Gateway / Edge Router]\n  B --> C[Auth & Session Manager]\n  B --> D[Core Business Logic Engine]\n  D --> E[(MongoDB Primary Store)]\n  D --> F[AI Processing Pipeline]\n  F --> G[External Integrations & APIs]`,
    techStack: {
      frontend: ['Next.js 16', 'TailwindCSS', 'Framer Motion', 'Recharts'],
      backend: ['Node.js', 'Express', 'Next.js App Router API'],
      database: ['MongoDB Atlas', 'Mongoose ORM'],
      authentication: ['NextAuth.js', 'JWT'],
      deployment: ['Vercel Platform', 'Docker Containers'],
      cloud: ['AWS S3', 'Cloudflare CDN'],
      ai: ['Google Gemini API', 'Custom Prompt Engine'],
    },
    github: [
      {
        name: 'vercel/next.js',
        stars: '120k',
        description: 'The React Framework for the Web',
        url: 'https://github.com/vercel/next.js',
      },
      {
        name: 'shadcn-ui/ui',
        stars: '65k',
        description: 'Beautifully designed components built with Tailwind CSS.',
        url: 'https://github.com/shadcn-ui/ui',
      },
      {
        name: 'pmndrs/framer-motion',
        stars: '24k',
        description: 'Open source, ready-to-use animation library for React',
        url: 'https://github.com/framer/motion',
      },
      {
        name: 'recharts/recharts',
        stars: '23k',
        description: 'Redefined chart library built with React and D3',
        url: 'https://github.com/recharts/recharts',
      },
    ],
    apis: [
      {
        name: 'Google Gemini API',
        description: 'Multimodal AI generation and structured data reasoning',
        website: 'https://ai.google.dev',
      },
      {
        name: 'MongoDB Atlas Data API',
        description: 'Fully managed cloud database platform',
        website: 'https://mongodb.com/atlas',
      },
      {
        name: 'GitHub REST API',
        description: 'Repository insights, metadata, and developer metrics',
        website: 'https://docs.github.com/rest',
      },
      {
        name: 'Vercel Analytics API',
        description: 'Real-time performance and web vitals monitoring',
        website: 'https://vercel.com/analytics',
      },
    ],
    datasets: [
      {
        name: 'Open Innovation Repository',
        description: '100,000+ benchmarked technical project specifications.',
        url: 'https://huggingface.co/datasets',
      },
      {
        name: 'TechStack Adoption Index',
        description: 'Empirical data on software architectural choices across SaaS.',
        url: 'https://github.com/topics/awesome-datasets',
      },
      {
        name: 'Global Software Market Trends 2025',
        description: 'Anonymized analytics on enterprise tool selection.',
        url: 'https://kaggle.com/datasets',
      },
    ],
    roadmap: {
      week1: {
        title: 'Foundation & Core Architecture',
        tasks: [
          'Setup repository & Next.js 16 environment',
          'Configure MongoDB connection and data schemas',
          'Implement core UI layout and responsive design tokens',
          'Build Gemini API prompt engine integration',
        ],
      },
      week2: {
        title: 'Dashboard & Visualization Engine',
        tasks: [
          'Develop Innovation Gauge using Recharts',
          'Integrate Mermaid.js dynamic diagram renderer',
          'Build tabbed documentation viewer & markdown export',
          'Add sprint roadmap timeline component',
        ],
      },
      week3: {
        title: 'Integration & Optimization',
        tasks: [
          'Add animated step-by-step loading state with Framer Motion',
          'Implement project history & search functionality',
          'Add error recovery and fallback data handling',
          'Conduct accessibility and cross-browser testing',
        ],
      },
      week4: {
        title: 'Polish & Launch',
        tasks: [
          'Optimize initial page load performance and bundle size',
          'Finalize enterprise styling and typography hierarchy',
          'Deploy to production environment',
          'Prepare demonstration materials and hackathon submission',
        ],
      },
    },
    documentation: {
      readme: `# ${title}\n\n## Overview\n${cleanIdea}\n\n## Key Features\n- **Automated Validation**: Instant viability and market scoring\n- **Deep Research**: Comprehensive competitor and trend analysis\n- **Interactive Architecture**: Visual Mermaid system diagram\n- **Sprint Planning**: 4-week actionable implementation roadmap\n\n## Quick Start\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n\nOpen [http://localhost:3000](http://localhost:3000) to access the dashboard.`,
      folderStructure: `/project-root\n├── /app\n│   ├── /api/generate\n│   ├── /dashboard/[id]\n│   ├── /projects\n│   └── page.js\n├── /components\n│   ├── /layout\n│   ├── /sections\n│   └── /ui\n├── /lib\n│   ├── gemini.js\n│   └── mongodb.js\n└── package.json`,
      apiDocs: `## API Specification\n\n### POST /api/generate\nGenerates a full project structure from an idea string.\n\n**Request Header:** \`Content-Type: application/json\`\n\n**Body:**\n\`\`\`json\n{\n  "idea": "${cleanIdea}"\n}\n\`\`\`\n\n**Response 201 Created:**\n\`\`\`json\n{\n  "success": true,\n  "project": { ... }\n}\n\`\`\``,
      futureScope: `## Long-Term Product Roadmap\n\n### Phase 2: Enterprise Team Collaboration\n- Multi-user real-time co-editing of roadmaps\n- Webhook integrations with Jira and GitHub Issues\n\n### Phase 3: Automated Code Scaffolding\n- Direct repository generation with standard boilerplate code\n- CI/CD workflow generator for GitHub Actions`,
    },
  };
}
