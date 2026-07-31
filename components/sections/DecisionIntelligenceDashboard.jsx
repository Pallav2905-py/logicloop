'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Zap,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Activity,
  Cpu,
  Layers,
  DollarSign,
  Clock,
  BookOpen,
  Award,
  FileCheck,
  Building2,
  Sparkles,
  ChevronRight,
  PieChart as PieIcon,
  BarChart3,
  ListOrdered,
  Gauge,
  Users,
} from 'lucide-react';
import { Card, Badge, FadeIn } from '@/components/ui';
import { calculateDecisionAnalytics } from '@/lib/decisionEngine';

// ─── Sub-Components ───────────────────────────────────────────────────────────

/** Section Header Component */
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

/** Status Chip Component */
function StatusPill({ level }) {
  const map = {
    High: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]',
    Medium: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
    Low: 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]',
    Optimal: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]',
    Good: 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]',
    Healthy: 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]',
  };
  const cls = map[level] || 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]';
  return (
    <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${cls}`}>
      {level}
    </span>
  );
}

// ─── Main Decision Intelligence Dashboard Component ───────────────────────────

export default function DecisionIntelligenceDashboard({ project }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const analytics = calculateDecisionAnalytics(project);

  if (!analytics) return null;

  const {
    kpis,
    evaluators,
    avgEvalScore,
    evalVariance,
    consensusChartData,
    healthMatrix,
    risks,
    opportunities,
    resources,
    techDistData,
    techStackDetails,
    researchStats,
    investmentMatrix,
    investmentReadiness,
    overallRecommendation,
    decisionLogs,
  } = analytics;

  // Colors for tech pie chart
  const PIE_COLORS = ['#2563EB', '#3B82F6', '#7C3AED', '#16A34A', '#D97706', '#0F172A'];

  return (
    <div className="space-y-8">
      {/* ── Top Executive Banner ── */}
      <Card className="p-6 bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-[#2563EB] text-white rounded">
                Executive Analytics Active
              </span>
              <span className="text-xs text-[#94A3B8]">· IntelliGrade Decision Intelligence Engine</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Executive Decision Intelligence — {project.title || 'Project Analysis'}
            </h2>
            <p className="text-xs text-[#CBD5E1] max-w-3xl leading-relaxed">
              Converting multi-agent research into structured business metrics, risk evaluations, resource projections, and investment recommendations.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#94A3B8]">Final Verdict</p>
              <div className={`text-lg font-black tracking-wide ${
                overallRecommendation === 'BUILD' ? 'text-[#22C55E]' : 'text-[#F59E0B]'
              }`}>
                {overallRecommendation === 'BUILD' ? '✓ RECOMMEND BUILD' : '⚡ PIVOT REQUIRED'}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#2563EB]/20 border border-[#2563EB]/40 flex items-center justify-center">
              <Award className="w-6 h-6 text-[#3B82F6]" />
            </div>
          </div>
        </div>
      </Card>

      {/* ── SECTION 1: Executive KPI Cards ── */}
      <div>
        <ExecutiveHeader
          icon={Activity}
          title="Section 1 — Executive KPI Cards"
          subtitle="9 Core indicators evaluating innovation, risk, readiness, and commercial viability"
          badge="Executive Summary"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-4">
          {kpis.map((kpi, i) => (
            <FadeIn key={kpi.id} delay={i * 0.03}>
              <Card className="p-4 hover:border-[#BFDBFE] transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">{kpi.label}</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    kpi.trendType === 'positive'
                      ? 'bg-[#F0FDF4] text-[#16A34A]'
                      : kpi.trendType === 'warning'
                      ? 'bg-[#FFFBEB] text-[#D97706]'
                      : 'bg-[#FEF2F2] text-[#DC2626]'
                  }`}>
                    {kpi.trend}
                  </span>
                </div>

                <div className="text-2xl font-black text-[#0F172A] tracking-tight my-1">
                  {kpi.value}
                </div>

                <p className="text-xs text-[#94A3B8] leading-normal line-clamp-2">
                  {kpi.explanation}
                </p>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* ── SECTION 2 & SECTION 3 ROW ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* SECTION 2: AI Consensus Analytics */}
        <Card className="p-6">
          <ExecutiveHeader
            icon={Users}
            title="Section 2 — AI Consensus Analytics"
            subtitle="5 Evaluator perspectives, confidence levels, score variance & consensus rating"
          />

          <div className="space-y-4">
            {/* Analytics Overview Chips */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-center">
              <div>
                <p className="text-[10px] text-[#94A3B8] uppercase font-bold">Average Score</p>
                <p className="text-base font-bold text-[#0F172A] mt-0.5">{avgEvalScore}/100</p>
              </div>
              <div>
                <p className="text-[10px] text-[#94A3B8] uppercase font-bold">Variance</p>
                <p className="text-base font-bold text-[#2563EB] mt-0.5">±{evalVariance}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#94A3B8] uppercase font-bold">Consensus Score</p>
                <p className="text-base font-bold text-[#16A34A] mt-0.5">{analytics.kpis[1].value}</p>
              </div>
            </div>

            {/* Radar Chart */}
            {isMounted && (
              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={consensusChartData}>
                    <PolarGrid stroke="#E2E8F0" />
                    <PolarAngleAxis dataKey="evaluator" tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#94A3B8' }} />
                    <Radar name="Score" dataKey="Score" stroke="#2563EB" fill="#2563EB" fillOpacity={0.25} />
                    <Radar name="Confidence" dataKey="Confidence" stroke="#16A34A" fill="#16A34A" fillOpacity={0.15} />
                    <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '8px', fontSize: '12px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Evaluator List Table */}
            <div className="space-y-2 pt-2">
              {evaluators.map((e, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                  <div>
                    <p className="text-xs font-bold text-[#0F172A]">{e.name}</p>
                    <p className="text-[11px] text-[#94A3B8]">{e.role}</p>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <p className="text-[10px] text-[#94A3B8]">Score</p>
                      <p className="text-xs font-bold text-[#2563EB]">{e.score}/100</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#94A3B8]">Confidence</p>
                      <p className="text-xs font-bold text-[#16A34A]">{e.confidence}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* SECTION 3: Project Health */}
        <Card className="p-6">
          <ExecutiveHeader
            icon={Gauge}
            title="Section 3 — Project Health Matrix"
            subtitle="Evaluating 9 architectural & organizational health dimensions"
          />

          <div className="space-y-4">
            {healthMatrix.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#0F172A]">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <StatusPill level={item.status} />
                    <span className="font-bold text-[#475569]">{item.score}%</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-[#2563EB]"
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── SECTION 4: Risk Analytics ── */}
      <Card className="p-6">
        <ExecutiveHeader
          icon={ShieldAlert}
          title="Section 4 — Risk Analytics Matrix"
          subtitle="Comprehensive risk assessment across 7 technical & commercial domains"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {risks.map((r, idx) => (
            <div key={idx} className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[#0F172A]">{r.domain}</p>
                <StatusPill level={r.level} />
              </div>
              <p className="text-xs text-[#475569] leading-relaxed">
                <strong className="text-[#0F172A]">Impact:</strong> {r.impact}
              </p>
              <div className="pt-2 border-t border-[#E2E8F0]">
                <p className="text-[11px] text-[#2563EB] font-medium leading-relaxed">
                  💡 {r.mitigation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── SECTION 5 & SECTION 6 ROW ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* SECTION 5: Opportunity Analysis */}
        <Card className="p-6">
          <ExecutiveHeader
            icon={Sparkles}
            title="Section 5 — Opportunity Analysis"
            subtitle="Strategic quick wins, long-term avenues, and commercial growth opportunities"
          />

          <div className="space-y-3">
            {opportunities.map((opp, idx) => (
              <div key={idx} className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-[#EFF6FF] text-[#2563EB]">
                    {opp.category}
                  </span>
                  <span className="text-[11px] font-medium text-[#94A3B8]">⏱ {opp.timeline}</span>
                </div>
                <p className="text-xs font-bold text-[#0F172A] pt-1">{opp.title}</p>
                <p className="text-xs text-[#475569]">{opp.impact}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* SECTION 6: Resource Analytics */}
        <Card className="p-6">
          <ExecutiveHeader
            icon={DollarSign}
            title="Section 6 — Resource Analytics & Projections"
            subtitle="Estimated development effort, staffing, budget requirements & cloud operational costs"
          />

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl text-center">
              <p className="text-[10px] uppercase font-bold text-[#2563EB]">Est. Dev Hours</p>
              <p className="text-2xl font-black text-[#0F172A] mt-1">{resources.developmentHours} hrs</p>
              <p className="text-[11px] text-[#475569] mt-0.5">~{resources.timeToMvpWeeks} weeks sprint</p>
            </div>

            <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl text-center">
              <p className="text-[10px] uppercase font-bold text-[#16A34A]">Required Team</p>
              <p className="text-2xl font-black text-[#0F172A] mt-1">{resources.requiredEngineers} Engineers</p>
              <p className="text-[11px] text-[#475569] mt-0.5">Full-stack + AI Devs</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs">
              <span className="font-semibold text-[#0F172A]">Estimated MVP Budget</span>
              <span className="font-bold text-[#0F172A]">${resources.estimatedBudget.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs">
              <span className="font-semibold text-[#0F172A]">Est. Cloud Infra (Monthly)</span>
              <span className="font-bold text-[#2563EB]">${resources.cloudCostMonthly}/mo</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs">
              <span className="font-semibold text-[#0F172A]">Est. Maintenance & API Costs</span>
              <span className="font-bold text-[#475569]">${resources.maintenanceCostMonthly}/mo</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs">
              <span className="font-semibold text-[#0F172A]">Time to Production Readiness</span>
              <span className="font-bold text-[#16A34A]">{resources.timeToProductionWeeks} Weeks</span>
            </div>
          </div>
        </Card>
      </div>

      {/* ── SECTION 7: Technology Analytics ── */}
      <Card className="p-6">
        <ExecutiveHeader
          icon={Cpu}
          title="Section 7 — Technology Analytics & Stack Architecture"
          subtitle="Technology distribution breakdown, stack recommendation confidence & proposed alternatives"
        />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Pie Chart */}
          <div className="xl:col-span-1 flex flex-col items-center justify-center p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
            <p className="text-xs font-bold text-[#0F172A] mb-2">Stack Composition</p>
            {isMounted && (
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={techDistData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                      {techDistData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Details Table */}
          <div className="xl:col-span-2 space-y-2">
            {techStackDetails.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs">
                <div>
                  <p className="font-bold text-[#0F172A]">{item.category}</p>
                  <p className="text-[#2563EB] font-medium mt-0.5">{item.primary}</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F0FDF4] text-[#16A34A]">
                    {item.confidence}% Match
                  </span>
                  <p className="text-[11px] text-[#94A3B8] mt-1">Alt: {item.alt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* ── SECTION 8: Research Analytics ── */}
      <Card className="p-6">
        <ExecutiveHeader
          icon={BookOpen}
          title="Section 8 — Research Analytics & Empirical Evidence"
          subtitle="Quantifying research evidence coverage across repos, datasets, APIs, and literature gaps"
        />

        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3 text-center">
          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
            <p className="text-[10px] uppercase font-bold text-[#94A3B8]">GitHub Repos</p>
            <p className="text-xl font-bold text-[#0F172A] mt-1">{researchStats.githubRepos}</p>
          </div>
          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
            <p className="text-[10px] uppercase font-bold text-[#94A3B8]">Datasets</p>
            <p className="text-xl font-bold text-[#2563EB] mt-1">{researchStats.datasets}</p>
          </div>
          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
            <p className="text-[10px] uppercase font-bold text-[#94A3B8]">APIs</p>
            <p className="text-xl font-bold text-[#7C3AED] mt-1">{researchStats.apis}</p>
          </div>
          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
            <p className="text-[10px] uppercase font-bold text-[#94A3B8]">Competitors</p>
            <p className="text-xl font-bold text-[#D97706] mt-1">{researchStats.competitors}</p>
          </div>
          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
            <p className="text-[10px] uppercase font-bold text-[#94A3B8]">Gaps Solved</p>
            <p className="text-xl font-bold text-[#16A34A] mt-1">{researchStats.gapsIdentified}</p>
          </div>
          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
            <p className="text-[10px] uppercase font-bold text-[#94A3B8]">Research Papers</p>
            <p className="text-xl font-bold text-[#0F172A] mt-1">{researchStats.papers}</p>
          </div>
          <div className="p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl">
            <p className="text-[10px] uppercase font-bold text-[#2563EB]">Confidence</p>
            <p className="text-xl font-bold text-[#2563EB] mt-1">{researchStats.researchConfidence}%</p>
          </div>
        </div>
      </Card>

      {/* ── SECTION 9: Investment Readiness ── */}
      <Card className="p-6">
        <ExecutiveHeader
          icon={Building2}
          title="Section 9 — Investment Readiness Engine"
          subtitle="7-Dimensional investment score matrix and executive build decision verdict"
        />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-center">
          {/* Bar chart of investment matrix */}
          {isMounted && (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={investmentMatrix} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <YAxis dataKey="metric" type="category" width={140} tick={{ fontSize: 10, fill: '#0F172A', fontWeight: 600 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="score" fill="#2563EB" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Decision Verdict Box */}
          <div className="p-6 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-4 text-center xl:text-left">
            <div>
              <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Overall Investment Score</p>
              <div className="flex items-baseline gap-2 mt-1 justify-center xl:justify-start">
                <span className="text-4xl font-black text-[#0F172A]">{investmentReadiness}</span>
                <span className="text-sm font-semibold text-[#94A3B8]">/ 100</span>
              </div>
            </div>

            <div className="p-4 bg-white border border-[#E2E8F0] rounded-xl space-y-2">
              <p className="text-xs font-bold text-[#475569] uppercase">Executive Decision Verdict</p>
              <div className="flex items-center gap-3 justify-center xl:justify-start">
                <span className="px-3 py-1 text-sm font-extrabold rounded-lg bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]">
                  ✓ {overallRecommendation}
                </span>
                <span className="text-xs text-[#475569]">High Return-to-Risk Ratio</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ── SECTION 10: Executive Decision Log ── */}
      <Card className="p-6">
        <ExecutiveHeader
          icon={FileCheck}
          title="Section 10 — Executive Decision Log"
          subtitle="Audit log of recommendations, evidence basis, alternatives considered & conviction confidence"
        />

        <div className="space-y-3">
          {decisionLogs.map((log, idx) => (
            <div key={idx} className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-xs font-bold text-[#0F172A] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#0F172A] text-white text-[10px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  {log.recommendation}
                </p>
                <Badge variant="accent">Confidence {log.confidence}%</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
                <div>
                  <p className="text-[10px] font-bold text-[#94A3B8] uppercase">Rationale</p>
                  <p className="text-[#475569] mt-0.5">{log.reason}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#94A3B8] uppercase">Empirical Evidence</p>
                  <p className="text-[#2563EB] font-medium mt-0.5">{log.evidence}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#94A3B8] uppercase">Alternative Evaluated</p>
                  <p className="text-[#94A3B8] mt-0.5">{log.alternative}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
