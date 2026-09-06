'use client';

import { Card, SectionHeader, FadeIn } from '@/components/ui';
import { Database, ExternalLink } from 'lucide-react';

export default function Datasets({ datasets }) {
  if (!datasets?.length) return null;

  return (
    <Card className="p-6">
      <SectionHeader
        icon={Database}
        title="Datasets"
        description="Publicly available datasets to train, test, and validate your models"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {datasets.map((ds, i) => (
          <FadeIn key={i} delay={i * 0.08}>
            <div className="rounded-xl border border-[#E2E8F0] hover:border-[#BFDBFE] hover:shadow-sm transition-all p-4 flex flex-col gap-2 h-full group">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#FFF7ED] border border-[#FED7AA] flex items-center justify-center flex-shrink-0">
                    <Database className="w-3.5 h-3.5 text-[#EA580C]" />
                  </div>
                  <p className="text-sm font-semibold text-[#0F172A] leading-tight">{ds.name}</p>
                </div>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed flex-1">{ds.description}</p>
              <a
                href={ds.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#2563EB] hover:text-[#1D4ED8] font-medium mt-auto"
              >
                View Dataset <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </FadeIn>
        ))}
      </div>
    </Card>
  );
}
