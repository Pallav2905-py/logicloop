'use client';

import { useEffect, useRef, useState } from 'react';

export default function MermaidDiagram({ chart }) {
  const ref = useRef(null);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !chart || !ref.current) return;

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
            secondaryColor: '#F1F5F9',
            tertiaryColor: '#F8FAFC',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '13px',
          },
        });

        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(id, chart.trim());

        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
        }
      } catch (e) {
        if (!cancelled) {
          setError(`Diagram render failed: ${e.message}`);
        }
      }
    };

    render();
    return () => { cancelled = true; };
  }, [mounted, chart]);

  if (!mounted) return null;

  if (error) {
    return (
      <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl">
        <p className="text-xs text-[#DC2626] font-medium mb-2">Architecture diagram could not be rendered.</p>
        <pre className="text-[10px] text-[#475569] overflow-x-auto whitespace-pre-wrap">{chart}</pre>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-4 overflow-x-auto">
      <div ref={ref} className="mermaid-container min-h-[200px] flex items-center justify-center">
        <div className="text-xs text-[#94A3B8] animate-pulse">Rendering diagram...</div>
      </div>
    </div>
  );
}
