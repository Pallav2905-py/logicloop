'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, CheckCircle2, Loader2 } from 'lucide-react';

const STAGES = [
  { id: 'validate', label: 'Validating idea...', duration: 1500 },
  { id: 'normalize', label: 'Normalizing project...', duration: 1500 },
  { id: 'queries', label: 'Generating research queries...', duration: 1500 },
  { id: 'github', label: 'Searching GitHub repositories...', duration: 3000 },
  { id: 'web', label: 'Searching web & competitors...', duration: 2500 },
  { id: 'papers', label: 'Checking research papers...', duration: 2500 },
  { id: 'patents', label: 'Checking prior art & patents...', duration: 2000 },
  { id: 'synthesis', label: 'Synthesizing evidence (AI Call 1)...', duration: 8000 },
  { id: 'solution', label: 'Developing solution strategy (AI Call 2)...', duration: 7000 },
  { id: 'critic', label: 'Running adversarial critic (AI Call 3)...', duration: 7000 },
  { id: 'consensus', label: 'Building final consensus (AI Call 4)...', duration: 8000 },
  { id: 'report', label: 'Preparing report...', duration: 2000 },
];

function LoadingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const calledRef = useRef(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [completedStages, setCompletedStages] = useState([]);
  const [error, setError] = useState('');
  const [clarification, setClarification] = useState('');

  const title = searchParams.get('title') || '';
  const description = searchParams.get('description') || '';
  const market = searchParams.get('market') || '';
  const users = (() => { try { return JSON.parse(searchParams.get('users') || '[]'); } catch { return []; } })();
  const constraints = (() => { try { return JSON.parse(searchParams.get('constraints') || '[]'); } catch { return []; } })();

  useEffect(() => {
    if (!title || !description) { router.replace('/validate'); return; }
    if (calledRef.current) return;
    calledRef.current = true;

    // Animate stages
    let idx = 0;
    const animate = () => {
      if (idx >= STAGES.length) return;
      setCurrentStage(idx);
      const dur = STAGES[idx].duration;
      setTimeout(() => {
        setCompletedStages(prev => [...prev, idx]);
        idx++;
        if (idx < STAGES.length) animate();
      }, dur);
    };
    animate();

    // Actual API call
    const run = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      try {
        const res = await fetch(`${apiUrl}/api/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description, target_users: users, market, constraints }),
        });
        const data = await res.json();

        if (data.status === 'clarification_needed') {
          setClarification(data.clarification_message || 'Please provide more detail.');
          return;
        }

        if (data.status !== 'success' || !data.report) {
          setError(data.error || 'Analysis failed. Please try again.');
          return;
        }

        // Store report in sessionStorage (avoids URL size limits)
        sessionStorage.setItem('validation_report', JSON.stringify(data.report));
        sessionStorage.setItem('validation_warnings', JSON.stringify(data.warnings || []));

        // Wait for animation to at least reach synthesis
        await new Promise(r => setTimeout(r, 3000));
        router.push('/validate/report');
      } catch (err) {
        setError(`Connection failed: ${err.message}. Make sure the backend is running on port 5000.`);
      }
    };
    run();
  }, []);

  if (clarification) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center mx-auto mb-4 text-2xl">💬</div>
          <h2 className="text-xl font-bold text-[#0F172A] mb-2">More Detail Needed</h2>
          <p className="text-sm text-[#475569] mb-6">{clarification}</p>
          <button onClick={() => router.back()} className="px-6 py-2.5 bg-[#0F172A] text-white text-sm font-semibold rounded-xl hover:bg-[#1E293B] transition-colors">
            Go Back & Add More Detail
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center mx-auto mb-4 text-2xl">⚠️</div>
          <h2 className="text-xl font-bold text-[#0F172A] mb-2">Analysis Failed</h2>
          <p className="text-sm text-[#475569] mb-6">{error}</p>
          <button onClick={() => router.push('/validate')} className="px-6 py-2.5 bg-[#0F172A] text-white text-sm font-semibold rounded-xl hover:bg-[#1E293B] transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const progress = (completedStages.length / STAGES.length) * 100;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-6">
      <div className="max-w-lg w-full">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-8 h-8 bg-[#0F172A] rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-[#0F172A] text-lg tracking-tight">IntelliGrade AI</span>
        </div>

        {/* Project preview */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 mb-6 shadow-sm">
          <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Analyzing</p>
          <p className="text-sm font-bold text-[#0F172A] mb-0.5">{title}</p>
          <p className="text-xs text-[#475569] line-clamp-2">{description}</p>
        </div>

        {/* Stage list */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm mb-4">
          <p className="text-sm font-semibold text-[#0F172A] mb-4">Running 5-agent validation pipeline...</p>
          <div className="space-y-3">
            {STAGES.map((stage, i) => {
              const done = completedStages.includes(i);
              const active = currentStage === i && !done;
              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-5 h-5 flex-shrink-0">
                    {done ? (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
                        <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
                      </motion.div>
                    ) : active ? (
                      <Loader2 className="w-4 h-4 text-[#2563EB] animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-[#E2E8F0]" />
                    )}
                  </div>
                  <span className={`text-xs transition-colors ${done ? 'text-[#22C55E] font-medium' : active ? 'text-[#0F172A] font-semibold' : 'text-[#CBD5E1]'}`}>
                    {stage.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
          <div className="flex justify-between text-xs text-[#94A3B8] mb-2">
            <span>Evidence-backed analysis in progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#2563EB] to-[#7C3AED] rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <p className="text-center text-xs text-[#94A3B8] mt-3">
            Please wait 30–90 seconds · Do not close this page
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ValidateLoadingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#2563EB] animate-spin" />
      </div>
    }>
      <LoadingContent />
    </Suspense>
  );
}
