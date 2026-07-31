'use client';

import { Card, SectionHeader, FadeIn } from '@/components/ui';
import { Star, ExternalLink, GitBranch } from 'lucide-react';

function GithubIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export default function GitHubRepos({ github }) {
  if (!github?.length) return null;

  return (
    <Card className="p-6">
      <SectionHeader
        icon={GitBranch}
        title="GitHub Repositories"
        description="Relevant open-source projects to learn from and contribute to"
      />

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E2E8F0]">
              <th className="text-left py-3 px-2 text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Repository</th>
              <th className="text-left py-3 px-2 text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Description</th>
              <th className="text-right py-3 px-2 text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Stars</th>
              <th className="text-right py-3 px-2 text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {github.map((repo, i) => (
              <FadeIn
                key={i}
                delay={i * 0.06}
                as="tr"
                className="hover:bg-[#F8FAFC] transition-colors group"
              >
                <td className="py-3.5 px-2">
                  <div className="flex items-center gap-2">
                    <GithubIcon className="w-4 h-4 text-[#94A3B8] flex-shrink-0" />
                    <span className="font-medium text-[#0F172A]">{repo.name}</span>
                  </div>
                </td>
                <td className="py-3.5 px-2 text-[#475569] max-w-xs">
                  <span className="line-clamp-2">{repo.description}</span>
                </td>
                <td className="py-3.5 px-2 text-right">
                  <div className="flex items-center justify-end gap-1 text-[#F59E0B]">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="font-medium text-[#475569]">{repo.stars}</span>
                  </div>
                </td>
                <td className="py-3.5 px-2 text-right">
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#2563EB] hover:text-[#1D4ED8] font-medium text-xs"
                  >
                    View <ExternalLink className="w-3 h-3" />
                  </a>
                </td>
              </FadeIn>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
