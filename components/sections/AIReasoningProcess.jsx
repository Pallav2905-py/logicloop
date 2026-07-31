'use client';

import { Card, SectionHeader, FadeIn, Badge } from '@/components/ui';
import {
  Layers, CheckCircle2, AlertTriangle, Target,
  Zap, ShieldAlert, TrendingUp,
} from 'lucide-react';

// ── Reasoning List ────────────────────────────────────────────────────────────
function ReasoningList({ items, type }) {
  const isPositive = type === 'positive';
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
            isPositive ? 'bg-[#F0FDF4] border border-[#BBF7D0]' : 'bg-[#FFFBEB] border border-[#FDE68A]'
          }`}>
            {isPositive
              ? <CheckCircle2 className="w-3 h-3 text-[#22C55E]" />
              : <AlertTriangle className="w-3 h-3 text-[#F59E0B]" />
            }
          </div>
          <span className={`text-sm leading-relaxed ${
            isPositive ? 'text-[#166534]' : 'text-[#92400E]'
          }`}>{item}</span>
        </li>
      ))}
    </ul>
  );
}

// ── Confidence Meter ──────────────────────────────────────────────────────────
function ConfidenceMeter({ level, explanation }) {
  const color = level >= 85 ? '#22C55E' : level >= 70 ? '#F59E0B' : '#EF4444';
  const label = level >= 85 ? 'High Confidence' : level >= 70 ? 'Moderate Confidence' : 'Low Confidence';
  const variant = level >= 85 ? 'success' : level >= 70 ? 'warning' : 'danger';

  return (
    <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-[#0F172A]">Overall Confidence</p>
        <Badge variant={variant}>{label}</Badge>
      </div>
      <div className="flex items-baseline gap-1.5 mb-3">
        <span className="text-3xl font-extrabold text-[#0F172A]">{level}%</span>
      </div>
      <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${level}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-xs text-[#94A3B8] leading-relaxed">{explanation}</p>
    </div>
  );
}

// ── Risk / Opportunity Item ───────────────────────────────────────────────────
function ListItem({ text, icon: Icon, iconColor, bgColor }) {
  return (
    <div className={`flex items-start gap-2.5 rounded-lg px-3 py-2.5 ${bgColor}`}>
      <Icon className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${iconColor}`} />
      <span className="text-xs text-[#475569] leading-relaxed">{text}</span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AIReasoningProcess({ evaluation }) {
  if (!evaluation) return null;

  const {
    positiveAnalysis = [],
    criticalAnalysis = [],
    consensusSummary,
    confidenceLevel = 88,
    confidenceExplanation = 'Based on research coverage, reasoning consistency, and available public evidence.',
    keyRisks = [],
    keyOpportunities = [],
  } = evaluation;

  return (
    <Card className="p-6">
      <SectionHeader
        icon={Layers}
        title="AI Reasoning Process"
        description="Multi-perspective evaluation with positive and critical reasoning modes"
      />

      <div className="space-y-6">
        {/* Positive vs Critical reasoning */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Positive */}
          <FadeIn delay={0.05}>
            <div className="rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] p-5 h-full">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-[#22C55E] flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#15803D]">Positive Reasoning</p>
                  <p className="text-[10px] text-[#86EFAC] font-medium">AI argues why this idea succeeds</p>
                </div>
              </div>
              <ReasoningList items={positiveAnalysis} type="positive" />
            </div>
          </FadeIn>

          {/* Critical */}
          <FadeIn delay={0.1}>
            <div className="rounded-xl bg-[#FFFBEB] border border-[#FDE68A] p-5 h-full">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-[#F59E0B] flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#B45309]">Critical Reasoning</p>
                  <p className="text-[10px] text-[#FCD34D] font-medium">AI actively searches for flaws</p>
                </div>
              </div>
              <ReasoningList items={criticalAnalysis} type="critical" />
            </div>
          </FadeIn>
        </div>

        {/* Consensus Summary */}
        {consensusSummary && (
          <FadeIn delay={0.15}>
            <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-[#2563EB]" />
                <p className="text-sm font-semibold text-[#0F172A]">Consensus Summary</p>
              </div>
              <p className="text-sm text-[#475569] leading-relaxed border-l-2 border-[#2563EB] pl-3">
                {consensusSummary}
              </p>
            </div>
          </FadeIn>
        )}

        {/* Confidence + Key Risks + Key Opportunities */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Confidence */}
          <FadeIn delay={0.2}>
            <ConfidenceMeter level={confidenceLevel} explanation={confidenceExplanation} />
          </FadeIn>

          {/* Key Risks */}
          <FadeIn delay={0.25}>
            <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-4 h-full">
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className="w-4 h-4 text-[#EF4444]" />
                <p className="text-sm font-semibold text-[#0F172A]">Key Risks</p>
              </div>
              <div className="space-y-2">
                {keyRisks.map((risk, i) => (
                  <ListItem
                    key={i}
                    text={risk}
                    icon={AlertTriangle}
                    iconColor="text-[#EF4444]"
                    bgColor="bg-[#FEF2F2] border border-[#FECACA] rounded-lg"
                  />
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Key Opportunities */}
          <FadeIn delay={0.3}>
            <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-4 h-full">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-[#22C55E]" />
                <p className="text-sm font-semibold text-[#0F172A]">Key Opportunities</p>
              </div>
              <div className="space-y-2">
                {keyOpportunities.map((opp, i) => (
                  <ListItem
                    key={i}
                    text={opp}
                    icon={CheckCircle2}
                    iconColor="text-[#22C55E]"
                    bgColor="bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg"
                  />
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </Card>
  );
}
