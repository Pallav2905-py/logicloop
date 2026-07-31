'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, CheckCircle2, Loader2 } from 'lucide-react';
import { Suspense } from 'react';

const STEPS = [
  { id: 'validate', label: 'Validating Idea', duration: 1200 },
  { id: 'market', label: 'Researching Market', duration: 2000 },
  { id: 'papers', label: 'Finding Related Research', duration: 2000 },
  { id: 'arch', label: 'Generating Architecture', duration: 1500 },
  { id: 'roadmap', label: 'Planning Roadmap', duration: 1500 },
  { id: 'docs', label: 'Preparing Documentation', duration: 1000 },
];

function GenerateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idea = searchParams.get('idea') || '';

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [error, setError] = useState('');
  const calledRef = useRef(false);

  useEffect(() => {
    if (!idea) {
      router.replace('/');
      return;
    }

    if (calledRef.current) return;
    calledRef.current = true;

    // Animate steps while API call runs
    let stepIndex = 0;
    let elapsed = 0;

    const animateSteps = () => {
      if (stepIndex >= STEPS.length) return;
      setCurrentStep(stepIndex);
      const dur = STEPS[stepIndex].duration;
      elapsed += dur;
      setTimeout(() => {
        setCompletedSteps((prev) => [...prev, stepIndex]);
        stepIndex += 1;
        if (stepIndex < STEPS.length) {
          animateSteps();
        }
      }, dur);
    };

    animateSteps();

    // Actual API call
    const generate = async () => {
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idea }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Generation failed');

        // Wait until at least the animation is far enough
        const minWait = 3000;
        await new Promise((resolve) => setTimeout(resolve, minWait));

        router.push(`/dashboard/${data.project._id}`);
      } catch (err) {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    };

    generate();
  }, [idea, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-full bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-[#0F172A] mb-2">Generation Failed</h2>
          <p className="text-sm text-[#475569] mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2.5 bg-[#0F172A] text-white text-sm font-semibold rounded-xl hover:bg-[#1E293B] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-12">
          <div className="w-8 h-8 bg-[#0F172A] rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-[#0F172A] text-lg tracking-tight">MaestroMeets</span>
        </div>

        {/* Idea preview */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 mb-8 shadow-sm">
          <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Generating for</p>
          <p className="text-sm text-[#0F172A] font-medium leading-relaxed line-clamp-2">{idea}</p>
        </div>

        {/* Steps */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-4">
          <p className="text-sm font-semibold text-[#0F172A] mb-2">Processing your idea...</p>

          {STEPS.map((step, i) => {
            const isCompleted = completedSteps.includes(i);
            const isCurrent = currentStep === i && !isCompleted;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex items-center gap-3"
              >
                {/* Icon */}
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    >
                      <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
                    </motion.div>
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-[#2563EB] animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-[#E2E8F0]" />
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-sm transition-colors duration-200 ${
                    isCompleted
                      ? 'text-[#22C55E] font-medium line-through decoration-[#86EFAC]'
                      : isCurrent
                      ? 'text-[#0F172A] font-semibold'
                      : 'text-[#CBD5E1]'
                  }`}
                >
                  {step.label}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="flex justify-between text-xs text-[#94A3B8] mb-1.5">
            <span>Analyzing & generating</span>
            <span>{Math.round((completedSteps.length / STEPS.length) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#2563EB] rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${(completedSteps.length / STEPS.length) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        <p className="text-center text-xs text-[#94A3B8] mt-6">
          This may take 10–20 seconds. Please don&apos;t close this page.
        </p>
      </div>
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#2563EB] animate-spin" />
      </div>
    }>
      <GenerateContent />
    </Suspense>
  );
}
