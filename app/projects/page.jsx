'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { Card, FadeIn, Badge, Skeleton } from '@/components/ui';
import { FolderOpen, ArrowRight, Clock, Gauge, Plus } from 'lucide-react';

function ScoreChip({ score }) {
  const color =
    score >= 80 ? 'success' : score >= 65 ? 'accent' : score >= 50 ? 'warning' : 'danger';
  return <Badge variant={color}>{score}/100</Badge>;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((data) => setProjects(data.projects || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="lg:pl-60">
        <Topbar />
        <main className="p-6 max-w-5xl mx-auto pb-16">
          {/* Header */}
          <FadeIn delay={0}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-[#0F172A]">Project History</h1>
                <p className="text-sm text-[#94A3B8] mt-1">
                  All previously generated projects
                </p>
              </div>
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-white text-sm font-semibold rounded-xl hover:bg-[#1E293B] transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Project
              </button>
            </div>
          </FadeIn>

          {/* Content */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex gap-4 items-center">
                  <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <FadeIn delay={0.1}>
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-14 h-14 rounded-full bg-[#F1F5F9] flex items-center justify-center mb-4">
                  <FolderOpen className="w-7 h-7 text-[#94A3B8]" />
                </div>
                <h2 className="text-lg font-semibold text-[#0F172A] mb-2">No projects yet</h2>
                <p className="text-sm text-[#94A3B8] mb-6 max-w-xs">
                  Generate your first project to see it here.
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#0F172A] text-white text-sm font-semibold rounded-xl hover:bg-[#1E293B] transition-colors"
                >
                  Start a Project
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </FadeIn>
          ) : (
            <div className="space-y-2">
              {projects.map((project, i) => (
                <FadeIn key={project._id} delay={i * 0.05}>
                  <button
                    onClick={() => router.push(`/dashboard/${project._id}`)}
                    className="w-full text-left"
                  >
                    <div className="bg-white rounded-xl border border-[#E2E8F0] hover:border-[#BFDBFE] hover:shadow-sm transition-all p-5 flex items-center gap-4 group">
                      {/* Icon */}
                      <div className="w-10 h-10 rounded-lg bg-[#F1F5F9] flex items-center justify-center flex-shrink-0">
                        <FolderOpen className="w-5 h-5 text-[#475569]" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#0F172A] truncate">
                          {project.title}
                        </p>
                        <p className="text-xs text-[#94A3B8] truncate mt-0.5">{project.idea}</p>
                      </div>

                      {/* Score */}
                      {project.innovationScore?.overall && (
                        <ScoreChip score={project.innovationScore.overall} />
                      )}

                      {/* Date */}
                      <div className="flex items-center gap-1 text-xs text-[#94A3B8] flex-shrink-0 hidden sm:flex">
                        <Clock className="w-3 h-3" />
                        {formatDate(project.createdAt)}
                      </div>

                      <ArrowRight className="w-4 h-4 text-[#CBD5E1] group-hover:text-[#2563EB] transition-colors flex-shrink-0" />
                    </div>
                  </button>
                </FadeIn>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
