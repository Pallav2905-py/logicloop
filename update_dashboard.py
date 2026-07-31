import os

content = """'use client';

import { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  Activity,
  Cpu,
  DollarSign,
  BookOpen,
  Building2,
  Users,
  Target,
  LineChart as LineChartIcon,
  Crosshair,
  ShieldAlert,
  List,
  Compass,
  AlertTriangle,
  Lightbulb,
  Award
} from 'lucide-react';
import { Card, Badge, FadeIn } from '@/components/ui';
import { calculateDecisionAnalytics } from '@/lib/decisionEngine';

function ExecutiveHeader({ icon: Icon, title, subtitle, badge }) {
  return (
    <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#E2E8F0]">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-[#0F172A] text-white flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <div>
          <h3 className="text-base font-bold text-[#0F172A] tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-[#94A3B8] mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {badge && <Badge variant="accent">{badge}</Badge>}
    </div>
  );
}

export default function DecisionIntelligenceDashboard({ project }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const analytics = calculateDecisionAnalytics(project);

  if (!analytics) return null;

  const {
    executiveSummary,
    kpis,
    priorityMatrix,
    evidenceReliability,
    costOptimization,
    moscow,
    technicalDebt,
    roadmapConfidence,
    decisionTree,
    investmentMatrix,
    swot,
    kpiProjection,
    topImprovements,
    innovationBenchmark,
    overallRecommendation
  } = analytics;

  return (
    <div className="space-y-8 pb-12">
      {/* Executive Summary & Header */}
      <Card className="p-6 bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="flex-1 space-y-4">
            <div>
              <Badge className="bg-[#2563EB] text-white border-none mb-2">Executive AI Summary</Badge>
              <h2 className="text-2xl font-bold tracking-tight">Strategic Due Diligence</h2>
            </div>
            <p className="text-sm text-[#CBD5E1] leading-relaxed max-w-3xl">
              {executiveSummary.text}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/10">
              <div>
                <p className="text-[10px] text-[#94A3B8] uppercase">Est. Time to MVP</p>
                <p className="font-bold">{executiveSummary.timeToMvp}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#94A3B8] uppercase">Biggest Innovation</p>
                <p className="font-bold text-xs mt-1">{executiveSummary.biggestInnovation}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#94A3B8] uppercase">Primary Challenge</p>
                <p className="font-bold text-xs mt-1">{executiveSummary.biggestChallenge}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#94A3B8] uppercase">Overall Risk</p>
                <p className="font-bold">{executiveSummary.overallRisk}</p>
              </div>
            </div>
          </div>
          <div className="w-full md:w-64 flex-shrink-0 bg-white/5 rounded-xl p-4 border border-white/10 flex flex-col justify-center text-center">
            <p className="text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider mb-2">Build Recommendation</p>
            <div className={`text-xl font-black mb-2 ${overallRecommendation === 'BUILD' ? 'text-[#22C55E]' : 'text-[#F59E0B]'}`}>
              {overallRecommendation}
            </div>
            <p className="text-[11px] text-[#CBD5E1]">{executiveSummary.verdictReason}</p>
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => (
          <FadeIn key={kpi.id} delay={i * 0.05}>
            <Card className="p-4 hover:border-[#BFDBFE] transition-colors">
              <p className="text-[10px] font-bold text-[#475569] uppercase truncate mb-1">{kpi.label}</p>
              <p className="text-2xl font-black text-[#0F172A]">{kpi.value}</p>
              <p className="text-[10px] text-[#16A34A] mt-1 font-bold">{kpi.trend}</p>
              <p className="text-[10px] text-[#94A3B8] mt-2 line-clamp-2">{kpi.explanation}</p>
            </Card>
          </FadeIn>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Execution Priority Matrix (Impact x Effort) */}
        <Card className="p-6">
          <ExecutiveHeader icon={Crosshair} title="Execution Priority Matrix" subtitle="Impact vs Effort quadrant analysis" />
          {isMounted && (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis type="number" dataKey="effort" name="Effort" tick={{fontSize: 10}} domain={[0, 100]} label={{ value: 'Effort (Complexity)', position: 'insideBottom', offset: -10, fontSize: 10 }} />
                  <YAxis type="number" dataKey="impact" name="Impact" tick={{fontSize: 10}} domain={[0, 100]} label={{ value: 'Business Impact', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                  <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{fontSize: '12px'}} />
                  <Scatter name="Tasks" data={priorityMatrix} fill="#2563EB">
                    {priorityMatrix.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.impact > 50 && entry.effort < 50 ? '#16A34A' : '#2563EB'} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* AI Evidence & Reliability */}
        <Card className="p-6">
          <ExecutiveHeader icon={ShieldAlert} title="Evidence Reliability" subtitle="Data sources and confidence scoring" />
          <div className="flex items-center justify-between mb-4 p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
            <div>
              <p className="text-xs font-bold text-[#475569]">Overall AI Confidence</p>
              <p className="text-2xl font-black text-[#0F172A]">{evidenceReliability.overallScore}%</p>
            </div>
            <Badge variant="accent">Highly Reliable</Badge>
          </div>
          <div className="space-y-2">
            {evidenceReliability.sources.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-[#E2E8F0] rounded-lg">
                <div>
                  <p className="text-sm font-bold text-[#0F172A]">{s.name}</p>
                  <p className="text-xs text-[#94A3B8]">{s.dataPoints} Data Points analyzed</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-[#16A34A]">{s.reliability}% Reliable</p>
                  <p className="text-[10px] text-[#475569]">{s.status}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* MVP MoSCoW Prioritization */}
        <Card className="p-6">
          <ExecutiveHeader icon={List} title="MVP Feature Prioritization" subtitle="MoSCoW Method Framework" />
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-[#F0FDF4] rounded-xl border border-[#BBF7D0]">
              <p className="text-xs font-bold text-[#16A34A] mb-2 uppercase">Must Have (MVP)</p>
              <ul className="space-y-1 text-sm text-[#0F172A] font-medium">
                {moscow.mustHave.map((item, i) => <li key={i}>• {item}</li>)}
              </ul>
            </div>
            <div className="p-4 bg-[#EFF6FF] rounded-xl border border-[#BFDBFE]">
              <p className="text-xs font-bold text-[#2563EB] mb-2 uppercase">Should Have</p>
              <ul className="space-y-1 text-sm text-[#0F172A]">
                {moscow.shouldHave.map((item, i) => <li key={i}>• {item}</li>)}
              </ul>
            </div>
            <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <p className="text-xs font-bold text-[#475569] mb-2 uppercase">Could Have</p>
              <ul className="space-y-1 text-sm text-[#475569]">
                {moscow.couldHave.map((item, i) => <li key={i}>• {item}</li>)}
              </ul>
            </div>
            <div className="p-4 bg-[#FEF2F2] rounded-xl border border-[#FECACA]">
              <p className="text-xs font-bold text-[#DC2626] mb-2 uppercase">Won't Have</p>
              <ul className="space-y-1 text-sm text-[#475569]">
                {moscow.wontHave.map((item, i) => <li key={i}>• {item}</li>)}
              </ul>
            </div>
          </div>
        </Card>

        {/* Cost Optimization */}
        <Card className="p-6">
          <ExecutiveHeader icon={DollarSign} title="Cost Optimization Suggestions" subtitle="Infrastructure & Service Migrations" />
          <div className="space-y-3">
            {costOptimization.map((opt, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                <div>
                  <p className="text-[10px] font-bold text-[#94A3B8] uppercase">{opt.service}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-medium text-[#475569] line-through">{opt.current}</span>
                    <span className="text-xs text-[#94A3B8]">→</span>
                    <span className="text-sm font-bold text-[#0F172A]">{opt.migration}</span>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]">Save {opt.savings}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Technical Debt */}
        <Card className="p-6 xl:col-span-1">
          <ExecutiveHeader icon={AlertTriangle} title="Technical Debt" subtitle="Predicted post-launch liabilities" />
          <div className="space-y-4">
            {technicalDebt.map((debt, i) => (
              <div key={i} className="p-3 border-l-2 border-[#F59E0B] bg-[#FFFBEB] rounded-r-lg">
                <p className="text-xs font-bold text-[#0F172A]">{debt.component}</p>
                <p className="text-[10px] text-[#D97706] mb-1">Risk: {debt.risk}</p>
                <p className="text-xs text-[#475569]">{debt.remediation}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Roadmap Confidence */}
        <Card className="p-6 xl:col-span-1">
          <ExecutiveHeader icon={Compass} title="Roadmap Confidence" subtitle="Execution predictability" />
          <div className="space-y-4">
            {roadmapConfidence.map((phase, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-bold text-[#0F172A]">{phase.phase}</span>
                  <span className="text-[#94A3B8]">{phase.timeline}</span>
                </div>
                <div className="w-full bg-[#E2E8F0] rounded-full h-2">
                  <div className="bg-[#2563EB] h-2 rounded-full" style={{ width: `${phase.confidence}%` }}></div>
                </div>
                <p className="text-[10px] text-right text-[#2563EB] font-bold mt-1">{phase.confidence}% Confidence</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Decision Tree Logic */}
        <Card className="p-6 xl:col-span-1">
          <ExecutiveHeader icon={Target} title="Decision Tree Logic" subtitle="Strategic 'If-Then' scenarios" />
          <div className="space-y-3">
            {decisionTree.map((node, i) => (
              <div key={i} className="p-3 border border-[#E2E8F0] rounded-xl bg-[#F8FAFC]">
                <p className="text-[10px] font-bold text-[#475569] uppercase mb-1">Condition</p>
                <p className="text-sm font-medium text-[#0F172A]">{node.condition}</p>
                <div className="mt-2 pt-2 border-t border-[#E2E8F0]">
                  <p className="text-[10px] font-bold text-[#2563EB] uppercase mb-1">Action</p>
                  <p className="text-xs text-[#2563EB] font-bold">→ {node.action}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* KPI Trend Projection */}
        <Card className="p-6">
          <ExecutiveHeader icon={LineChartIcon} title="KPI Trend Projection" subtitle="6-Month Growth & Revenue Forecast" />
          {isMounted && (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={kpiProjection} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{fontSize: 10}} />
                  <YAxis tick={{fontSize: 10}} />
                  <Tooltip contentStyle={{fontSize: '12px'}} />
                  <Legend wrapperStyle={{fontSize: '11px'}} />
                  <Line type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#16A34A" strokeWidth={3} />
                  <Line type="monotone" dataKey="users" name="Users" stroke="#2563EB" strokeWidth={2} />
                  <Line type="monotone" dataKey="costs" name="Costs ($)" stroke="#DC2626" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* AI SWOT Visualization */}
        <Card className="p-6">
          <ExecutiveHeader icon={Activity} title="AI SWOT Analysis" subtitle="Strategic strengths and threats" />
          <div className="grid grid-cols-2 gap-4 h-[250px]">
            <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl flex flex-col">
              <p className="text-sm font-black text-[#16A34A] mb-2 uppercase tracking-wide">Strengths</p>
              <ul className="text-xs text-[#0F172A] space-y-1 flex-1 overflow-y-auto">
                {swot.strengths.map((s, i) => <li key={i}>• {s}</li>)}
              </ul>
            </div>
            <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl flex flex-col">
              <p className="text-sm font-black text-[#DC2626] mb-2 uppercase tracking-wide">Weaknesses</p>
              <ul className="text-xs text-[#0F172A] space-y-1 flex-1 overflow-y-auto">
                {swot.weaknesses.map((s, i) => <li key={i}>• {s}</li>)}
              </ul>
            </div>
            <div className="p-4 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl flex flex-col">
              <p className="text-sm font-black text-[#2563EB] mb-2 uppercase tracking-wide">Opportunities</p>
              <ul className="text-xs text-[#0F172A] space-y-1 flex-1 overflow-y-auto">
                {swot.opportunities.map((s, i) => <li key={i}>• {s}</li>)}
              </ul>
            </div>
            <div className="p-4 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl flex flex-col">
              <p className="text-sm font-black text-[#D97706] mb-2 uppercase tracking-wide">Threats</p>
              <ul className="text-xs text-[#0F172A] space-y-1 flex-1 overflow-y-auto">
                {swot.threats.map((s, i) => <li key={i}>• {s}</li>)}
              </ul>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top 10 AI Improvements */}
        <Card className="p-6">
          <ExecutiveHeader icon={Lightbulb} title="Top 10 AI Improvement Suggestions" subtitle="Immediate optimization targets" />
          <div className="space-y-2 h-64 overflow-y-auto pr-2">
            {topImprovements.map((imp, i) => (
              <div key={i} className="flex gap-3 items-start p-2 hover:bg-[#F8FAFC] rounded-lg transition-colors">
                <span className="w-5 h-5 rounded bg-[#E2E8F0] text-[#475569] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-xs text-[#0F172A] font-medium leading-relaxed">{imp}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Innovation Benchmark */}
        <Card className="p-6">
          <ExecutiveHeader icon={Award} title="Innovation Benchmark" subtitle="Comparison vs. Industry Average" />
          {isMounted && (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={innovationBenchmark} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{fontSize: 10}} />
                  <YAxis type="category" dataKey="category" tick={{fontSize: 10, fontWeight: 600}} width={120} />
                  <Tooltip contentStyle={{fontSize: '12px'}} />
                  <Legend wrapperStyle={{fontSize: '11px'}} />
                  <Bar dataKey="project" name="This Project" fill="#2563EB" radius={[0, 4, 4, 0]} barSize={12} />
                  <Bar dataKey="industryAverage" name="Industry Avg" fill="#CBD5E1" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

    </div>
  );
}
"""

with open('components/sections/DecisionIntelligenceDashboard.jsx', 'w') as f:
    f.write(content)
print("Updated components/sections/DecisionIntelligenceDashboard.jsx")
