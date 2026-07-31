// Mock generator for fallback when API keys are not provided or API calls fail
export function generateMockProjectData(idea) {
  const cleanIdea = idea.trim();
  const lowerIdea = cleanIdea.toLowerCase();

  // Extract key topic words to construct title
  const words = cleanIdea
    .replace(/[^\w\s]/gi, '')
    .split(/\s+/)
    .filter(w => !['a', 'an', 'the', 'for', 'and', 'or', 'in', 'on', 'at', 'to', 'with', 'by', 'build', 'create', 'make'].includes(w.toLowerCase()));

  const topicName = words.slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const title = topicName ? `${topicName} Platform` : 'Smart Innovation Platform';

  // Domain detection
  let domain = 'general';
  if (lowerIdea.match(/food|recipe|fridge|kitchen|cook|meal|grocery/)) domain = 'food';
  else if (lowerIdea.match(/health|medical|doctor|fit|workout|patient|clinic/)) domain = 'health';
  else if (lowerIdea.match(/finance|money|bank|crypto|trade|stock|pay|invest/)) domain = 'finance';
  else if (lowerIdea.match(/code|dev|repo|bug|review|git|syntax|compiler|api/)) domain = 'dev';
  else if (lowerIdea.match(/shop|store|ecommerce|product|sell|cart|market/)) domain = 'ecommerce';
  else if (lowerIdea.match(/security|auth|privacy|hack|vulnerability|audit/)) domain = 'security';
  else if (lowerIdea.match(/edu|student|learn|course|teach|school|quiz/)) domain = 'education';
  else if (lowerIdea.match(/iot|sensor|hardware|smart home|device|grid/)) domain = 'iot';
  else if (lowerIdea.match(/ai|agent|llm|gpt|model|nlp|vision|bot/)) domain = 'ai';

  // Custom domain data dictionary
  const domainConfigs = {
    food: {
      users: ['Home Chefs', 'Nutritionists', 'Busy Families', 'Dietitians'],
      existing: [
        { name: 'Yummly', description: 'Personalized recipe recommendations based on dietary preferences.', url: 'https://www.yummly.com' },
        { name: 'SuperCook', description: 'Recipe generator based on available household ingredients.', url: 'https://www.supercook.com' },
        { name: 'MyFitnessPal', description: 'Calorie counter and nutritional tracking application.', url: 'https://www.myfitnesspal.com' }
      ],
      github: [
        { name: 'spoonacular/food-api-sdk', stars: '2.4k', description: 'Official SDK for recipe and ingredient intelligence.', url: 'https://github.com/spoonacular/food-api-sdk' },
        { name: 'openfoodfacts/openfoodfacts-server', stars: '4.1k', description: 'Open database of food products from around the world.', url: 'https://github.com/openfoodfacts/openfoodfacts-server' },
        { name: 'food-ai/nutrition-parser', stars: '1.8k', description: 'NLP model for extracting nutritional metrics from raw text.', url: 'https://github.com/food-ai/nutrition-parser' }
      ],
      apis: [
        { name: 'Spoonacular Food API', description: 'Over 365,000 recipes and ingredient data points.', website: 'https://spoonacular.com/food-api' },
        { name: 'Edamam Nutrition API', description: 'Real-time recipe analysis and meal database.', website: 'https://developer.edamam.com' }
      ],
      datasets: [
        { name: 'Recipe1M+ Dataset', description: '1 million structured recipes with images and ingredients.', url: 'https://huggingface.co/datasets/recipe1m' },
        { name: 'USDA FoodData Central', description: 'Comprehensive nutritional profiles maintained by USDA.', url: 'https://fdc.nal.usda.gov' }
      ],
      ai: ['Google Gemini Vision API', 'OpenAI GPT-4o', 'Edamam NLP Engine'],
    },
    health: {
      users: ['Healthcare Providers', 'Patients', 'Fitness Coaches', 'Clinical Researchers'],
      existing: [
        { name: 'Epic Systems', description: 'Enterprise electronic health record (EHR) platform.', url: 'https://www.epic.com' },
        { name: 'Ada Health', description: 'AI-driven symptom assessment and care navigation app.', url: 'https://ada.com' },
        { name: 'Whoop', description: 'Wearables and recovery analytics engine.', url: 'https://www.whoop.com' }
      ],
      github: [
        { name: 'hspconsortium/clinical-quality-language', stars: '1.2k', description: 'Clinical reasoning engine and decision support standards.', url: 'https://github.com/cqframework/cql-execution' },
        { name: 'fast-fhir/fhir-client', stars: '2.9k', description: 'JavaScript client for HL7 FHIR healthcare APIs.', url: 'https://github.com/smart-on-fhir/client-js' }
      ],
      apis: [
        { name: 'Human API', description: 'Unified health data network connecting EHRs and wearables.', website: 'https://www.humanapi.co' },
        { name: 'Infermedica Health API', description: 'AI medical guidance and symptom check API.', website: 'https://infermedica.com' }
      ],
      datasets: [
        { name: 'PhysioNet Challenge Datasets', description: 'Biomedical signals and clinical time-series data.', url: 'https://physionet.org' },
        { name: 'MIMIC-IV Clinical Database', description: 'De-identified electronic health records for ICU research.', url: 'https://mimic.mit.edu' }
      ],
      ai: ['BioBERT Medical Model', 'Google Gemini 2.0 Flash', 'Med-PaLM 2 API'],
    },
    finance: {
      users: ['Retail Investors', 'Financial Analysts', 'Fintech Developers', 'Risk Officers'],
      existing: [
        { name: 'Plaid Portal', description: 'Account aggregation and financial data integration API.', url: 'https://plaid.com' },
        { name: 'TradingView', description: 'Financial charting platform and algorithmic analysis.', url: 'https://www.tradingview.com' },
        { name: 'Bloomberg Terminal', description: 'Institutional data and analytics execution platform.', url: 'https://www.bloomberg.com' }
      ],
      github: [
        { name: 'alpacahq/alpaca-py', stars: '3.5k', description: 'Algorithmic trading and market data SDK.', url: 'https://github.com/alpacahq/alpaca-py' },
        { name: 'ranaroussi/yfinance', stars: '14.8k', description: 'Financial market downloader for Yahoo Finance.', url: 'https://github.com/ranaroussi/yfinance' }
      ],
      apis: [
        { name: 'Plaid Financial API', description: 'Secure bank account linking and transaction streaming.', website: 'https://plaid.com' },
        { name: 'Alpha Vantage API', description: 'Stock market data, crypto, and technical indicators.', website: 'https://www.alphavantage.co' }
      ],
      datasets: [
        { name: 'Kaggle Financial News & Sentiment', description: 'Market sentiment annotated financial headlines.', url: 'https://www.kaggle.com' },
        { name: 'SEC EDGAR XBRL Dataset', description: 'Public company financial statements and annual filings.', url: 'https://www.sec.gov/edgar' }
      ],
      ai: ['FinBERT Sentiment Engine', 'Google Gemini Financial Analyst', 'Prophet Forecasting Model'],
    },
    dev: {
      users: ['DevOps Engineers', 'Frontend Developers', 'Engineering Managers', 'Open Source Maintainers'],
      existing: [
        { name: 'GitHub Copilot', description: 'AI pair programmer for code completion and chat.', url: 'https://github.com/features/copilot' },
        { name: 'Sentry', description: 'Real-time application monitoring and error tracking.', url: 'https://sentry.io' },
        { name: 'SonarQube', description: 'Continuous code quality and security inspection.', url: 'https://www.sonarqube.org' }
      ],
      github: [
        { name: 'langchain-ai/langchain', stars: '92k', description: 'Framework for developing applications powered by language models.', url: 'https://github.com/langchain-ai/langchain' },
        { name: 'astral-sh/ruff', stars: '31k', description: 'Extremely fast Python linter and code formatter.', url: 'https://github.com/astral-sh/ruff' }
      ],
      apis: [
        { name: 'GitHub REST API', description: 'Repository management, commits, pull requests, and issues.', website: 'https://docs.github.com/rest' },
        { name: 'OpenAI Code Interpreter API', description: 'Execution environment for dynamic code reasoning.', website: 'https://platform.openai.com' }
      ],
      datasets: [
        { name: 'The Stack (BigCode)', description: '6 TB of permissively-licensed source code corpus.', url: 'https://huggingface.co/datasets/bigcode/the-stack' },
        { name: 'HumanEval Benchmark', description: 'Standard benchmark for python programming synthesis.', url: 'https://github.com/openai/human-eval' }
      ],
      ai: ['Claude 3.5 Sonnet API', 'Google Gemini CodeAssist', 'DeepSeek-Coder Engine'],
    },
    ecommerce: {
      users: ['Merchants', 'E-commerce Shoppers', 'Inventory Managers', 'Digital Marketers'],
      existing: [
        { name: 'Shopify Storefront', description: 'Global commerce platform for digital stores.', url: 'https://www.shopify.com' },
        { name: 'Algolia Search', description: 'AI search and discovery engine for retail.', url: 'https://www.algolia.com' },
        { name: 'Stripe Commerce', description: 'Payment infrastructure and subscription billing.', url: 'https://stripe.com' }
      ],
      github: [
        { name: 'medusajs/medusa', stars: '24k', description: 'Building blocks for digital commerce applications.', url: 'https://github.com/medusajs/medusa' },
        { name: 'saleor/saleor', stars: '19k', description: 'Modular GraphQL-first headless e-commerce engine.', url: 'https://github.com/saleor/saleor' }
      ],
      apis: [
        { name: 'Stripe Payments API', description: 'Global payment processing and fraud prevention.', website: 'https://stripe.com/docs/api' },
        { name: 'Shopify Admin API', description: 'Product inventory, order fulfillment, and webhooks.', website: 'https://shopify.dev/docs/api' }
      ],
      datasets: [
        { name: 'Amazon Product Reviews', description: 'Customer reviews and item metadata across 29 categories.', url: 'https://huggingface.co/datasets/amazon_reviews_multi' },
        { name: 'UCI Online Retail Dataset', description: 'Real transactional data from a UK-based online retailer.', url: 'https://archive.ics.uci.edu/dataset/352/online+retail' }
      ],
      ai: ['Algolia NeuralSearch', 'Google Gemini Personalization Engine', 'Stripe Radar Fraud Prevention'],
    },
    general: {
      users: ['Enterprise Teams', 'Product Managers', 'Software Engineers', 'Operational Leads'],
      existing: [
        { name: 'Notion AI Workspace', description: 'Connected workspace with integrated intelligence tools.', url: 'https://www.notion.so' },
        { name: 'Zapier Central', description: 'No-code automation and multi-app orchestration.', url: 'https://zapier.com' },
        { name: 'Linear Systems', description: 'Purpose-built tool for modern software project management.', url: 'https://linear.app' }
      ],
      github: [
        { name: 'vercel/next.js', stars: '124k', description: 'The React framework for the web.', url: 'https://github.com/vercel/next.js' },
        { name: 'shadcn-ui/ui', stars: '68k', description: 'Beautifully designed accessible UI component collection.', url: 'https://github.com/shadcn-ui/ui' }
      ],
      apis: [
        { name: 'Google Gemini API', description: 'Multimodal AI generation and structured reasoning.', website: 'https://ai.google.dev' },
        { name: 'Vercel Analytics API', description: 'Real-time performance and web vitals monitoring.', website: 'https://vercel.com' }
      ],
      datasets: [
        { name: 'Awesome Datasets Index', description: 'Curated list of high-quality public domain datasets.', url: 'https://github.com/awesomedata/newsletter' },
        { name: 'Open Innovation Repository', description: '100,000+ benchmarked technical project specifications.', url: 'https://huggingface.co/datasets' }
      ],
      ai: ['Google Gemini 2.0 Flash', 'LangChain Agent Framework', 'Pinecone Vector DB'],
    }
  };

  const cfg = domainConfigs[domain] || domainConfigs.general;

  return {
    title: title,
    idea: cleanIdea,
    innovationScore: {
      overall: 88,
      novelty: 86,
      feasibility: 91,
      marketDemand: 87,
      confidence: 88,
      technicalComplexity: 68,
      researchCoverage: 82,
      riskIndex: 34,
    },
    evaluation: {
      evaluators: [
        {
          name: 'Innovation Analyst',
          role: 'Originality & Novelty Assessment',
          score: 88,
          confidence: 91,
          summary: `The core concept behind "${cleanIdea}" demonstrates a meaningful advance over current approaches. The proposed automation and intelligence layer introduces differentiation that existing tools lack. Originality is high given the synthesis of multiple technologies into a unified experience.`,
          strengths: [
            'Novel combination of AI reasoning and domain-specific tooling',
            'Addresses a gap that incumbents have not yet filled end-to-end',
            'Strong potential for patentable workflow innovations',
          ],
          concerns: [
            'Adjacent products could pivot to cover this space within 12-18 months',
            'Core novelty depends heavily on AI model quality, which is a commodity',
          ],
        },
        {
          name: 'Technical Architect',
          role: 'Feasibility & Implementation Complexity',
          score: 83,
          confidence: 89,
          summary: `From a technical standpoint, "${cleanIdea}" is buildable with modern cloud-native infrastructure and open-source tooling. The primary complexity lies in orchestrating the AI pipeline reliably at scale. A skilled team of 2-3 engineers can deliver a working MVP within the proposed 4-week sprint.`,
          strengths: [
            'Well-understood tech stack with mature ecosystem support',
            'Next.js App Router simplifies full-stack delivery significantly',
            'Modular architecture allows for incremental capability expansion',
          ],
          concerns: [
            'Real-time AI inference latency may exceed user expectations at scale',
            'State management complexity increases significantly with multi-tenant data',
          ],
        },
        {
          name: 'Market Strategist',
          role: 'Market Demand & Commercialization',
          score: 85,
          confidence: 87,
          summary: `The market for "${cleanIdea}" is growing rapidly, driven by enterprise demand for automated intelligence workflows. A freemium SaaS model with usage-based pricing has strong precedent in adjacent categories. Early enterprise adoption is achievable if the product demonstrates measurable ROI within 30 days of onboarding.`,
          strengths: [
            'Clear willingness-to-pay signal from comparable tools in the category',
            'Large addressable market with multiple viable customer segments',
            'Subscription model enables predictable ARR growth trajectory',
          ],
          concerns: [
            'Customer acquisition costs may be high in a crowded SaaS landscape',
            'Sales cycles for enterprise tiers typically exceed 60-90 days',
          ],
        },
        {
          name: 'Risk Analyst',
          role: 'Risks, Limitations & Failure Points',
          score: 66,
          confidence: 84,
          summary: `The greatest risk for "${cleanIdea}" is product-market fit validation. Many similar tools have failed not from technical shortcomings but from underestimating the behavioral change required from users. Data dependency and AI hallucination risks must be managed with robust fallback mechanisms from day one.`,
          strengths: [
            'Risk profile is manageable with proper API fallback strategies in place',
            'Open source community can serve as an early adopter validation channel',
          ],
          concerns: [
            'High dependency on third-party AI APIs creates cost and reliability exposure',
            'Regulatory and compliance requirements may delay enterprise sales in certain verticals',
            'Scaling infrastructure costs may compress margins before profitability is reached',
          ],
        },
        {
          name: 'Research Mentor',
          role: 'Research Gaps & Future Directions',
          score: 90,
          confidence: 93,
          summary: `"${cleanIdea}" opens rich opportunities for applied research in human-AI collaboration and automated reasoning systems. The problem space has significant published literature, suggesting academic interest and potential for research-backed product differentiation. Long-term, this project could serve as a research platform for studying AI-assisted decision-making at scale.`,
          strengths: [
            'Rich academic literature base for grounding design decisions in evidence',
            'Strong opportunity to contribute novel benchmark datasets back to the community',
            'Research partnerships could accelerate product credibility and press coverage',
          ],
          concerns: [
            'Academic research timelines may not align with startup delivery cadence',
            'Reproducing research findings in production environments is non-trivial',
          ],
        },
      ],
      consensusScore: 82,
      positiveAnalysis: [
        'Strong and growing market demand with validated willingness to pay',
        `Novel AI-driven approach that distinguishes the product from existing ${domain} tools`,
        'High automation potential reduces user effort by an estimated 60%',
        'Scalable architecture supports growth from MVP to enterprise-grade deployment',
      ],
      criticalAnalysis: [
        'Several adjacent products exist and could pivot to cover this space',
        'Implementation complexity is non-trivial, especially for real-time AI inference',
        'Heavy dependency on external AI APIs creates long-term cost and reliability risks',
        'Behavioral change required from users may slow initial adoption rates',
      ],
      consensusSummary: `After independent analysis by all five expert evaluators, the panel reaches a consensus that "${cleanIdea}" represents a strong and viable project with a realistic path to market. The combination of genuine novelty, a growing addressable market, and manageable technical risk justifies a high recommendation score. The primary watch areas are AI dependency management and user adoption strategy.`,
      confidenceLevel: 88,
      confidenceExplanation: 'High confidence based on strong research coverage, consistent evaluator alignment, and available public benchmarks.',
      keyRisks: [
        'Third-party AI API cost volatility and rate limit exposure',
        'Enterprise sales cycle length extending runway requirements',
        'Competitor pivot risk from established adjacent-market players',
      ],
      keyOpportunities: [
        `First-mover advantage in the ${domain} AI automation vertical`,
        'Research partnership opportunities with academic institutions',
        'Expansion into adjacent verticals after core product validation',
      ],
    },
    validation: {
      summary: `This project directly addresses core workflow bottlenecks in "${cleanIdea}". By orchestrating modern web architecture with automated intelligent pipelines, it delivers a seamless end-to-end user experience.`,
      whyItMatters: `Eliminates manual overhead by up to 65% while accelerating delivery quality and operational throughput.`,
      potentialUsers: cfg.users,
      businessValue: `SaaS subscription tiers with high expansion potential and enterprise API integration modules.`,
    },
    research: {
      existingSolutions: cfg.existing,
      marketAnalysis: `The target sector is expanding rapidly at a 21.4% CAGR, driven by high demand for automated intelligence and modern cloud-native workflows.`,
      challenges: [
        'Ensuring sub-100ms API response latency across regions',
        'Data privacy, encryption, and regulatory compliance',
        'Scalable real-time data sync & webhooks',
        'Seamless integration with third-party ecosystems'
      ],
      futureTrends: [
        'Agentic task automation',
        'Edge AI model execution',
        'Zero-trust cloud infrastructure'
      ],
      summary: `The competitive landscape demands a unified, ultra-responsive solution that addresses legacy software fragmentation.`,
    },
    gaps: [
      {
        gap: `Fragmented tooling and poor cross-platform synchronization in current ${domain} products`,
        opportunity: `Unified real-time data ingestion and processing pipeline`,
        potentialInnovation: `Automated feature mapping & intelligence engine tailored to ${cleanIdea}`,
      },
      {
        gap: `High onboarding complexity and steep learning curves for non-technical users`,
        opportunity: `Zero-friction conversational UI and adaptive dashboard`,
        potentialInnovation: `Context-aware prompt builder and workflow assistant`,
      },
      {
        gap: `Lack of verifiable automated documentation and reporting mechanisms`,
        opportunity: `One-click full specification and analytics exporter`,
        potentialInnovation: `Real-time SVG & PDF reporting engine with live metrics`,
      },
    ],
    architecture: `graph TD\n  A[Client Web Application] --> B[API Gateway / Edge Router]\n  B --> C[Auth & Session Manager]\n  B --> D[Core Business Logic Engine]\n  D --> E[(Primary Database Store)]\n  D --> F[AI Processing Pipeline]\n  F --> G[External Integrations & APIs]`,
    techStack: {
      frontend: ['Next.js 15', 'TailwindCSS', 'Framer Motion', 'Recharts'],
      backend: ['Node.js', 'Express API', 'Next.js App Router'],
      database: ['PostgreSQL / MongoDB', 'Redis Cache Store'],
      authentication: ['NextAuth.js', 'JWT Sessions'],
      deployment: ['Vercel Platform', 'Docker Containers'],
      cloud: ['AWS S3', 'Cloudflare CDN'],
      ai: cfg.ai,
    },
    github: cfg.github,
    apis: cfg.apis,
    datasets: cfg.datasets,
    roadmap: {
      week1: {
        title: 'Foundation & Setup',
        tasks: [
          `Initialize Next.js 15 environment for ${title}`,
          'Configure primary database models and schema validations',
          'Implement core UI framework and design system components',
          'Set up API routing and auth middleware',
        ],
      },
      week2: {
        title: 'Core Engine & Features',
        tasks: [
          `Build primary business logic handlers for ${title}`,
          'Integrate intelligent processing pipelines & fallback handlers',
          'Develop interactive visualization cards and metrics dashboards',
          'Implement user settings and preferences state management',
        ],
      },
      week3: {
        title: 'Integration & Testing',
        tasks: [
          'Connect external APIs and third-party webhooks',
          'Implement automated unit and integration tests',
          'Add step-by-step loading transitions and toast notifications',
          'Perform cross-browser and responsiveness validation',
        ],
      },
      week4: {
        title: 'Polish & Launch',
        tasks: [
          'Optimize server-side rendering performance and bundle metrics',
          'Finalize SEO metadata, titles, and open graph social cards',
          'Deploy application to production server',
          'Publish project documentation and demo walk-through',
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
