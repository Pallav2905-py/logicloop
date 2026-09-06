'use client';

import { Search, Bell, User } from 'lucide-react';

export default function Topbar({ projectTitle }) {
  return (
    <header className="h-14 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-6 sticky top-0 z-10">
      {/* Left: project title */}
      <div className="flex items-center gap-2 min-w-0">
        {projectTitle ? (
          <>
            <span className="text-[#94A3B8] text-sm">Projects</span>
            <span className="text-[#CBD5E1] text-sm">/</span>
            <span className="text-sm font-semibold text-[#0F172A] truncate max-w-xs">{projectTitle}</span>
          </>
        ) : (
          <span className="text-sm font-semibold text-[#0F172A]">Dashboard</span>
        )}
      </div>

      {/* Right: search + actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search projects..."
            className="pl-9 pr-3 py-1.5 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg w-52 text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
          />
        </div>

        {/* Notification */}
        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#475569] transition-colors">
          <Bell className="w-4 h-4" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-[#0F172A] flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
      </div>
    </header>
  );
}
