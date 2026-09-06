'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Sparkles, ChevronRight, FlaskConical } from 'lucide-react';

const ideaSchema = z.object({
  idea: z.string().min(5, { message: 'Project idea must be at least 5 characters long.' }),
});

const EXAMPLE_IDEAS = [
  'Smart Traffic Management System using AI',
  'AI-powered Healthcare Diagnostic Assistant',
  'Drone Delivery Platform for Urban Areas',
  'Food Waste Optimization Network',
  'Personalized EdTech Learning Platform',
  'Carbon Footprint Tracker with Gamification',
];

const FEATURES = [
  { icon: '📊', label: 'Innovation Score' },
  { icon: '🔬', label: 'Deep Research' },
  { icon: '🏗️', label: 'Architecture Diagram' },
  { icon: '⚡', label: 'Sprint Roadmap' },
  { icon: '📚', label: 'Documentation' },
  { icon: '🔗', label: 'GitHub Repos' },
];

export default function HeroPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ideaSchema),
    defaultValues: { idea: '' },
  });

  const onSubmit = (data) => {
    setLoading(true);
    router.push(`/generate?idea=${encodeURIComponent(data.idea.trim())}`);
  };

  const handleSelectExample = (exampleText) => {
    setValue('idea', exampleText, { shouldValidate: true });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Top Nav */}
      <nav className="border-b border-[#E2E8F0] bg-white">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#0F172A] rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[#0F172A] tracking-tight">IntelliGrade AI</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/projects" className="text-sm text-[#475569] hover:text-[#0F172A] transition-colors font-medium">
              History
            </a>
            <a href="/settings" className="text-sm text-[#475569] hover:text-[#0F172A] transition-colors font-medium">
              Settings
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-white bg-[#0F172A] px-4 py-1.5 rounded-lg hover:bg-[#1E293B] transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-3xl w-full mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] text-xs font-semibold mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Powered by Gemini AI
          </motion.div>

          {/* Evidence Validator CTA */}
          <motion.a
            href="/validate"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.03 }}
            className="flex items-center justify-center gap-3 mx-auto mb-8 px-5 py-3 bg-gradient-to-r from-[#7C3AED] to-[#2563EB] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all shadow-md max-w-md"
          >
            <FlaskConical className="w-4 h-4" />
            🔬 New: Evidence-Backed Idea Validator
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">5 AI Agents + Real Research</span>
          </motion.a>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-5xl sm:text-6xl font-extrabold text-[#0F172A] leading-tight tracking-tight mb-4"
          >
            IntelliGrade AI
            <br />
            <span className="text-[#2563EB]">Think Bigger. Research Faster. Innovate Smarter.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-[#475569] leading-relaxed mb-10 max-w-xl mx-auto"
          >
            An AI platform that accelerates research, project planning, technical documentation, pitch creation,
            and innovation.
          </motion.p>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit(onSubmit)}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-col gap-2 mb-3"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                {...register('idea')}
                placeholder="Describe your project idea..."
                className="flex-1 px-5 py-3.5 text-sm bg-white border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent shadow-sm transition-all"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0F172A] text-white text-sm font-semibold rounded-xl hover:bg-[#1E293B] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] whitespace-nowrap shadow-sm"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    Generate Project
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
            {errors.idea && (
              <p className="text-left text-xs text-[#EF4444] px-1 font-medium">{errors.idea.message}</p>
            )}
          </motion.form>

          {/* Example ideas */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap gap-2 justify-center mt-4"
          >
            <span className="text-xs text-[#94A3B8] self-center">Try:</span>
            {EXAMPLE_IDEAS.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => handleSelectExample(ex)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border border-[#E2E8F0] text-[#475569] bg-white hover:border-[#BFDBFE] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-all"
              >
                {ex}
                <ChevronRight className="w-3 h-3" />
              </button>
            ))}
          </motion.div>
        </div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-20 flex flex-wrap gap-3 justify-center max-w-2xl"
        >
          {FEATURES.map(({ icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-[#E2E8F0] shadow-sm text-sm text-[#475569] font-medium"
            >
              <span>{icon}</span>
              {label}
            </div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] py-6 text-center">
        <p className="text-xs text-[#94A3B8]">
          © 2025 IntelliGrade AI · Built for hackathons ·{' '}
          <a href="/projects" className="hover:text-[#475569] transition-colors underline-offset-2 hover:underline">
            View History
          </a>
        </p>
      </footer>
    </div>
  );
}
