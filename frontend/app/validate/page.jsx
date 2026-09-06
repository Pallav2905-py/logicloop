'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ArrowRight, Plus, X, Sparkles, ChevronRight, Target, Globe, Lock } from 'lucide-react';

const EXAMPLE_IDEAS = [
  { title: 'AI Food Waste Manager', description: 'Predict and reduce restaurant food waste using ML-based demand forecasting and inventory optimization, targeting small restaurants in India with minimal hardware.', market: 'India', users: ['Restaurant owners', 'Food managers'], constraints: ['Low cost', 'Minimal hardware'] },
  { title: 'Smart Urban Mobility', description: 'AI-powered traffic management and public transit optimization for mid-size cities using computer vision and real-time data.', market: 'Southeast Asia', users: ['City planners', 'Commuters'], constraints: ['Real-time processing', 'Privacy-preserving'] },
  { title: 'Personalized EdTech Tutor', description: 'Adaptive AI learning platform that personalizes curriculum and pacing for K-12 students based on learning patterns and knowledge gaps.', market: 'Global', users: ['Students', 'Teachers', 'Parents'], constraints: ['Affordable', 'Offline-capable'] },
];

export default function ValidatePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [market, setMarket] = useState('');
  const [targetUsers, setTargetUsers] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [constraints, setConstraints] = useState([]);
  const [constraintInput, setConstraintInput] = useState('');
  const [errors, setErrors] = useState({});

  const addTag = (value, setter, list) => {
    const v = value.trim();
    if (v && !list.includes(v)) setter(prev => [...prev, v]);
  };

  const removeTag = (index, setter) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const applyExample = (ex) => {
    setTitle(ex.title);
    setDescription(ex.description);
    setMarket(ex.market);
    setTargetUsers(ex.users);
    setConstraints(ex.constraints);
    setErrors({});
  };

  const validate = () => {
    const e = {};
    if (!title.trim() || title.trim().length < 3) e.title = 'Title must be at least 3 characters';
    if (!description.trim() || description.trim().length < 30) e.description = 'Description must be at least 30 characters';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const params = new URLSearchParams({
      title: title.trim(),
      description: description.trim(),
      market: market.trim(),
      users: JSON.stringify(targetUsers),
      constraints: JSON.stringify(constraints),
    });
    router.push(`/validate/loading?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Nav */}
      <nav className="border-b border-[#E2E8F0] bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <a href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#0F172A] rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-[#0F172A] tracking-tight">IntelliGrade AI</span>
            </a>
            <span className="text-[#CBD5E1] mx-2">|</span>
            <span className="text-sm font-semibold text-[#2563EB]">Evidence Validator</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/projects" className="text-sm text-[#475569] hover:text-[#0F172A] transition-colors font-medium">History</a>
            <a href="/" className="text-sm font-medium text-white bg-[#0F172A] px-4 py-1.5 rounded-lg hover:bg-[#1E293B] transition-colors">Classic Mode</a>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            AI Research · Prior Art · Competition · Evidence-Backed
          </div>
          <h1 className="text-4xl font-extrabold text-[#0F172A] tracking-tight mb-3">
            Validate Your Project Idea
          </h1>
          <p className="text-lg text-[#475569] max-w-2xl mx-auto">
            Get a comprehensive evidence-backed analysis powered by 5 AI agents researching GitHub, academic papers, patents, competitors, and market data.
          </p>
        </motion.div>

        {/* Example ideas */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8"
        >
          <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">Quick start with an example</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_IDEAS.map((ex) => (
              <button
                key={ex.title}
                type="button"
                onClick={() => applyExample(ex)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-[#E2E8F0] text-[#475569] bg-white hover:border-[#BFDBFE] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-all"
              >
                {ex.title}
                <ChevronRight className="w-3 h-3" />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-8 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                Project Title <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. AI-Powered Food Waste Management System"
                className={`w-full px-4 py-3 text-sm bg-[#F8FAFC] border rounded-xl text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all ${errors.title ? 'border-[#EF4444]' : 'border-[#E2E8F0]'}`}
              />
              {errors.title && <p className="text-xs text-[#EF4444] mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                Project Description <span className="text-[#EF4444]">*</span>
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe the problem you're solving, your proposed approach, and why it matters. The more detail you provide, the better the evidence-backed analysis."
                rows={5}
                className={`w-full px-4 py-3 text-sm bg-[#F8FAFC] border rounded-xl text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all resize-none ${errors.description ? 'border-[#EF4444]' : 'border-[#E2E8F0]'}`}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.description ? <p className="text-xs text-[#EF4444]">{errors.description}</p> : <span />}
                <span className={`text-xs ${description.length < 30 ? 'text-[#EF4444]' : 'text-[#94A3B8]'}`}>{description.length} chars</span>
              </div>
            </div>

            {/* Market + Target Users row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Market */}
              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-2 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#2563EB]" /> Target Market / Geography
                </label>
                <input
                  type="text"
                  value={market}
                  onChange={e => setMarket(e.target.value)}
                  placeholder="e.g. India, Southeast Asia, Global, US"
                  className="w-full px-4 py-3 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                />
              </div>

              {/* Target Users */}
              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-2 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-[#2563EB]" /> Target Users
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(userInput, setTargetUsers, targetUsers); setUserInput(''); } }}
                    placeholder="Type and press Enter"
                    className="flex-1 px-4 py-3 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                  />
                  <button type="button" onClick={() => { addTag(userInput, setTargetUsers, targetUsers); setUserInput(''); }}
                    className="px-3 py-3 bg-[#0F172A] text-white rounded-xl hover:bg-[#1E293B] transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {targetUsers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {targetUsers.map((u, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#EFF6FF] text-[#2563EB] text-xs font-medium rounded-full">
                        {u}
                        <button type="button" onClick={() => removeTag(i, setTargetUsers)}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Constraints */}
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-2 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#2563EB]" /> Constraints / Requirements
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={constraintInput}
                  onChange={e => setConstraintInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(constraintInput, setConstraints, constraints); setConstraintInput(''); } }}
                  placeholder="e.g. Low cost, Offline-capable, Privacy-preserving"
                  className="flex-1 px-4 py-3 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                />
                <button type="button" onClick={() => { addTag(constraintInput, setConstraints, constraints); setConstraintInput(''); }}
                  className="px-3 py-3 bg-[#0F172A] text-white rounded-xl hover:bg-[#1E293B] transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {constraints.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {constraints.map((c, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#F5F3FF] text-[#7C3AED] text-xs font-medium rounded-full">
                      {c}
                      <button type="button" onClick={() => removeTag(i, setConstraints)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* What happens section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: '🔬', label: 'GitHub Research', desc: '2-4 focused queries' },
              { icon: '📚', label: 'Academic Papers', desc: 'OpenAlex database' },
              { icon: '⚖️', label: 'Prior Art', desc: 'Patent signals' },
              { icon: '🏆', label: 'Competition', desc: 'Market saturation' },
            ].map(({ icon, label, desc }) => (
              <div key={label} className="bg-white rounded-xl border border-[#E2E8F0] p-4 text-center">
                <div className="text-xl mb-1">{icon}</div>
                <p className="text-xs font-semibold text-[#0F172A]">{label}</p>
                <p className="text-[10px] text-[#94A3B8] mt-0.5">{desc}</p>
              </div>
            ))}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-[#0F172A] text-white text-base font-bold rounded-xl hover:bg-[#1E293B] transition-all active:scale-[0.99] shadow-lg"
          >
            <Sparkles className="w-5 h-5" />
            Run Evidence-Backed Validation
            <ArrowRight className="w-5 h-5" />
          </button>

          <p className="text-center text-xs text-[#94A3B8]">
            Analysis takes 30–90 seconds · Uses real GitHub, academic papers, and market data
          </p>
        </motion.form>
      </main>
    </div>
  );
}
