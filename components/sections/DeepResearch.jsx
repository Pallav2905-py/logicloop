'use client';

import { Card, SectionHeader, FadeIn, Badge } from '@/components/ui';
import { BookOpen, AlertTriangle, TrendingUp, Lightbulb, Globe } from 'lucide-react';

export default function DeepResearch({ research }) {
  if (!research) return null;

  return (
    <Card className="p-6">
      <SectionHeader
        icon={BookOpen}
        title="Deep Research"
        description="Market landscape, existing solutions, and emerging trends"
      />

      <div className="space-y-6">
        {/* Summary */}
        <FadeIn delay={0.05}>
          <p className="text-sm text-[#475569] leading-relaxed border-l-2 border-[#2563EB] pl-4">
            {research.summary}
          </p>
        </FadeIn>

        {/* Market Analysis */}
        <FadeIn delay={0.1}>
          <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-[#2563EB]" />
              <span className="text-sm font-semibold text-[#0F172A]">Market Analysis</span>
            </div>
            <p className="text-sm text-[#475569] leading-relaxed">{research.marketAnalysis}</p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Existing Solutions */}
          <FadeIn delay={0.15}>
            <div>
              <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">
                Existing Solutions
              </p>
              <div className="space-y-2">
                {(research.existingSolutions || []).map((sol, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg border border-[#E2E8F0] hover:border-[#BFDBFE] hover:bg-[#F8FAFC] transition-colors group"
                  >
                    <div className="w-6 h-6 rounded bg-[#F1F5F9] flex items-center justify-center flex-shrink-0 text-xs font-bold text-[#475569]">
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#0F172A]">{sol.name}</p>
                      <p className="text-xs text-[#94A3B8] mt-0.5 leading-relaxed">{sol.description}</p>
                      {sol.url && (
                        <a
                          href={sol.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#2563EB] hover:underline mt-1 inline-block truncate max-w-full"
                        >
                          {sol.url}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          <div className="space-y-4">
            {/* Challenges */}
            <FadeIn delay={0.2}>
              <div>
                <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">
                  Key Challenges
                </p>
                <div className="space-y-2">
                  {(research.challenges || []).map((ch, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-[#475569]">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                      <span>{ch}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Future Trends */}
            <FadeIn delay={0.25}>
              <div>
                <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">
                  Future Trends
                </p>
                <div className="space-y-2">
                  {(research.futureTrends || []).map((trend, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-[#475569]">
                      <TrendingUp className="w-3.5 h-3.5 text-[#22C55E] flex-shrink-0 mt-0.5" />
                      <span>{trend}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </Card>
  );
}
