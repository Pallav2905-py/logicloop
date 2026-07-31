'use client';

import { Card, SectionHeader, FadeIn, Badge } from '@/components/ui';
import { Layers } from 'lucide-react';

const CATEGORIES = [
  { key: 'frontend', label: 'Frontend', color: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]' },
  { key: 'backend', label: 'Backend', color: 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]' },
  { key: 'database', label: 'Database', color: 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]' },
  { key: 'authentication', label: 'Authentication', color: 'bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]' },
  { key: 'deployment', label: 'Deployment', color: 'bg-[#FFF7ED] text-[#EA580C] border-[#FED7AA]' },
  { key: 'cloud', label: 'Cloud', color: 'bg-[#F0F9FF] text-[#0284C7] border-[#BAE6FD]' },
  { key: 'ai', label: 'AI / ML', color: 'bg-[#FDF4FF] text-[#C026D3] border-[#F0ABFC]' },
];

function TechChip({ label, colorClass }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
      {label}
    </span>
  );
}

export default function TechStack({ techStack }) {
  if (!techStack) return null;

  return (
    <Card className="p-6">
      <SectionHeader
        icon={Layers}
        title="Recommended Tech Stack"
        description="Curated technology choices for each layer of your system"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {CATEGORIES.map(({ key, label, color }, i) => {
          const items = techStack[key] || [];
          if (!items.length) return null;
          return (
            <FadeIn key={key} delay={i * 0.06}>
              <div className="rounded-xl border border-[#E2E8F0] p-4 h-full">
                <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">{label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((tech, j) => (
                    <TechChip key={j} label={tech} colorClass={color} />
                  ))}
                </div>
              </div>
            </FadeIn>
          );
        })}
      </div>
    </Card>
  );
}
