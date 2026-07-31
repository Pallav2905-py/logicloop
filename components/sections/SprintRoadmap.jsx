'use client';

import { Card, SectionHeader, FadeIn, Badge } from '@/components/ui';
import { Calendar, CheckCircle2 } from 'lucide-react';

const WEEK_CONFIG = [
  { key: 'week1', accent: 'bg-[#EFF6FF] border-[#BFDBFE]', dot: 'bg-[#2563EB]', badge: 'accent', label: 'Week 1' },
  { key: 'week2', accent: 'bg-[#F0FDF4] border-[#BBF7D0]', dot: 'bg-[#22C55E]', badge: 'success', label: 'Week 2' },
  { key: 'week3', accent: 'bg-[#FFFBEB] border-[#FDE68A]', dot: 'bg-[#F59E0B]', badge: 'warning', label: 'Week 3' },
  { key: 'week4', accent: 'bg-[#FDF2F8] border-[#F9A8D4]', dot: 'bg-[#EC4899]', badge: 'purple', label: 'Week 4' },
];

export default function SprintRoadmap({ roadmap }) {
  if (!roadmap) return null;

  return (
    <Card className="p-6">
      <SectionHeader
        icon={Calendar}
        title="Sprint Roadmap"
        description="4-week implementation plan to take your project from idea to launch"
      />

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-[#E2E8F0] hidden sm:block" />

        <div className="space-y-4">
          {WEEK_CONFIG.map(({ key, accent, dot, badge, label }, idx) => {
            const week = roadmap[key];
            if (!week) return null;
            return (
              <FadeIn key={key} delay={idx * 0.1}>
                <div className="flex items-start gap-4">
                  {/* Dot */}
                  <div className={`w-10 h-10 rounded-full ${dot} flex-shrink-0 flex items-center justify-center z-10 hidden sm:flex`}>
                    <span className="text-white text-xs font-bold">{idx + 1}</span>
                  </div>

                  {/* Card */}
                  <div className={`flex-1 rounded-xl border ${accent} p-4`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={badge}>{label}</Badge>
                        <span className="text-sm font-semibold text-[#0F172A]">{week.title}</span>
                      </div>
                      <span className="text-xs text-[#94A3B8]">{(week.tasks || []).length} tasks</span>
                    </div>
                    <ul className="space-y-1.5">
                      {(week.tasks || []).map((task, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#475569]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#94A3B8] flex-shrink-0 mt-0.5" />
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
