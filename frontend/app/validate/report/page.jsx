'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, BarChart2, Microscope, FileText, ChevronDown, ChevronUp,
  ExternalLink, GitBranch, BookOpen, Shield, TrendingUp, AlertTriangle,
  CheckCircle, XCircle, Cpu, Star, Globe, ArrowLeft
} from 'lucide-react';
import MermaidDiagram from '@/components/validate/MermaidDiagram';

// ── Helpers ────────────────────────────────────────────────────────────────────

const RECOMMENDATION_CONFIG = {
  BUILD:  { color: '#22C55E', bg: '#F0FDF4', border: '#BBF7D0', emoji: '🚀' },
  PIVOT:  { color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', emoji: '🔄' },
  REWORK: { color: '#EF4444', bg: '#FEF2F2', border: '#FECACA', emoji: '🔧' },
  FLAG:   { color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', emoji: '🚩' },
};

const SATURATION_COLOR = { LOW: '#22C55E', MEDIUM: '#F59E0B', HIGH: '#EF4444', VERY_HIGH: '#7C3AED' };
const SEVERITY_COLOR = { LOW: '#22C55E', MEDIUM: '#F59E0B', HIGH: '#EF4444', CRITICAL: '#7C3AED' };
const EVIDENCE_COLOR = { HIGH: '#22C55E', MEDIUM: '#2563EB', LOW: '#F59E0B', INSUFFICIENT: '#94A3B8' };

function scoreColor(s) {
  if (s >= 70) return '#22C55E';
  if (s >= 50) return '#F59E0B';
  return '#EF4444';
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function ScoreRing({ score, size = 120 }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const col = scoreColor(score);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#E2E8F0" strokeWidth="8" />
      <motion.circle
        cx="50" cy="50" r={r} fill="none" stroke={col} strokeWidth="8"
        strokeLinecap="round" strokeDasharray={`${circ}`}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        style={{ transformOrigin: '50% 50%', transform: 'rotate(-90deg)' }}
      />
      <text x="50" y="46" textAnchor="middle" fill={col} fontSize="18" fontWeight="800">{score}</text>
      <text x="50" y="60" textAnchor="middle" fill="#94A3B8" fontSize="8">/100</text>
    </svg>
  );
}

function ScoreBar({ label, value, max = 100 }) {
  const col = scoreColor(value);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium text-[#475569]">{label}</span>
        <span className="font-bold" style={{ color: col }}>{value}</span>
      </div>
      <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: col }}
          initial={{ width: 0 }}
          animate={{ width: `${(value / max) * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function Collapsible({ title, icon: Icon, defaultOpen = false, children, badge }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-5 hover:bg-[#F8FAFC] transition-colors"
      >
        <div className="flex items-center gap-3">
          {Icon && <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center"><Icon className="w-4 h-4 text-[#2563EB]" /></div>}
          <span className="font-semibold text-[#0F172A]">{title}</span>
          {badge && <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#F1F5F9] text-[#475569]">{badge}</span>}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-[#94A3B8]" /> : <ChevronDown className="w-4 h-4 text-[#94A3B8]" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-5 pb-5 border-t border-[#E2E8F0]">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AgentCard({ name, emoji, score, confidence, summary, reasoning, recommendation }) {
  const [showReasoning, setShowReasoning] = useState(false);
  const col = scoreColor(score);
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{emoji}</span>
          <div>
            <p className="text-sm font-bold text-[#0F172A]">{name}</p>
            {recommendation && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: RECOMMENDATION_CONFIG[recommendation]?.bg, color: RECOMMENDATION_CONFIG[recommendation]?.color }}>
                {recommendation}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black" style={{ color: col }}>{score}</div>
          <div className="text-xs text-[#94A3B8]">{confidence}% conf.</div>
        </div>
      </div>
      <p className="text-xs text-[#475569] leading-relaxed mb-3">{summary}</p>
      {reasoning && (
        <button type="button" onClick={() => setShowReasoning(o => !o)} className="text-xs text-[#2563EB] font-medium hover:underline flex items-center gap-1">
          {showReasoning ? 'Hide' : 'Show'} reasoning {showReasoning ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      )}
      <AnimatePresence>
        {showReasoning && reasoning && (
          <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="text-xs text-[#94A3B8] mt-2 leading-relaxed overflow-hidden">
            {reasoning}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── View: BASIC ────────────────────────────────────────────────────────────────

function BasicView({ report }) {
  const { decision, scorecard } = report;
  const cfg = RECOMMENDATION_CONFIG[decision.recommendation] || RECOMMENDATION_CONFIG.REWORK;

  return (
    <div className="space-y-6">
      {/* Hero decision */}
      <div className="bg-white rounded-2xl border shadow-sm p-8" style={{ borderColor: cfg.border }}>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <ScoreRing score={decision.overall_score} size={140} />
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-black mb-3" style={{ background: cfg.bg, color: cfg.color }}>
              {cfg.emoji} {decision.recommendation}
            </div>
            <p className="text-2xl font-bold text-[#0F172A] mb-2">{decision.short_verdict}</p>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span className="text-sm text-[#94A3B8]">Confidence:</span>
              <span className="text-sm font-bold text-[#0F172A]">{decision.confidence}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scorecard */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
        <h2 className="text-base font-bold text-[#0F172A] mb-5">Scorecard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ScoreBar label="Opportunity" value={scorecard.opportunity} />
          <ScoreBar label="Technical Feasibility" value={scorecard.technical_feasibility} />
          <ScoreBar label="Competition (Differentiation)" value={scorecard.competition} />
          <ScoreBar label="Prior Art Clarity" value={scorecard.prior_art} />
          <ScoreBar label="Differentiation" value={scorecard.differentiation} />
          <ScoreBar label="Evidence Confidence" value={scorecard.evidence_confidence} />
        </div>
      </div>

      {/* Key findings */}
      {decision.key_findings?.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
          <h2 className="text-base font-bold text-[#0F172A] mb-4">Key Findings</h2>
          <ul className="space-y-2">
            {decision.key_findings.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#475569]">
                <CheckCircle className="w-4 h-4 text-[#2563EB] mt-0.5 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Opportunity + Risk */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-5">
          <p className="text-xs font-bold text-[#16A34A] uppercase mb-2">💡 Biggest Opportunity</p>
          <p className="text-sm text-[#0F172A] font-medium">{decision.biggest_opportunity || '—'}</p>
        </div>
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-5">
          <p className="text-xs font-bold text-[#DC2626] uppercase mb-2">⚠️ Biggest Risk</p>
          <p className="text-sm text-[#0F172A] font-medium">{decision.biggest_risk || '—'}</p>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
        <h2 className="text-base font-bold text-[#0F172A] mb-3">Executive Summary</h2>
        <p className="text-sm text-[#475569] leading-relaxed">{decision.executive_summary}</p>
      </div>
    </div>
  );
}

// ── View: ANALYSIS ─────────────────────────────────────────────────────────────

function AnalysisView({ report }) {
  const { agent_scores } = report;

  const agents = [
    { name: 'Research Agent', emoji: '🔬', score: agent_scores.research, confidence: report.research_analysis?.confidence ?? 70, summary: report.research_summary, reasoning: report.research_reasoning },
    { name: 'Prior-Art Agent', emoji: '📚', score: agent_scores.prior_art, confidence: 70, summary: report.prior_art_summary, reasoning: report.prior_art_reasoning },
    { name: 'Competition Agent', emoji: '🏆', score: agent_scores.competition, confidence: 70, summary: report.competition_summary, reasoning: report.competition_reasoning },
    { name: 'Solution Agent', emoji: '⚙️', score: agent_scores.solution, confidence: 70, summary: report.solution_summary, reasoning: report.solution_reasoning },
    { name: 'Critic Agent', emoji: '🔥', score: agent_scores.critic, confidence: 70, summary: report.critic_summary, reasoning: report.critic_reasoning, recommendation: report.critic_recommendation },
  ];

  return (
    <div className="space-y-6">
      <BasicView report={report} />

      {/* Agent Cards */}
      <div>
        <h2 className="text-lg font-bold text-[#0F172A] mb-4">AI Agent Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {agents.map(a => <AgentCard key={a.name} {...a} />)}
        </div>
      </div>

      {/* Research */}
      <Collapsible title="Research Findings" icon={Globe} badge={`${report.research_existing_solutions?.length || 0} solutions`} defaultOpen>
        <div className="mt-4 space-y-3">
          {report.research_market_landscape && (
            <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
              <p className="text-xs font-bold text-[#475569] uppercase mb-1">Market Landscape</p>
              <p className="text-sm text-[#0F172A]">{report.research_market_landscape}</p>
            </div>
          )}
          {report.research_existing_solutions?.map((s, i) => (
            <div key={i} className="p-4 border border-[#E2E8F0] rounded-lg">
              <div className="flex justify-between items-start">
                <p className="text-sm font-bold text-[#0F172A]">{s.name}</p>
                {s.url && <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-[#2563EB]"><ExternalLink className="w-3.5 h-3.5" /></a>}
              </div>
              <p className="text-xs text-[#475569] mt-1">{s.description}</p>
              {s.gap && <p className="text-xs text-[#EF4444] mt-1 font-medium">Gap: {s.gap}</p>}
            </div>
          ))}
          {report.research_trends?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-[#475569] uppercase mb-2">Technology Trends</p>
              <div className="flex flex-wrap gap-2">{report.research_trends.map((t, i) => <span key={i} className="px-2.5 py-1 bg-[#EFF6FF] text-[#2563EB] text-xs font-medium rounded-full">{t}</span>)}</div>
            </div>
          )}
        </div>
      </Collapsible>

      {/* Competition */}
      <Collapsible title="Competitive Landscape" icon={TrendingUp} badge={report.competition_saturation}>
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-[#475569]">Market Saturation:</span>
            <span className="text-xs font-black px-2 py-0.5 rounded" style={{ color: SATURATION_COLOR[report.competition_saturation] || '#475569', background: '#F1F5F9' }}>{report.competition_saturation}</span>
          </div>
          {report.competitors?.map((c, i) => (
            <div key={i} className="p-4 border border-[#E2E8F0] rounded-lg">
              <div className="flex justify-between items-start mb-1">
                <p className="text-sm font-bold text-[#0F172A]">{c.name}</p>
                <span className="text-xs font-bold text-[#EF4444]">{c.similarity}% similar</span>
              </div>
              <p className="text-xs text-[#475569] mb-2">{c.description}</p>
              <div className="grid grid-cols-2 gap-2">
                {c.strengths?.length > 0 && <div><p className="text-[10px] font-bold text-[#16A34A] mb-1">STRENGTHS</p>{c.strengths.map((s, j) => <p key={j} className="text-[10px] text-[#475569]">• {s}</p>)}</div>}
                {c.weaknesses?.length > 0 && <div><p className="text-[10px] font-bold text-[#DC2626] mb-1">WEAKNESSES</p>{c.weaknesses.map((w, j) => <p key={j} className="text-[10px] text-[#475569]">• {w}</p>)}</div>}
              </div>
            </div>
          ))}
          {report.differentiation_opportunities?.length > 0 && (
            <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg">
              <p className="text-xs font-bold text-[#16A34A] uppercase mb-2">Differentiation Opportunities</p>
              {report.differentiation_opportunities.map((o, i) => <p key={i} className="text-xs text-[#0F172A] mb-1">• {o}</p>)}
            </div>
          )}
        </div>
      </Collapsible>

      {/* Prior Art */}
      <Collapsible title="Prior Art & Academic Research" icon={BookOpen} badge={report.prior_art_papers?.length + ' papers'}>
        <div className="mt-4 space-y-3">
          {report.prior_art_summary && <p className="text-sm text-[#475569]">{report.prior_art_summary}</p>}
          {report.prior_art_gaps?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-[#475569] uppercase mb-2">Research Gaps</p>
              {report.prior_art_gaps.map((g, i) => <p key={i} className="text-xs text-[#0F172A] mb-1">• {g}</p>)}
            </div>
          )}
          {report.prior_art_patents?.length > 0 && (
            <div className="p-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-lg">
              <p className="text-[10px] font-bold text-[#D97706] uppercase mb-2">Prior Art Signals (Informational Only — Not Legal Advice)</p>
              {report.prior_art_patents.map((pt, i) => (
                <div key={i} className="mb-2">
                  <p className="text-xs font-medium text-[#0F172A]">{pt.title}</p>
                  <p className="text-[10px] text-[#D97706]">{pt.disclaimer}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Collapsible>

      {/* Solution */}
      <Collapsible title="Proposed Solution & Innovation" icon={Cpu} defaultOpen>
        <div className="mt-4 space-y-4">
          {report.solution_summary && <p className="text-sm text-[#475569]">{report.solution_summary}</p>}
          {report.mvp_features?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-[#475569] uppercase mb-2">MVP Features</p>
              <div className="space-y-2">
                {report.mvp_features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 border border-[#E2E8F0] rounded-lg">
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded flex-shrink-0 ${f.priority === 'MUST' ? 'bg-[#F0FDF4] text-[#16A34A]' : f.priority === 'SHOULD' ? 'bg-[#EFF6FF] text-[#2563EB]' : 'bg-[#F1F5F9] text-[#475569]'}`}>{f.priority}</span>
                    <div><p className="text-xs font-bold text-[#0F172A]">{f.name}</p><p className="text-xs text-[#475569]">{f.description}</p></div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {report.innovation_opportunities?.length > 0 && (
            <div className="p-4 bg-[#F5F3FF] border border-[#DDD6FE] rounded-lg">
              <p className="text-xs font-bold text-[#7C3AED] uppercase mb-2">Innovation Opportunities</p>
              {report.innovation_opportunities.map((o, i) => <p key={i} className="text-xs text-[#0F172A] mb-1">💡 {o}</p>)}
            </div>
          )}
        </div>
      </Collapsible>

      {/* Critic */}
      <Collapsible title="Critic Analysis" icon={AlertTriangle}>
        <div className="mt-4 space-y-3">
          {report.critic_summary && <p className="text-sm text-[#475569]">{report.critic_summary}</p>}
          {report.critic_risks?.length > 0 && (
            <div className="space-y-2">
              {report.critic_risks.map((r, i) => (
                <div key={i} className="p-3 border-l-4 rounded-r-lg" style={{ borderColor: SEVERITY_COLOR[r.severity] || '#94A3B8', background: '#F8FAFC' }}>
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-[#0F172A]">{r.risk}</p>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ color: SEVERITY_COLOR[r.severity] || '#94A3B8', background: '#fff' }}>{r.severity}</span>
                  </div>
                  <p className="text-[10px] text-[#475569] mt-1">Mitigation: {r.mitigation}</p>
                </div>
              ))}
            </div>
          )}
          {report.critic_weak_assumptions?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-[#475569] uppercase mb-2">Weak Assumptions</p>
              {report.critic_weak_assumptions.map((a, i) => <p key={i} className="text-xs text-[#0F172A] mb-1">⚠️ {a}</p>)}
            </div>
          )}
        </div>
      </Collapsible>
    </div>
  );
}

// ── View: FULL REPORT ──────────────────────────────────────────────────────────

function FullReportView({ report }) {
  return (
    <div className="space-y-6">
      <AnalysisView report={report} />

      {/* Architecture */}
      {report.architecture_mermaid && (
        <Collapsible title="System Architecture" icon={Cpu} defaultOpen>
          <div className="mt-4">
            <MermaidDiagram chart={report.architecture_mermaid} />
          </div>
        </Collapsible>
      )}

      {/* Tech Stack */}
      {report.tech_stack && Object.keys(report.tech_stack).length > 0 && (
        <Collapsible title="Recommended Tech Stack" icon={Cpu}>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(report.tech_stack).map(([cat, items]) => (
              <div key={cat}>
                <p className="text-xs font-bold text-[#475569] uppercase mb-2">{cat.replace('_', ' ')}</p>
                <div className="flex flex-wrap gap-1.5">{(items || []).map((t, i) => <span key={i} className="px-2 py-1 bg-[#F1F5F9] text-[#0F172A] text-xs font-medium rounded">{t}</span>)}</div>
              </div>
            ))}
          </div>
        </Collapsible>
      )}

      {/* Roadmap */}
      {report.roadmap?.length > 0 && (
        <Collapsible title="Roadmap" icon={TrendingUp}>
          <div className="mt-4 space-y-3">
            {report.roadmap.map((phase, i) => (
              <div key={i} className="p-4 border border-[#E2E8F0] rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-bold text-[#0F172A]">{phase.phase}</p>
                  <span className="text-xs text-[#94A3B8] bg-[#F1F5F9] px-2 py-0.5 rounded-full">{phase.duration}</span>
                </div>
                <ul className="space-y-1">{(phase.tasks || []).map((t, j) => <li key={j} className="text-xs text-[#475569]">• {t}</li>)}</ul>
              </div>
            ))}
          </div>
        </Collapsible>
      )}

      {/* GitHub Repos */}
      {report.github_repos?.length > 0 && (
        <Collapsible title="GitHub Repositories Found" icon={GitBranch} badge={`${report.github_repos.length} repos`}>
          <div className="mt-4 space-y-3">
            {report.github_repos.map((r, i) => (
              <div key={i} className="p-4 border border-[#E2E8F0] rounded-lg flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#0F172A]">{r.repo_name || r.title}</p>
                  <p className="text-xs text-[#475569] mt-0.5">{r.description?.slice(0, 150)}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    {r.stars > 0 && <span className="text-xs text-[#94A3B8] flex items-center gap-1"><Star className="w-3 h-3" />{r.stars.toLocaleString()}</span>}
                    {r.language && <span className="text-xs text-[#94A3B8]">{r.language}</span>}
                  </div>
                </div>
                {r.url && <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-[#2563EB] flex-shrink-0"><ExternalLink className="w-4 h-4" /></a>}
              </div>
            ))}
          </div>
        </Collapsible>
      )}

      {/* Research Papers */}
      {report.research_papers?.length > 0 && (
        <Collapsible title="Academic Papers" icon={BookOpen} badge={`${report.research_papers.length} papers`}>
          <div className="mt-4 space-y-3">
            {report.research_papers.map((p, i) => (
              <div key={i} className="p-4 border border-[#E2E8F0] rounded-lg">
                <div className="flex justify-between items-start gap-2">
                  <p className="text-sm font-bold text-[#0F172A] flex-1">{p.title}</p>
                  {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-[#2563EB] flex-shrink-0"><ExternalLink className="w-3.5 h-3.5" /></a>}
                </div>
                {p.authors?.length > 0 && <p className="text-xs text-[#94A3B8] mt-0.5">{p.authors.slice(0, 3).join(', ')}{p.year ? ` · ${p.year}` : ''}{p.citations ? ` · ${p.citations} citations` : ''}</p>}
                {p.abstract && <p className="text-xs text-[#475569] mt-1 line-clamp-3">{p.abstract}</p>}
              </div>
            ))}
          </div>
        </Collapsible>
      )}

      {/* Key Risks & Opportunities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {report.key_risks?.length > 0 && (
          <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-5">
            <p className="text-xs font-bold text-[#DC2626] uppercase mb-3">Key Risks</p>
            {report.key_risks.map((r, i) => <p key={i} className="text-xs text-[#0F172A] mb-1.5">• {typeof r === 'string' ? r : r.risk || JSON.stringify(r)}</p>)}
          </div>
        )}
        {report.key_opportunities?.length > 0 && (
          <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-5">
            <p className="text-xs font-bold text-[#16A34A] uppercase mb-3">Key Opportunities</p>
            {report.key_opportunities.map((o, i) => <p key={i} className="text-xs text-[#0F172A] mb-1.5">• {o}</p>)}
          </div>
        )}
      </div>

      {/* Evidence Summary */}
      {report.evidence_summary && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5">
          <p className="text-sm font-bold text-[#0F172A] mb-3">Evidence Summary</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
            {[
              { label: 'GitHub', value: report.evidence_summary.github_count },
              { label: 'Papers', value: report.evidence_summary.paper_count },
              { label: 'Patents', value: report.evidence_summary.patent_count },
              { label: 'Web', value: report.evidence_summary.web_count },
              { label: 'Deep Extract', value: report.evidence_summary.firecrawl_pages },
            ].map(({ label, value }) => (
              <div key={label} className="p-3 bg-[#F8FAFC] rounded-lg">
                <p className="text-xl font-black text-[#0F172A]">{value}</p>
                <p className="text-[10px] text-[#94A3B8]">{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-[#475569]">Evidence Strength:</span>
            <span className="text-xs font-bold" style={{ color: EVIDENCE_COLOR[report.evidence_summary.evidence_strength] || '#94A3B8' }}>
              {report.evidence_summary.evidence_strength}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Report Page ───────────────────────────────────────────────────────────

const VIEWS = [
  { id: 'basic', label: 'Basic', icon: BarChart2, description: 'Score, scorecard & key findings' },
  { id: 'analysis', label: 'Analysis', icon: Microscope, description: 'Agent results & deep analysis' },
  { id: 'full', label: 'Full Report', icon: FileText, description: 'Everything + architecture & evidence' },
];

export default function ValidationReportPage() {
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [activeView, setActiveView] = useState('basic');
  const [showWarnings, setShowWarnings] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('validation_report');
    const w = sessionStorage.getItem('validation_warnings');
    if (!raw) { router.replace('/validate'); return; }
    try {
      setReport(JSON.parse(raw));
      setWarnings(JSON.parse(w || '[]'));
    } catch { router.replace('/validate'); }
  }, []);

  if (!report) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const cfg = RECOMMENDATION_CONFIG[report.decision?.recommendation] || RECOMMENDATION_CONFIG.REWORK;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Nav */}
      <nav className="border-b border-[#E2E8F0] bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/validate')} className="flex items-center gap-1.5 text-sm text-[#475569] hover:text-[#0F172A] transition-colors">
              <ArrowLeft className="w-4 h-4" /> New Analysis
            </button>
            <span className="text-[#CBD5E1]">|</span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#0F172A] rounded-md flex items-center justify-center"><Zap className="w-3.5 h-3.5 text-white" /></div>
              <span className="font-bold text-[#0F172A] text-sm">{report.project_title}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-2 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
            {VIEWS.map(v => (
              <button
                key={v.id}
                onClick={() => setActiveView(v.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeView === v.id ? 'bg-[#0F172A] text-white shadow-sm' : 'text-[#475569] hover:text-[#0F172A]'}`}
              >
                <v.icon className="w-3.5 h-3.5" />
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8 pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">{report.project_title}</h1>
            <p className="text-sm text-[#94A3B8] mt-1 max-w-2xl">{report.project_description?.slice(0, 150)}{report.project_description?.length > 150 ? '...' : ''}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {report.target_users?.map((u, i) => <span key={i} className="text-xs px-2 py-0.5 bg-[#EFF6FF] text-[#2563EB] rounded-full font-medium">{u}</span>)}
              {report.market && <span className="text-xs px-2 py-0.5 bg-[#F1F5F9] text-[#475569] rounded-full font-medium">🌍 {report.market}</span>}
            </div>
          </div>

          {/* Mini decision badge */}
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl border text-center flex-shrink-0" style={{ background: cfg.bg, borderColor: cfg.border }}>
            <div>
              <div className="text-2xl font-black" style={{ color: cfg.color }}>{report.decision?.overall_score}</div>
              <div className="text-[10px] text-[#94A3B8]">/100</div>
            </div>
            <div>
              <div className="text-lg font-black" style={{ color: cfg.color }}>{cfg.emoji} {report.decision?.recommendation}</div>
              <div className="text-[10px] text-[#94A3B8]">{report.decision?.confidence}% confidence</div>
            </div>
          </div>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="mb-6 p-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl">
            <button onClick={() => setShowWarnings(o => !o)} className="w-full flex items-center justify-between text-xs font-semibold text-[#D97706]">
              <span>⚠️ {warnings.length} analysis warning{warnings.length > 1 ? 's' : ''}</span>
              {showWarnings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {showWarnings && <ul className="mt-2 space-y-1">{warnings.map((w, i) => <li key={i} className="text-xs text-[#D97706]">• {w}</li>)}</ul>}
          </div>
        )}

        {/* Report is partial */}
        {report.is_partial && (
          <div className="mb-6 p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-xs text-[#DC2626] font-medium">
            ⚠️ Some evidence collection failed. Analysis is based on partial data. Results may have lower confidence.
          </div>
        )}

        {/* View content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeView} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {activeView === 'basic' && <BasicView report={report} />}
            {activeView === 'analysis' && <AnalysisView report={report} />}
            {activeView === 'full' && <FullReportView report={report} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
