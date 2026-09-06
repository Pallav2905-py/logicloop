'use client';

import { useState } from 'react';
import { Card, SectionHeader, FadeIn, Badge } from '@/components/ui';
import {
  Lightbulb, Cpu, TrendingUp, ShieldAlert, BookOpen,
  CheckCircle2, AlertTriangle, Users, ChevronDown, ChevronUp,
} from 'lucide-react';

// ── Evaluator icon map ────────────────────────────────────────────────────────
const EVALUATOR_CONFIG = {
  'Innovation Analyst': {
    icon: Lightbulb,
    accent: 'bg-[#F5F3FF] border-[#DDD6FE]',
    iconBg: 'bg-[#7C3AED]',
    scoreColor: '#7C3AED',
  },
  'Technical Architect': {
    icon: Cpu,
    accent: 'bg-[#EFF6FF] border-[#BFDBFE]',
    iconBg: 'bg-[#2563EB]',
    scoreColor: '#2563EB',
  },
  'Market Strategist': {
    icon: TrendingUp,
    accent: 'bg-[#F0FDF4] border-[#BBF7D0]',
    iconBg: 'bg-[#16A34A]',
    scoreColor: '#16A34A',
  },
  'Risk Analyst': {
    icon: ShieldAlert,
    accent: 'bg-[#FFFBEB] border-[#FDE68A]',
    iconBg: 'bg-[#D97706]',
    scoreColor: '#D97706',
  },
  'Research Mentor': {
    icon: BookOpen,
    accent: 'bg-[#F0F9FF] border-[#BAE6FD]',
    iconBg: 'bg-[#0284C7]',
    scoreColor: '#0284C7',
  },
};

const DEFAULT_CONFIG = {
  icon: Users,
  accent: 'bg-[#F8FAFC] border-[#E2E8F0]',
  iconBg: 'bg-[#475569]',
  scoreColor: '#475569',
};

// ── Score Circle ──────────────────────────────────────────────────────────────
function ScoreCircle({ score, color }) {
  const radius = 28;
  const circ = 2 * Math.PI * radius;
  const pct = Math.min(Math.max(score, 0), 100) / 100;
  return (
    <div className="relative w-16 h-16 flex-shrink-0">
      <svg width="64" height="64" className="-rotate-90">
        <circle
          cx="32" cy="32" r={radius}
          fill="none" stroke="#F1F5F9" strokeWidth="5"
        />
        <circle
          cx="32" cy="32" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-extrabold text-[#0F172A] leading-none">{score}</span>
      </div>
    </div>
  );
}

// ── Confidence Bar ────────────────────────────────────────────────────────────
function ConfidenceBar({ value }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-[#22C55E] transition-all duration-700"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-[#16A34A] w-8 text-right">{value}%</span>
    </div>
  );
}

// ── Evaluator Card ────────────────────────────────────────────────────────────
function EvaluatorCard({ evaluator, delay }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = EVALUATOR_CONFIG[evaluator.name] || DEFAULT_CONFIG;
  const Icon = cfg.icon;

  return (
    <FadeIn delay={delay}>
      <div className={`rounded-xl border ${cfg.accent} p-4 h-full flex flex-col gap-3`}>
        {/* Header row */}
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-lg ${cfg.iconBg} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#0F172A] leading-tight">{evaluator.name}</p>
            <p className="text-xs text-[#94A3B8] mt-0.5 leading-tight">{evaluator.role}</p>
          </div>
          <ScoreCircle score={evaluator.score} color={cfg.scoreColor} />
        </div>

        {/* Confidence */}
        <div>
          <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5">
            Confidence
          </p>
          <ConfidenceBar value={evaluator.confidence} />
        </div>

        {/* Summary */}
        <p className="text-xs text-[#475569] leading-relaxed line-clamp-3">{evaluator.summary}</p>

        {/* Expand / collapse */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors mt-auto"
        >
          {expanded ? (
            <><ChevronUp className="w-3 h-3" /> Hide details</>
          ) : (
            <><ChevronDown className="w-3 h-3" /> Show details</>
          )}
        </button>

        {expanded && (
          <div className="space-y-3 pt-2 border-t border-white/60">
            {/* Strengths */}
            {evaluator.strengths?.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-[#16A34A] uppercase tracking-wider mb-1.5">
                  Strengths
                </p>
                <ul className="space-y-1">
                  {evaluator.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-[#166534]">
                      <CheckCircle2 className="w-3 h-3 text-[#22C55E] flex-shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Concerns */}
            {evaluator.concerns?.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-[#D97706] uppercase tracking-wider mb-1.5">
                  Concerns
                </p>
                <ul className="space-y-1">
                  {evaluator.concerns.map((c, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-[#92400E]">
                      <AlertTriangle className="w-3 h-3 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </FadeIn>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function EvaluationEngine({ evaluation }) {
  if (!evaluation?.evaluators?.length) return null;

  const { evaluators, consensusScore, confidenceLevel, confidenceExplanation } = evaluation;

  const consensusColor =
    consensusScore >= 80 ? 'success' : consensusScore >= 65 ? 'accent' : 'warning';

  return (
    <Card className="p-6">
      <SectionHeader
        icon={Users}
        title="AI Evaluation Engine"
        description="5 independent expert perspectives evaluated this idea before reaching consensus"
        badge={<Badge variant={consensusColor}>Consensus: {consensusScore}/100</Badge>}
      />

      {/* Evaluator cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {evaluators.map((ev, i) => (
          <EvaluatorCard key={ev.name} evaluator={ev} delay={i * 0.07} />
        ))}
      </div>

      {/* Consensus panel */}
      <FadeIn delay={0.4}>
        <div className="rounded-xl bg-[#0F172A] p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Score */}
          <div className="flex items-baseline gap-1 flex-shrink-0">
            <span className="text-4xl font-extrabold text-white">{consensusScore}</span>
            <span className="text-lg text-[#475569]">/ 100</span>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span className="text-sm font-semibold text-white">Consensus Reached</span>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              {confidenceExplanation || 'Based on research coverage, reasoning consistency and available public evidence.'}
            </p>
          </div>

          {/* Confidence */}
          <div className="flex-shrink-0 text-center bg-white/10 rounded-xl px-5 py-3">
            <p className="text-2xl font-extrabold text-[#22C55E]">{confidenceLevel}%</p>
            <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider mt-0.5">
              Overall Confidence
            </p>
          </div>
        </div>
      </FadeIn>
    </Card>
  );
}
