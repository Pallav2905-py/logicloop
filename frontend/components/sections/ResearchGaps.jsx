'use client';

import { Card, SectionHeader, FadeIn, Badge } from '@/components/ui';
import { Lightbulb, ArrowRight } from 'lucide-react';

export default function ResearchGaps({ gaps }) {
  if (!gaps?.length) return null;

  return (
    <Card className="p-6">
      <SectionHeader
        icon={Lightbulb}
        title="Research Gaps & Opportunities"
        description="Unexplored areas where your project can lead"
        badge={<Badge variant="accent">{gaps.length} Gaps Identified</Badge>}
      />

      <div className="space-y-3">
        {gaps.map((item, i) => (
          <FadeIn key={i} delay={i * 0.08}>
            <div className="rounded-xl border border-[#E2E8F0] hover:border-[#BFDBFE] hover:shadow-sm transition-all p-5 group">
              <div className="flex items-start gap-4">
                {/* Index */}
                <div className="w-8 h-8 rounded-lg bg-[#0F172A] flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-white">{String(i + 1).padStart(2, '0')}</span>
                </div>

                <div className="flex-1 min-w-0 space-y-3">
                  {/* Gap */}
                  <div>
                    <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Gap</p>
                    <p className="text-sm font-medium text-[#0F172A]">{item.gap}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Opportunity */}
                    <div className="rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] p-3">
                      <p className="text-xs font-semibold text-[#16A34A] mb-1">Opportunity</p>
                      <p className="text-xs text-[#166534] leading-relaxed">{item.opportunity}</p>
                    </div>

                    {/* Innovation */}
                    <div className="rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] p-3">
                      <p className="text-xs font-semibold text-[#2563EB] mb-1">Potential Innovation</p>
                      <p className="text-xs text-[#1E40AF] leading-relaxed">{item.potentialInnovation}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </Card>
  );
}
