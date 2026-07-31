import mongoose from 'mongoose';

const WeeklyPlanSchema = new mongoose.Schema({
  title: String,
  tasks: [String],
});

const ProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    idea: { type: String, required: true },
    innovationScore: {
      overall: Number,
      novelty: Number,
      feasibility: Number,
      marketDemand: Number,
    },
    validation: {
      summary: String,
      whyItMatters: String,
      potentialUsers: [String],
      businessValue: String,
    },
    research: {
      existingSolutions: [{ name: String, description: String, url: String }],
      marketAnalysis: String,
      challenges: [String],
      futureTrends: [String],
      summary: String,
    },
    gaps: [{ gap: String, opportunity: String, potentialInnovation: String }],
    architecture: String,
    techStack: {
      frontend: [String],
      backend: [String],
      database: [String],
      authentication: [String],
      deployment: [String],
      cloud: [String],
      ai: [String],
    },
    github: [{ name: String, stars: String, description: String, url: String }],
    apis: [{ name: String, description: String, website: String }],
    datasets: [{ name: String, description: String, url: String }],
    roadmap: {
      week1: WeeklyPlanSchema,
      week2: WeeklyPlanSchema,
      week3: WeeklyPlanSchema,
      week4: WeeklyPlanSchema,
    },
    documentation: {
      readme: String,
      folderStructure: String,
      apiDocs: String,
      futureScope: String,
    },
  },
  { timestamps: true }
);

const Project =
  mongoose.models.Project || mongoose.model('Project', ProjectSchema);

export default Project;
