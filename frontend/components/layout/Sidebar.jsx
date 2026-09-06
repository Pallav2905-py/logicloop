'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderOpen,
  Clock,
  Settings,
  Zap,
  Plus,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: FolderOpen },
  { href: '/projects', label: 'History', icon: Clock },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ projectTitle }) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-60 h-screen bg-white border-r border-[#E2E8F0] fixed left-0 top-0 z-20">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[#E2E8F0]">
        <div className="w-7 h-7 bg-[#0F172A] rounded-lg flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-[#0F172A] text-base tracking-tight">IntelliGrade AI</span>
      </div>

      {/* New Project CTA */}
      <div className="px-4 pt-4 pb-2">
        <Link
          href="/"
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-[#0F172A] text-white text-sm font-medium hover:bg-[#1E293B] transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Project
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-2 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-[#EFF6FF] text-[#2563EB]'
                  : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Active project */}
      {projectTitle && (
        <div className="px-4 pb-4 pt-2 border-t border-[#E2E8F0]">
          <p className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-2">Current Project</p>
          <p className="text-sm font-medium text-[#0F172A] truncate">{projectTitle}</p>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-4 border-t border-[#E2E8F0]">
        <p className="text-xs text-[#94A3B8]">© 2025 IntelliGrade AI</p>
      </div>
    </aside>
  );
}
