'use client';

import { Card, SectionHeader, FadeIn } from '@/components/ui';
import { Plug, ExternalLink } from 'lucide-react';

export default function UsefulAPIs({ apis }) {
  if (!apis?.length) return null;

  return (
    <Card className="p-6">
      <SectionHeader
        icon={Plug}
        title="Useful APIs"
        description="Third-party APIs and services to accelerate development"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {apis.map((api, i) => (
          <FadeIn key={i} delay={i * 0.07}>
            <div className="flex items-start gap-3 rounded-xl border border-[#E2E8F0] hover:border-[#BFDBFE] hover:bg-[#F8FAFC] transition-all p-4 group">
              <div className="w-9 h-9 rounded-lg bg-[#F1F5F9] flex items-center justify-center flex-shrink-0">
                <Plug className="w-4 h-4 text-[#475569]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-[#0F172A]">{api.name}</p>
                  <a
                    href={api.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#2563EB] hover:text-[#1D4ED8] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">{api.description}</p>
                <a
                  href={api.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#2563EB] hover:underline mt-1.5 inline-block truncate max-w-full"
                >
                  {api.website}
                </a>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </Card>
  );
}
