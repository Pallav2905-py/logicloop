# IntelliGrade AI

**Think Bigger. Research Faster. Innovate Smarter.**

An AI platform that accelerates research, project planning, technical documentation, pitch creation, and innovation.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URI=your_mongodb_connection_string_here
```

- **GEMINI_API_KEY** — Get from [Google AI Studio](https://aistudio.google.com/apikey)
- **MONGODB_URI** — Get from [MongoDB Atlas](https://cloud.mongodb.com)

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

- 🎯 **Idea Validation** — AI-powered viability assessment
- 📊 **Innovation Score** — Novelty, feasibility, market demand
- 🔬 **Deep Research** — Market analysis, existing solutions, trends
- 💡 **Research Gaps** — Identified opportunities and innovations
- 🏗️ **Architecture Diagram** — Auto-generated Mermaid.js diagrams
- ⚡ **Tech Stack** — Curated technology recommendations
- 🐙 **GitHub Repos** — Relevant open-source projects
- 🔗 **Useful APIs** — Third-party services to use
- 📦 **Datasets** — Training and validation data sources
- 🗓️ **Sprint Roadmap** — 4-week implementation plan
- 📄 **Documentation** — README, API docs, folder structure, future scope

## Tech Stack

- **Framework** — Next.js 16 (App Router)
- **Styling** — TailwindCSS v4
- **AI** — Google Gemini API
- **Database** — MongoDB Atlas + Mongoose
- **Animations** — Framer Motion
- **Charts** — Recharts
- **Diagrams** — Mermaid.js
- **Icons** — Lucide React
