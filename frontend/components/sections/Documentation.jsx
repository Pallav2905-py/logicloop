'use client';

import { useState } from 'react';
import { Card, SectionHeader, FadeIn, Button } from '@/components/ui';
import { FileText, FolderTree, Code2, Telescope, Download } from 'lucide-react';

const TABS = [
  { key: 'readme', label: 'README', icon: FileText },
  { key: 'folderStructure', label: 'Folder Structure', icon: FolderTree },
  { key: 'apiDocs', label: 'API Docs', icon: Code2 },
  { key: 'futureScope', label: 'Future Scope', icon: Telescope },
];

function MarkdownBlock({ content }) {
  if (!content) return <p className="text-sm text-[#94A3B8]">No content available.</p>;

  // Simple markdown-to-HTML for display (headers, bold, code blocks)
  const lines = content.split('\n');
  return (
    <div className="text-sm leading-relaxed text-[#1E293B] space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith('### '))
          return <h3 key={i} className="text-base font-semibold text-[#0F172A] mt-4 mb-1">{line.slice(4)}</h3>;
        if (line.startsWith('## '))
          return <h2 key={i} className="text-lg font-bold text-[#0F172A] mt-5 mb-1">{line.slice(3)}</h2>;
        if (line.startsWith('# '))
          return <h1 key={i} className="text-xl font-bold text-[#0F172A] mt-4 mb-2">{line.slice(2)}</h1>;
        if (line.startsWith('```'))
          return <div key={i} className="h-px" />;
        if (line.startsWith('- '))
          return <p key={i} className="flex gap-2"><span className="text-[#94A3B8]">•</span><span>{line.slice(2)}</span></p>;
        if (line.trim() === '')
          return <div key={i} className="h-2" />;
        return <p key={i}>{line}</p>;
      })}
    </div>
  );
}

export default function Documentation({ documentation, projectTitle }) {
  const [activeTab, setActiveTab] = useState('readme');

  if (!documentation) return null;

  const handleExport = () => {
    const content = Object.entries(documentation)
      .map(([k, v]) => `# ${k.toUpperCase()}\n\n${v}`)
      .join('\n\n---\n\n');

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(projectTitle || 'project').toLowerCase().replace(/\s+/g, '-')}-docs.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-6">
      <SectionHeader
        icon={FileText}
        title="Documentation"
        description="Auto-generated project documentation ready to use"
        badge={
          <Button variant="secondary" size="sm" onClick={handleExport}>
            <Download className="w-3.5 h-3.5" />
            Export
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#E2E8F0] mb-5">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === key
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-[#94A3B8] hover:text-[#475569] hover:border-[#CBD5E1]'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <FadeIn key={activeTab} delay={0}>
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 min-h-[300px] max-h-[500px] overflow-y-auto">
          {activeTab === 'folderStructure' ? (
            <pre className="text-xs text-[#1E293B] leading-6 font-mono whitespace-pre-wrap">
              {documentation.folderStructure}
            </pre>
          ) : (
            <MarkdownBlock content={documentation[activeTab]} />
          )}
        </div>
      </FadeIn>
    </Card>
  );
}
