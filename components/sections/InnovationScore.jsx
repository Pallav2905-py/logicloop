'use client';

import { useState, useEffect } from 'react';
import { Card, SectionHeader, FadeIn, Badge } from '@/components/ui';
import { BrainCircuit, TrendingUp, ShieldCheck, ChevronRight } from 'lucide-react';
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';

// ── Animated Number ──────────────────────────────────────────────────────────
function AnimatedNumber({ value, duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = value / (duration / 16);
    const id = setInterval(() => {
      start = Math.min(start + step, value);
      setDisplay(Math.round(start));
      if (start >= value) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [value, duration]);
  return display;
}

// ── Central Gauge ─────────────────────────────────────────────────────────────
function ConsensusGauge({ score, confidence }) {
  const color = score >= 80 ? '#22C55E' : score >= 65 ? '#F59E0B' : '#EF4444';
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-44 h-44">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="68%"
            outerRadius="90%"
            barSize={11}
            data={[{ value: score, fill: color }]}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar
              background={{ fill: '#F1F5F9' }}
              dataKey="value"
              angleAxisId={0}
              cornerRadius={6}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-extrabold text-[#0F172A] leading-none">
            <AnimatedNumber value={score} />
          </span>
          <span className="text-xs text-[#94A3B8] font-medium mt-0.5">/ 100</span>
          <span className="text-[10px] font-semibold text-[#2563EB] uppercase tracking-wider mt-1">
            Consensus
          </span>
        </div>
      </div>
      {/* Confidence pill */}
      <div className="mt-3 flex items-center gap-1.5 bg-[#F0FDF4] border border-[#BBF7D0] rounded-full px-3 py-1">
        <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
        <span className="text-xs font-semibold text-[#16A34A]">
          <AnimatedNumber value={confidence} />% Confidence
        </span>
      </div>
    </div>
  );
}

// ── Metric Bar ────────────────────────────────────────────────────────────────
function MetricBar({ label, value, color, inverted = false, delay = 0 }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const display = inverted ? `${value} Risk` : value;
  const fillColor = inverted
    ? value <= 30 ? '#22C55E' : value <= 50 ? '#F59E0B' : '#EF4444'
    : color;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-[#475569]">{label}</span>
        <span className="text-xs font-bold text-[#0F172A]">{display}</span>
      </div>
      <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: animated ? `${value}%` : '0%',
            backgroundColor: fillColor,
          }}
        />
      </div>
    </div>
  );
}

// ── Evaluator Chip ────────────────────────────────────────────────────────────
function EvaluatorChip({ evaluator, delay = 0 }) {
  const color =
    evaluator.score >= 85
      ? { bg: '#EFF6FF', border: '#BFDBFE', text: '#2563EB' }
      : evaluator.score >= 70
      ? { bg: '#F0FDF4', border: '#BBF7D0', text: '#16A34A' }
      : { bg: '#FFFBEB', border: '#FDE68A', text: '#D97706' };

  return (
    <FadeIn delay={delay}>
      <div
        className="flex items-center justify-between rounded-lg border px-3 py-2 gap-3"
        style={{ backgroundColor: color.bg, borderColor: color.border }}
      >
        <span className="text-xs font-medium text-[#475569] truncate">{evaluator.name}</span>
        <span className="text-sm font-extrabold flex-shrink-0" style={{ color: color.text }}>
          {evaluator.score}
        </span>
      </div>
    </FadeIn>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function InnovationScore({ innovationScore, evaluation }) {
  if (!innovationScore) return null;

  const {
    overall,
    novelty,
    feasibility,
    marketDemand,
    confidence = 88,
    technicalComplexity = 70,
    researchCoverage = 80,
    riskIndex = 35,
  } = innovationScore;

  const consensusScore = evaluation?.consensusScore ?? overall;
  const confidenceLevel = evaluation?.confidenceLevel ?? confidence;
  const evaluators = evaluation?.evaluators ?? [];

  const scoreLabel =
    consensusScore >= 80 ? 'Excellent' : consensusScore >= 65 ? 'Strong' : consensusScore >= 50 ? 'Good' : 'Fair';
  const scoreBadgeVariant =
    consensusScore >= 80 ? 'success' : consensusScore >= 65 ? 'accent' : consensusScore >= 50 ? 'warning' : 'danger';

  const metrics = [
    { label: 'Novelty', value: novelty, color: '#7C3AED' },
    { label: 'Feasibility', value: feasibility, color: '#22C55E' },
    { label: 'Market Potential', value: marketDemand, color: '#2563EB' },
    { label: 'Technical Complexity', value: technicalComplexity, color: '#0284C7' },
    { label: 'Research Coverage', value: researchCoverage, color: '#0891B2' },
    { label: 'Risk Index', value: riskIndex, color: '#EF4444', inverted: true },
  ];

  return (
    <Card className="p-6">
      <SectionHeader
        icon={BrainCircuit}
        title="AI Consensus Score"
        description="Weighted aggregate of 5 independent AI evaluator perspectives"
        badge={<Badge variant={scoreBadgeVariant}>{scoreLabel}</Badge>}
      />

      <div className="flex flex-col lg:flex-row items-start gap-8">
        {/* Left — Gauge + label */}
        <FadeIn delay={0.05} className="flex-shrink-0 flex flex-col items-center lg:items-start">
          <ConsensusGauge score={consensusScore} confidence={confidenceLevel} />
        </FadeIn>

        {/* Right — Metrics */}
        <FadeIn delay={0.15} className="flex-1 w-full space-y-3.5">
          {metrics.map((m, i) => (
            <MetricBar
              key={m.label}
              label={m.label}
              value={m.value}
              color={m.color}
              inverted={m.inverted}
              delay={200 + i * 80}
            />
          ))}
        </FadeIn>
      </div>

      {/* Evaluator chips row */}
      {evaluators.length > 0 && (
        <div className="mt-6 pt-5 border-t border-[#F1F5F9]">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-3.5 h-3.5 text-[#94A3B8]" />
            <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
              Individual Evaluator Scores
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {evaluators.map((ev, i) => (
              <EvaluatorChip key={ev.name} evaluator={ev} delay={0.3 + i * 0.06} />
            ))}
          </div>
          {/* Consensus banner */}
          <div className="mt-4 flex items-center justify-between bg-[#0F172A] rounded-xl px-5 py-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span className="text-sm font-semibold text-white">Consensus Reached</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-2xl font-extrabold text-white">{consensusScore}</span>
              <span className="text-sm text-[#94A3B8]">/ 100</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
