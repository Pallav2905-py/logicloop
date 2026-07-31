'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import InnovationScore from '@/components/sections/InnovationScore';
import EvaluationEngine from '@/components/sections/EvaluationEngine';
import AIReasoningProcess from '@/components/sections/AIReasoningProcess';
import IdeaValidation from '@/components/sections/IdeaValidation';
import DeepResearch from '@/components/sections/DeepResearch';
import ResearchGaps from '@/components/sections/ResearchGaps';
import ArchitectureDiagram from '@/components/sections/ArchitectureDiagram';
import TechStack from '@/components/sections/TechStack';
import GitHubRepos from '@/components/sections/GitHubRepos';
import UsefulAPIs from '@/components/sections/UsefulAPIs';
import Datasets from '@/components/sections/Datasets';
import SprintRoadmap from '@/components/sections/SprintRoadmap';
import Documentation from '@/components/sections/Documentation';
import { SkeletonCard, FadeIn } from '@/components/ui';

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <SkeletonCard />
    </div>
  );
}

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/${params.id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Project not found');
        setProject(data.project);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchProject();
  }, [params.id]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <p className="text-4xl mb-4">🔍</p>
          <h2 className="text-xl font-bold text-[#0F172A] mb-2">Project Not Found</h2>
          <p className="text-sm text-[#475569] mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2.5 bg-[#0F172A] text-white text-sm font-semibold rounded-xl hover:bg-[#1E293B] transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar projectTitle={project?.title} />

      {/* Main content with sidebar offset */}
      <div className="lg:pl-60">
        <Topbar projectTitle={project?.title} />

        <main className="p-6 max-w-7xl mx-auto space-y-6 pb-16">
          {/* Page header */}
          {!loading && project && (
            <FadeIn delay={0}>
              <div className="mb-2">
                <h1 className="text-2xl font-bold text-[#0F172A]">{project.title}</h1>
                <p className="text-sm text-[#94A3B8] mt-1 leading-relaxed line-clamp-2">
                  {project.idea}
                </p>
              </div>
            </FadeIn>
          )}

          {loading ? (
            <DashboardSkeleton />
          ) : project ? (
            <>
              {/* AI Consensus Score — full width analytics panel */}
              <FadeIn delay={0.05}>
                <InnovationScore
                  innovationScore={project.innovationScore}
                  evaluation={project.evaluation}
                />
              </FadeIn>

              {/* AI Evaluation Engine — 5 evaluator cards */}
              <FadeIn delay={0.1}>
                <EvaluationEngine evaluation={project.evaluation} />
              </FadeIn>

              {/* AI Reasoning Process — positive/critical/confidence/risks/opportunities */}
              <FadeIn delay={0.15}>
                <AIReasoningProcess evaluation={project.evaluation} />
              </FadeIn>

              {/* Idea Validation */}
              <FadeIn delay={0.18}>
                <IdeaValidation validation={project.validation} />
              </FadeIn>

              {/* Deep Research */}
              <FadeIn delay={0.2}>
                <DeepResearch research={project.research} />
              </FadeIn>

              {/* Research Gaps */}
              <FadeIn delay={0.22}>
                <ResearchGaps gaps={project.gaps} />
              </FadeIn>

              {/* Architecture Diagram */}
              <FadeIn delay={0.24}>
                <ArchitectureDiagram architecture={project.architecture} />
              </FadeIn>

              {/* Tech Stack */}
              <FadeIn delay={0.26}>
                <TechStack techStack={project.techStack} />
              </FadeIn>

              {/* Row: GitHub + APIs */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <FadeIn delay={0.28}>
                  <GitHubRepos github={project.github} />
                </FadeIn>
                <FadeIn delay={0.3}>
                  <UsefulAPIs apis={project.apis} />
                </FadeIn>
              </div>

              {/* Datasets */}
              <FadeIn delay={0.32}>
                <Datasets datasets={project.datasets} />
              </FadeIn>

              {/* Sprint Roadmap */}
              <FadeIn delay={0.34}>
                <SprintRoadmap roadmap={project.roadmap} />
              </FadeIn>

              {/* Documentation */}
              <FadeIn delay={0.36}>
                <Documentation documentation={project.documentation} projectTitle={project.title} />
              </FadeIn>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}
