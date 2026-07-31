'use client';

import { useEffect, useRef } from 'react';
import { Card, SectionHeader, Skeleton } from '@/components/ui';
import { Network } from 'lucide-react';

export default function ArchitectureDiagram({ architecture }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!architecture || !ref.current) return;

    let cancelled = false;

    const render = async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'base',
          themeVariables: {
            primaryColor: '#EFF6FF',
            primaryTextColor: '#0F172A',
            primaryBorderColor: '#BFDBFE',
            lineColor: '#94A3B8',
            secondaryColor: '#F8FAFC',
            tertiaryColor: '#F1F5F9',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '14px',
          },
          flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'basis' },
        });

        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(id, architecture);

        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
          // Make responsive
          const svgEl = ref.current.querySelector('svg');
          if (svgEl) {
            svgEl.removeAttribute('width');
            svgEl.removeAttribute('height');
            svgEl.style.maxWidth = '100%';
            svgEl.style.height = 'auto';
          }
        }
      } catch (err) {
        if (!cancelled && ref.current) {
          ref.current.innerHTML = `
            <div class="flex flex-col items-center justify-center py-10 text-[#94A3B8]">
              <p class="text-sm">Could not render diagram</p>
              <pre class="mt-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 text-left overflow-auto max-w-full whitespace-pre-wrap">${architecture}</pre>
            </div>`;
        }
      }
    };

    render();
    return () => { cancelled = true; };
  }, [architecture]);

  return (
    <Card className="p-6">
      <SectionHeader
        icon={Network}
        title="Architecture Diagram"
        description="Auto-generated system architecture using Mermaid.js"
      />
      {!architecture ? (
        <div className="space-y-3">
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <div
          ref={ref}
          className="mermaid-container min-h-[200px] flex items-center justify-center overflow-auto rounded-lg bg-[#FAFAFA] border border-[#E2E8F0] p-4"
        />
      )}
    </Card>
  );
}
