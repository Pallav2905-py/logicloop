'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Presentation,
  Download,
  Eye,
  EyeOff,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Clock,
  Lightbulb,
  Mic,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, FadeIn, Badge } from '@/components/ui';

// ─── Slide type config (icons + labels) ───────────────────────────────────────
const SLIDE_META = {
  cover:              { label: 'Cover',                color: '#2563EB', bg: '#EFF6FF' },
  problem:            { label: 'Problem Statement',    color: '#DC2626', bg: '#FEF2F2' },
  currentSolutions:   { label: 'Current Solutions',   color: '#D97706', bg: '#FFFBEB' },
  solution:           { label: 'Our Solution',         color: '#16A34A', bg: '#F0FDF4' },
  innovationAnalysis: { label: 'Innovation Analysis',  color: '#7C3AED', bg: '#F5F3FF' },
  marketOpportunity:  { label: 'Market Opportunity',  color: '#0891B2', bg: '#ECFEFF' },
  architecture:       { label: 'Architecture',         color: '#0F172A', bg: '#F1F5F9' },
  techStack:          { label: 'Tech Stack',           color: '#475569', bg: '#F8FAFC' },
  researchHighlights: { label: 'Research Highlights',  color: '#7C3AED', bg: '#F5F3FF' },
  roadmap:            { label: 'Roadmap',              color: '#16A34A', bg: '#F0FDF4' },
  costFeasibility:    { label: 'Cost & Feasibility',  color: '#D97706', bg: '#FFFBEB' },
  futureScope:        { label: 'Future Scope',         color: '#0891B2', bg: '#ECFEFF' },
  closing:            { label: 'Closing',              color: '#2563EB', bg: '#EFF6FF' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SlideIcon({ type }) {
  const slideData = { cover: '🚀', problem: '⚠️', currentSolutions: '🔍', solution: '💡',
    innovationAnalysis: '📊', marketOpportunity: '🌍', architecture: '🏗️', techStack: '⚙️',
    researchHighlights: '🔬', roadmap: '🗓️', costFeasibility: '💰', futureScope: '🔭', closing: '🎯' };
  return <span className="text-xl">{slideData[type] || '📄'}</span>;
}

function ScorePill({ label, value, color }) {
  return (
    <div className="flex items-center gap-2 py-1.5 px-3 rounded-lg"
      style={{ background: color ? `${color}15` : '#EFF6FF' }}>
      <div className="text-xs font-medium" style={{ color: color || '#2563EB' }}>{label}</div>
      <div className="text-sm font-bold" style={{ color: color || '#2563EB' }}>{value}/100</div>
    </div>
  );
}

function SlidePreviewCard({ slide, index, total }) {
  const [notesOpen, setNotesOpen] = useState(false);
  const meta = SLIDE_META[slide.type] || { label: 'Slide', color: '#475569', bg: '#F8FAFC' };

  const renderContent = () => {
    switch (slide.type) {
      case 'cover':
        return (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-[#2563EB] italic">{slide.subtitle}</p>
            {slide.tagline && <p className="text-xs text-[#94A3B8]">{slide.tagline}</p>}
          </div>
        );
      case 'innovationAnalysis':
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {slide.scores && Object.entries(slide.scores).slice(0, 4).map(([key, val]) => (
                <ScorePill key={key}
                  label={key.replace(/([A-Z])/g, ' $1').trim()}
                  value={val} />
              ))}
            </div>
          </div>
        );
      case 'roadmap':
        return (
          <div className="space-y-1.5">
            {(slide.phases || []).slice(0, 4).map((p, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-0.5 w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                  style={{ background: meta.color }}>{i + 1}</span>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-[#0F172A]">{p.phase}: </span>
                  <span className="text-xs text-[#475569]">{p.label}</span>
                </div>
              </div>
            ))}
          </div>
        );
      case 'techStack':
        return (
          <div className="flex flex-wrap gap-1.5">
            {slide.categories && Object.entries(slide.categories).map(([cat, items]) =>
              (items || []).slice(0, 2).map((item, i) => (
                <span key={`${cat}-${i}`}
                  className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F1F5F9] text-[#475569]">
                  {item}
                </span>
              ))
            )}
          </div>
        );
      case 'costFeasibility':
        return (
          <div className="flex flex-wrap gap-2">
            {slide.feasibilityScore && (
              <ScorePill label="Feasibility" value={slide.feasibilityScore} color="#16A34A" />
            )}
            {slide.estimatedTeamSize && (
              <div className="text-xs text-[#475569] py-1.5 px-3 rounded-lg bg-[#F1F5F9]">
                👥 {slide.estimatedTeamSize}
              </div>
            )}
            {slide.estimatedTimeToMVP && (
              <div className="text-xs text-[#475569] py-1.5 px-3 rounded-lg bg-[#F1F5F9]">
                ⏱ {slide.estimatedTimeToMVP}
              </div>
            )}
          </div>
        );
      default:
        return (
          <ul className="space-y-1">
            {(slide.bullets || slide.phase2Features || []).slice(0, 3).map((b, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#2563EB] flex-shrink-0" />
                <span className="text-xs text-[#475569] leading-relaxed">{b}</span>
              </li>
            ))}
            {slide.headline && (
              <li className="text-xs font-semibold text-[#2563EB] italic pt-1">{slide.headline}</li>
            )}
            {slide.marketGap && (
              <li className="text-xs text-[#D97706] pt-1">🎯 {slide.marketGap}</li>
            )}
          </ul>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden"
    >
      {/* Card header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E2E8F0]"
        style={{ background: meta.bg }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: meta.color + '22' }}>
          <SlideIcon type={slide.type} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider truncate"
            style={{ color: meta.color }}>{meta.label}</p>
          <p className="text-sm font-semibold text-[#0F172A] truncate mt-0.5">{slide.title}</p>
        </div>
        <span className="text-xs text-[#94A3B8] flex-shrink-0">{index + 1}/{total}</span>
      </div>

      {/* Card body */}
      <div className="px-4 py-3">
        {renderContent()}
      </div>

      {/* Speaker notes toggle */}
      {slide.speakerNotes && (
        <div className="border-t border-[#F1F5F9]">
          <button
            onClick={() => setNotesOpen((v) => !v)}
            className="w-full flex items-center gap-2 px-4 py-2 text-xs text-[#94A3B8] hover:text-[#475569] hover:bg-[#F8FAFC] transition-colors"
          >
            <Mic className="w-3 h-3" />
            Speaker Notes
            {notesOpen ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
          </button>
          <AnimatePresence>
            {notesOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-3">
                  <p className="text-xs text-[#475569] leading-relaxed italic bg-[#F8FAFC] rounded-lg p-3 border border-[#E2E8F0]">
                    {slide.speakerNotes}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

function VersionCard({ label, script, duration, icon }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F8FAFC] transition-colors text-left"
      >
        <span className="text-xl">{icon}</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-[#0F172A]">{label}</p>
          <p className="text-xs text-[#94A3B8]">{duration}</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-[#94A3B8]" /> : <ChevronDown className="w-4 h-4 text-[#94A3B8]" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <p className="text-sm text-[#475569] leading-relaxed bg-[#F8FAFC] rounded-lg p-3 border border-[#E2E8F0] italic">
                "{script}"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PitchDeckGenerator({ project }) {
  const [status, setStatus] = useState('idle');       // idle | loading | preview | downloaded | error
  const [deckJson, setDeckJson] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('slides'); // slides | tips | scripts
  const [currentSlide, setCurrentSlide] = useState(0);

  const projectId = project?._id;

  // ── Generate preview (GET) + show in UI ──
  const handleGenerate = useCallback(async () => {
    if (!projectId) return;
    setStatus('loading');
    setDeckJson(null);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/projects/${projectId}/pitch-deck`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setDeckJson(data.deckJson);
      setStatus('preview');
      setIsPreviewOpen(true);
      setCurrentSlide(0);
    } catch (err) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  }, [projectId]);

  // ── Download PPTX (POST) ──
  const handleDownload = useCallback(async () => {
    if (!projectId) return;
    setStatus('loading');

    try {
      const res = await fetch(`/api/projects/${projectId}/pitch-deck`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deckJson }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Download failed');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(project?.title || 'pitch-deck').replace(/[^a-z0-9]/gi, '-').toLowerCase()}-pitch-deck.pptx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatus(deckJson ? 'preview' : 'downloaded');
    } catch (err) {
      setErrorMsg(err.message);
      setStatus(deckJson ? 'preview' : 'error');
    }
  }, [projectId, project?.title, deckJson]);

  // ── Regenerate ──
  const handleRegenerate = useCallback(() => {
    setDeckJson(null);
    setStatus('idle');
    setIsPreviewOpen(false);
    setCurrentSlide(0);
  }, []);

  const slides = deckJson?.slides || [];
  const totalSlides = slides.length;
  const isLoading = status === 'loading';

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <Card className="overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] flex items-center justify-center">
            <Presentation className="w-5 h-5 text-[#2563EB]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#0F172A]">AI Pitch Deck Generator</h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Investor-grade PowerPoint — generated from your project data
            </p>
          </div>
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-3">
          {status === 'idle' && (
            <Badge variant="default">Ready</Badge>
          )}
          {status === 'loading' && (
            <Badge variant="accent">
              <Loader2 className="w-3 h-3 animate-spin" /> Generating…
            </Badge>
          )}
          {status === 'preview' && (
            <Badge variant="success">
              <CheckCircle2 className="w-3 h-3" /> {totalSlides} Slides Ready
            </Badge>
          )}
          {status === 'error' && (
            <Badge variant="danger">
              <AlertCircle className="w-3 h-3" /> Error
            </Badge>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-6 space-y-5">

        {/* What you'll get — visible only in idle state */}
        {status === 'idle' && (
          <FadeIn>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: '📊', label: '13 Slides', desc: 'Full investor deck' },
                { icon: '🎙️', label: 'Speaker Notes', desc: 'Every slide scripted' },
                { icon: '⏱️', label: '3 Versions', desc: '30s · 2min · 5min' },
                { icon: '💼', label: 'McKinsey Style', desc: 'Enterprise design' },
              ].map((item) => (
                <div key={item.label}
                  className="flex flex-col items-center text-center p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-2xl mb-1.5">{item.icon}</span>
                  <p className="text-xs font-semibold text-[#0F172A]">{item.label}</p>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        )}

        {/* Error state */}
        {status === 'error' && (
          <div className="flex items-start gap-3 p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl">
            <AlertCircle className="w-5 h-5 text-[#DC2626] flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#DC2626]">Generation Failed</p>
              <p className="text-xs text-[#EF4444] mt-0.5">{errorMsg}</p>
            </div>
            <button onClick={handleRegenerate} className="text-xs text-[#DC2626] hover:underline flex-shrink-0">
              Try again
            </button>
          </div>
        )}

        {/* Loading state */}
        {status === 'loading' && (
          <FadeIn>
            <div className="flex flex-col items-center py-8 gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-[#EFF6FF] flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-[#2563EB]" />
                </div>
                <div className="absolute -inset-1 rounded-2xl border-2 border-[#2563EB] opacity-30 animate-ping" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-[#0F172A]">
                  Generating your pitch deck…
                </p>
                <p className="text-xs text-[#94A3B8] mt-1">
                  Gemini is crafting 13 investor-grade slides from your project data
                </p>
              </div>
              <div className="w-48 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#2563EB] rounded-full"
                  initial={{ width: '5%' }}
                  animate={{ width: '90%' }}
                  transition={{ duration: 12, ease: 'easeInOut' }}
                />
              </div>
            </div>
          </FadeIn>
        )}

        {/* Preview panel */}
        {(status === 'preview' || status === 'downloaded') && deckJson && (
          <FadeIn>
            {/* Toggle preview open/close */}
            <button
              onClick={() => setIsPreviewOpen((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 bg-[#F8FAFC] hover:bg-[#EFF6FF] border border-[#E2E8F0] hover:border-[#BFDBFE] rounded-xl transition-all group"
            >
              <div className="flex items-center gap-2.5">
                {isPreviewOpen
                  ? <EyeOff className="w-4 h-4 text-[#2563EB]" />
                  : <Eye className="w-4 h-4 text-[#2563EB]" />}
                <span className="text-sm font-medium text-[#0F172A]">
                  {isPreviewOpen ? 'Hide Preview' : 'Show Preview'} — {totalSlides} slides
                </span>
              </div>
              <div className="flex items-center gap-2">
                {deckJson.estimatedDurationMinutes && (
                  <span className="text-xs text-[#94A3B8] flex items-center gap-1">
                    <Clock className="w-3 h-3" /> ~{deckJson.estimatedDurationMinutes} min
                  </span>
                )}
                {isPreviewOpen
                  ? <ChevronUp className="w-4 h-4 text-[#94A3B8]" />
                  : <ChevronDown className="w-4 h-4 text-[#94A3B8]" />}
              </div>
            </button>

            <AnimatePresence>
              {isPreviewOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  {/* Tabs */}
                  <div className="flex items-center gap-1 mt-4 mb-4 border-b border-[#E2E8F0]">
                    {[
                      { id: 'slides',  label: 'Slides',             icon: <Presentation className="w-3.5 h-3.5" /> },
                      { id: 'scripts', label: 'Pitch Scripts',       icon: <Mic className="w-3.5 h-3.5" /> },
                      { id: 'tips',    label: 'Presentation Tips',   icon: <Lightbulb className="w-3.5 h-3.5" /> },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 -mb-px ${
                          activeTab === tab.id
                            ? 'text-[#2563EB] border-[#2563EB] bg-[#EFF6FF]'
                            : 'text-[#94A3B8] border-transparent hover:text-[#475569]'
                        }`}
                      >
                        {tab.icon}
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Slides tab */}
                  {activeTab === 'slides' && (
                    <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                      {slides.map((slide, i) => (
                        <SlidePreviewCard
                          key={slide.type + i}
                          slide={slide}
                          index={i}
                          total={totalSlides}
                        />
                      ))}
                    </div>
                  )}

                  {/* Scripts tab */}
                  {activeTab === 'scripts' && deckJson.versions && (
                    <div className="space-y-3">
                      <VersionCard
                        icon="⚡"
                        label="30-Second Elevator Pitch"
                        duration="Perfect for networking events"
                        script={deckJson.versions.thirtySeconds}
                      />
                      <VersionCard
                        icon="🎯"
                        label="2-Minute Pitch"
                        duration="Ideal for demo days and investor meetings"
                        script={deckJson.versions.twoMinutes}
                      />
                      <VersionCard
                        icon="📋"
                        label="5-Minute Full Presentation"
                        duration="Complete pitch with Q&A time"
                        script={deckJson.versions.fiveMinutes}
                      />
                    </div>
                  )}

                  {/* Tips tab */}
                  {activeTab === 'tips' && (
                    <div className="space-y-2">
                      {(deckJson.presentationTips || []).map((tip, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="flex items-start gap-3 p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl"
                        >
                          <div className="w-6 h-6 rounded-lg bg-[#EFF6FF] flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-[11px] font-bold text-[#2563EB]">{i + 1}</span>
                          </div>
                          <p className="text-sm text-[#475569] leading-relaxed">{tip}</p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </FadeIn>
        )}

        {/* ── Action buttons ── */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {status === 'idle' || status === 'error' ? (
            <button
              id="generate-pitch-deck-btn"
              onClick={handleGenerate}
              disabled={isLoading}
              className="flex items-center gap-2.5 px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-xl transition-all active:scale-95 shadow-sm shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Presentation className="w-4 h-4" />
              Generate Pitch Deck
            </button>
          ) : (
            <>
              {/* Download PPT */}
              <button
                id="download-pptx-btn"
                onClick={handleDownload}
                disabled={isLoading}
                className="flex items-center gap-2.5 px-5 py-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white text-sm font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Download className="w-4 h-4" />}
                {isLoading ? 'Generating…' : 'Download .pptx'}
              </button>

              {/* Regenerate */}
              <button
                id="regenerate-pitch-deck-btn"
                onClick={handleRegenerate}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#475569] hover:text-[#0F172A] bg-[#F1F5F9] hover:bg-[#E2E8F0] rounded-xl transition-all disabled:opacity-60"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </button>
            </>
          )}

          {/* Slide count indicator */}
          {status === 'preview' && (
            <span className="text-xs text-[#94A3B8] ml-auto flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              {totalSlides} slides · {deckJson?.estimatedDurationMinutes || 8} min estimated
            </span>
          )}
        </div>

        {/* Disclaimer */}
        <p className="text-[11px] text-[#CBD5E1] border-t border-[#F1F5F9] pt-3">
          Pitch deck is generated using Gemini AI for content and pptxgenjs for layout. 
          All design, fonts, colors, and spacing are controlled by IntelliGrade AI — not the AI model.
        </p>
      </div>
    </Card>
  );
}
