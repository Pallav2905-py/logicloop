'use client';

import { Card, SectionHeader, FadeIn, Badge } from '@/components/ui';
import { Gauge } from 'lucide-react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

function ScoreGauge({ score }) {
  const data = [{ value: score, fill: '#2563EB' }];
  const color = score >= 80 ? '#22C55E' : score >= 60 ? '#F59E0B' : '#EF4444';

  return (
    <div className="relative w-48 h-48 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="70%"
          outerRadius="90%"
          barSize={12}
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
        <span className="text-4xl font-extrabold text-[#0F172A]">{score}</span>
        <span className="text-sm text-[#94A3B8] font-medium">/ 100</span>
      </div>
    </div>
  );
}

function MetricBar({ label, value, color }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-[#475569]">{label}</span>
        <span className="text-sm font-bold text-[#0F172A]">{value}</span>
      </div>
      <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function InnovationScore({ innovationScore }) {
  if (!innovationScore) return null;

  const { overall, novelty, feasibility, marketDemand } = innovationScore;

  const scoreLabel =
    overall >= 80 ? 'Excellent' : overall >= 65 ? 'Strong' : overall >= 50 ? 'Good' : 'Fair';

  const scoreBadge =
    overall >= 80 ? 'success' : overall >= 65 ? 'accent' : overall >= 50 ? 'warning' : 'danger';

  return (
    <Card className="p-6">
      <SectionHeader
        icon={Gauge}
        title="Innovation Score"
        description="AI-assessed potential across key dimensions"
        badge={<Badge variant={scoreBadge}>{scoreLabel}</Badge>}
      />

      <div className="flex flex-col sm:flex-row items-center gap-8">
        {/* Gauge */}
        <FadeIn delay={0.05}>
          <ScoreGauge score={overall} />
        </FadeIn>

        {/* Metrics */}
        <FadeIn delay={0.15} className="flex-1 w-full space-y-4">
          <MetricBar label="Novelty" value={novelty} color="#2563EB" />
          <MetricBar label="Feasibility" value={feasibility} color="#22C55E" />
          <MetricBar label="Market Demand" value={marketDemand} color="#F59E0B" />
        </FadeIn>
      </div>
    </Card>
  );
}
