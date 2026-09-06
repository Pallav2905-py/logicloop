'use client';

import { Card, SectionHeader, FadeIn, Badge } from '@/components/ui';
import { TrendingUp, Users, Briefcase, CheckCircle } from 'lucide-react';

export default function IdeaValidation({ validation }) {
  if (!validation) return null;

  return (
    <Card className="p-6">
      <SectionHeader
        icon={CheckCircle}
        title="Idea Validation"
        description="AI-powered assessment of your project's viability"
      />

      <div className="space-y-5">
        {/* Summary */}
        <FadeIn delay={0.05}>
          <p className="text-[#1E293B] leading-relaxed text-sm">{validation.summary}</p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Why it matters */}
          <FadeIn delay={0.1}>
            <div className="rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-[#2563EB]" />
                <span className="text-xs font-semibold text-[#2563EB] uppercase tracking-wider">Why It Matters</span>
              </div>
              <p className="text-sm text-[#1E293B] leading-relaxed">{validation.whyItMatters}</p>
            </div>
          </FadeIn>

          {/* Potential Users */}
          <FadeIn delay={0.15}>
            <div className="rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-[#16A34A]" />
                <span className="text-xs font-semibold text-[#16A34A] uppercase tracking-wider">Target Users</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(validation.potentialUsers || []).map((user, i) => (
                  <Badge key={i} variant="success">{user}</Badge>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Business Value */}
          <FadeIn delay={0.2}>
            <div className="rounded-xl bg-[#FFFBEB] border border-[#FDE68A] p-4">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-4 h-4 text-[#D97706]" />
                <span className="text-xs font-semibold text-[#D97706] uppercase tracking-wider">Business Value</span>
              </div>
              <p className="text-sm text-[#1E293B] leading-relaxed">{validation.businessValue}</p>
            </div>
          </FadeIn>
        </div>
      </div>
    </Card>
  );
}
