'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { Card, SectionHeader, FadeIn, Button, Badge } from '@/components/ui';
import { Settings as SettingsIcon, Key, Database, Cpu, Check, ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="lg:pl-60">
        <Topbar />
        <main className="p-6 max-w-4xl mx-auto pb-16 space-y-6">
          <FadeIn delay={0}>
            <div className="mb-2">
              <h1 className="text-2xl font-bold text-[#0F172A]">Settings & Configuration</h1>
              <p className="text-sm text-[#94A3B8] mt-1">
                Manage your API credentials, database preferences, and AI engine settings.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.05}>
            <Card className="p-6">
              <SectionHeader
                icon={Key}
                title="AI Model Configuration"
                description="Configure your Gemini API settings"
                badge={<Badge variant="success">Active</Badge>}
              />

              <form onSubmit={handleSave} className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-2">
                    Gemini API Key
                  </label>
                  <input
                    type="password"
                    defaultValue="••••••••••••••••••••••••••••"
                    className="w-full px-4 py-2.5 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                  <p className="text-xs text-[#94A3B8] mt-1.5">
                    Your key is securely read from <code className="bg-[#F1F5F9] px-1.5 py-0.5 rounded text-[#0F172A]">.env.local</code>.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-2">
                    AI Engine Model
                  </label>
                  <select
                    defaultValue="gemini-2.0-flash"
                    className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  >
                    <option value="gemini-2.0-flash">Gemini 2.0 Flash (Recommended - Ultra Fast)</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Analysis)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <Button type="submit" variant="primary" size="md">
                    {saved ? (
                      <>
                        <Check className="w-4 h-4 text-[#22C55E]" /> Saved Successfully
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </FadeIn>

          <FadeIn delay={0.1}>
            <Card className="p-6">
              <SectionHeader
                icon={Database}
                title="Database Status"
                description="MongoDB Atlas connection status and data persistence"
              />

              <div className="space-y-4 max-w-xl">
                <div className="flex items-center justify-between p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-[#2563EB]" />
                    <div>
                      <p className="text-sm font-semibold text-[#0F172A]">MongoDB Connection</p>
                      <p className="text-xs text-[#94A3B8]">Automatic fallback enabled if offline</p>
                    </div>
                  </div>
                  <Badge variant="accent">Connected / Auto-fallback</Badge>
                </div>
              </div>
            </Card>
          </FadeIn>

          <FadeIn delay={0.15}>
            <Card className="p-6">
              <SectionHeader
                icon={ShieldCheck}
                title="Hackathon MVP Credentials"
                description="MaestroMeets system release version"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <span className="text-xs text-[#94A3B8] block mb-1">Version</span>
                  <span className="font-semibold text-[#0F172A]">v1.0.0-hackathon</span>
                </div>
                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <span className="text-xs text-[#94A3B8] block mb-1">Framework</span>
                  <span className="font-semibold text-[#0F172A]">Next.js 16 (App Router)</span>
                </div>
                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <span className="text-xs text-[#94A3B8] block mb-1">Architecture</span>
                  <span className="font-semibold text-[#0F172A]">Structured JSON Copilot</span>
                </div>
              </div>
            </Card>
          </FadeIn>
        </main>
      </div>
    </div>
  );
}
