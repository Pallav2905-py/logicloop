'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import AIPitchStudio from '@/components/sections/AIPitchStudio';
import { SkeletonCard } from '@/components/ui';
import { ArrowLeft, Video } from 'lucide-react';

export default function PitchStudioPage() {
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0F172A' }}>
        <div className="text-center">
          <p className="text-4xl mb-4">🎬</p>
          <h2 className="text-white font-bold text-xl mb-2">Project Not Found</h2>
          <p className="text-[#475569] text-sm mb-6">{error}</p>
          <button onClick={() => router.push('/')}
            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-500 transition-colors">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#0A0F1E' }}>
      <Sidebar projectTitle={project?.title} />
      <div className="lg:pl-60">
        <Topbar projectTitle={project?.title} />
        <main className="p-6 max-w-7xl mx-auto pb-20">
          {/* Back nav */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-5"
          >
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-[#475569] hover:text-white text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
          </motion.div>

          {loading ? (
            <div className="space-y-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : project ? (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <AIPitchStudio project={project} />
            </motion.div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
