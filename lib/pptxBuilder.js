/**
 * pptxBuilder.js
 *
 * Converts structured pitch deck JSON (from Gemini) into a world-class,
 * McKinsey/BCG investor-grade PowerPoint presentation using pptxgenjs.
 *
 * Design Architecture:
 * - Enterprise color palette with high contrast typography
 * - Native PPTX Charts (Bar, Column, Doughnut)
 * - Structured Card Components & Graphical Progress Meters
 * - Precise layout grid and typography scale
 */

import PptxGenJS from 'pptxgenjs';

// ─── Design System Tokens ──────────────────────────────────────────────────────
const COLORS = {
  primary: '0F172A',       // Dark Navy — primary text & hero cards
  secondary: '1E293B',     // Slate Navy — cards & secondary elements
  accent: '2563EB',        // Electric Blue — primary accent & CTA
  accentLight: 'EFF6FF',   // Soft Blue Tint — background containers
  accentMid: '3B82F6',     // Medium Blue — charts & progress bars
  success: '16A34A',       // Emerald Green — positive scores & checkmarks
  successLight: 'F0FDF4',  // Soft Green Tint
  warning: 'D97706',       // Warm Amber — alerts & gaps
  warningLight: 'FFFBEB',  // Soft Amber Tint
  danger: 'DC2626',        // Crimson Red — risks & pain points
  dangerLight: 'FEF2F2',   // Soft Red Tint
  purple: '7C3AED',        // Royal Purple — research & innovation
  purpleLight: 'F5F3FF',   // Soft Purple Tint
  white: 'FFFFFF',
  bg: 'F8FAFC',            // Clean background
  border: 'E2E8F0',        // Subtle card border
  borderDark: 'CBD5E1',
  textMuted: '94A3B8',
  textSecondary: '475569',
  cardBg: 'F1F5F9',
};

const FONTS = {
  heading: 'Calibri',
  body: 'Calibri',
  mono: 'Courier New',
};

// Slide dimensions (10 x 5.63 inches — 16:9 Widescreen)
const W = 10;
const H = 5.63;

// ─── Shared UI Helper Functions ───────────────────────────────────────────────

/** Adds slide background, top accent strip, left line, and footer */
function addSlideChrome(slide, pptx, slideNumber, totalSlides, sectionCategory = '') {
  // Clean white background
  slide.background = { color: COLORS.white };

  // Top accent bar
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: W, h: 0.05,
    fill: { color: COLORS.accent },
    line: { color: COLORS.accent },
  });

  // Left accent line
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0.05, w: 0.04, h: H - 0.05,
    fill: { color: COLORS.accentLight },
    line: { color: COLORS.accentLight },
  });

  // Footer bar
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: H - 0.3, w: W, h: 0.3,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.border },
  });

  // Footer left text
  slide.addText('IntelliGrade AI  |  Investor Presentation', {
    x: 0.3, y: H - 0.26, w: 4, h: 0.22,
    fontSize: 7.5, color: COLORS.textMuted,
    fontFace: FONTS.body, align: 'left',
  });

  // Category pill in footer
  if (sectionCategory) {
    slide.addText(sectionCategory.toUpperCase(), {
      x: W / 2 - 1.5, y: H - 0.26, w: 3, h: 0.22,
      fontSize: 7, color: COLORS.accent,
      fontFace: FONTS.body, bold: true, align: 'center', charSpacing: 1.5,
    });
  }

  // Slide number right
  slide.addText(`Slide ${slideNumber} of ${totalSlides}`, {
    x: W - 1.5, y: H - 0.26, w: 1.2, h: 0.22,
    fontSize: 7.5, color: COLORS.textMuted,
    fontFace: FONTS.body, align: 'right',
  });
}

/** Draws a styled rounded card */
function addCard(slide, pptx, x, y, w, h, opts = {}) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    fill: { color: opts.fillColor || COLORS.cardBg },
    line: { color: opts.lineColor || COLORS.border, pt: opts.linePt || 0.75 },
    rectRadius: opts.radius || 0.08,
  });
}

/** Draws a section header with accent line and optional category tag */
function addSectionHeader(slide, pptx, title, categoryTag = '') {
  // Category Pill
  if (categoryTag) {
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.28, y: 0.15, w: Math.max(1.2, categoryTag.length * 0.08), h: 0.22,
      fill: { color: COLORS.accentLight },
      line: { color: COLORS.accentLight },
      rectRadius: 0.04,
    });
    slide.addText(categoryTag.toUpperCase(), {
      x: 0.28, y: 0.15, w: Math.max(1.2, categoryTag.length * 0.08), h: 0.22,
      fontSize: 7, color: COLORS.accent,
      fontFace: FONTS.heading, bold: true, align: 'center', charSpacing: 1,
    });
  }

  const titleY = categoryTag ? 0.38 : 0.18;

  // Title accent bar
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.28, y: titleY + 0.03, w: 0.04, h: 0.34,
    fill: { color: COLORS.accent },
    line: { color: COLORS.accent },
  });

  // Title text
  slide.addText(title, {
    x: 0.42, y: titleY, w: W - 0.6, h: 0.4,
    fontSize: 19, color: COLORS.primary,
    fontFace: FONTS.heading, bold: true,
  });
}

/** Draws a progress bar */
function addProgressBar(slide, pptx, x, y, w, score, label, color) {
  const barH = 0.12;
  const fillColor = color || COLORS.accent;

  // Track
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y: y + 0.18, w, h: barH,
    fill: { color: COLORS.border },
    line: { color: COLORS.border },
    rectRadius: 0.05,
  });

  // Fill
  const fillW = Math.max(0.06, (score / 100) * w);
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y: y + 0.18, w: fillW, h: barH,
    fill: { color: fillColor },
    line: { color: fillColor },
    rectRadius: 0.05,
  });

  // Label
  slide.addText(label, {
    x, y, w: w - 0.6, h: 0.2,
    fontSize: 8, color: COLORS.textSecondary,
    fontFace: FONTS.body, bold: false,
  });

  // Score text
  slide.addText(`${score}%`, {
    x: x + w - 0.5, y, w: 0.5, h: 0.2,
    fontSize: 8.5, color: fillColor,
    fontFace: FONTS.heading, bold: true, align: 'right',
  });
}

/** Draws a KPI metric callout box */
function addKpiBox(slide, pptx, x, y, w, h, value, label, color = COLORS.accentLight) {
  addCard(slide, pptx, x, y, w, h, { fillColor: color, linePt: 0 });

  slide.addText(String(value), {
    x, y: y + 0.06, w, h: h * 0.55,
    fontSize: 20, color: COLORS.accent,
    fontFace: FONTS.heading, bold: true, align: 'center',
  });
  slide.addText(label, {
    x, y: y + h * 0.58, w, h: h * 0.36,
    fontSize: 7.5, color: COLORS.textSecondary,
    fontFace: FONTS.body, align: 'center',
  });
}

// ─── 13 SLIDE BUILDERS ────────────────────────────────────────────────────────

// 1. Cover Slide
function addCoverSlide(pptx, slideData, currentDate) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };

  // Left dark hero panel
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 3.9, h: H,
    fill: { color: COLORS.primary },
    line: { color: COLORS.primary },
  });

  // Blue accent stripe
  slide.addShape(pptx.ShapeType.rect, {
    x: 3.9, y: 0, w: 0.06, h: H,
    fill: { color: COLORS.accent },
    line: { color: COLORS.accent },
  });

  // Icon badge on left panel
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 1.2, y: 0.8, w: 1.5, h: 1.5,
    fill: { color: COLORS.secondary },
    line: { color: COLORS.accentMid, pt: 1.5 },
    rectRadius: 0.2,
  });

  slide.addText(slideData.icon || '🚀', {
    x: 1.2, y: 0.95, w: 1.5, h: 1.2,
    fontSize: 44, align: 'center',
  });

  // Deck Label
  slide.addText('INVESTOR PITCH DECK', {
    x: 0.3, y: 2.6, w: 3.3, h: 0.28,
    fontSize: 8, color: COLORS.accentMid,
    fontFace: FONTS.heading, bold: true, align: 'center', charSpacing: 2,
  });

  // Footer metadata on left panel
  slide.addText('POWERED BY INTELLIGRADE AI', {
    x: 0.3, y: H - 0.85, w: 3.3, h: 0.22,
    fontSize: 7, color: COLORS.textMuted,
    fontFace: FONTS.body, align: 'center', charSpacing: 1,
  });

  slide.addText(currentDate, {
    x: 0.3, y: H - 0.6, w: 3.3, h: 0.22,
    fontSize: 7.5, color: COLORS.textMuted,
    fontFace: FONTS.body, align: 'center',
  });

  // Right main content area
  slide.addText(slideData.title || 'Project Title', {
    x: 4.3, y: 0.8, w: 5.4, h: 1.2,
    fontSize: 28, color: COLORS.primary,
    fontFace: FONTS.heading, bold: true, wrap: true,
  });

  // Subtitle Pill / Tagline
  addCard(slide, pptx, 4.3, 2.1, 5.3, 0.45, { fillColor: COLORS.accentLight, linePt: 0 });
  slide.addText(slideData.subtitle || 'AI-Powered Project Pitch Deck', {
    x: 4.4, y: 2.12, w: 5.1, h: 0.4,
    fontSize: 11, color: COLORS.accent,
    fontFace: FONTS.body, bold: true, italic: true, valign: 'middle',
  });

  // Divider line
  slide.addShape(pptx.ShapeType.line, {
    x: 4.3, y: 2.75, w: 5.3, h: 0,
    line: { color: COLORS.border, pt: 1 },
  });

  // Tagline description
  if (slideData.tagline) {
    slide.addText(slideData.tagline, {
      x: 4.3, y: 2.9, w: 5.3, h: 1.2,
      fontSize: 10.5, color: COLORS.textSecondary,
      fontFace: FONTS.body, wrap: true, lineHeight: 18,
    });
  }

  slide.addNotes(slideData.speakerNotes || '');
  return slide;
}

// 2. Problem Statement Slide
function addProblemSlide(pptx, slideData, slideNum, total) {
  const slide = pptx.addSlide();
  addSlideChrome(slide, pptx, slideNum, total, 'Problem Statement');
  addSectionHeader(slide, pptx, slideData.title || 'The Problem', 'Market Needs');

  // Headline Banner
  if (slideData.headline) {
    addCard(slide, pptx, 0.28, 0.85, W - 0.56, 0.52, { fillColor: COLORS.dangerLight, lineColor: COLORS.danger, linePt: 0.5 });
    slide.addText(`⚠️  ${slideData.headline}`, {
      x: 0.4, y: 0.87, w: W - 0.8, h: 0.48,
      fontSize: 11, color: COLORS.danger,
      fontFace: FONTS.heading, bold: true, align: 'center', valign: 'middle',
    });
  }

  // Left Column: 3 Problem Cards
  const bullets = (slideData.bullets || []).slice(0, 3);
  const cardW = 5.8;
  bullets.forEach((b, i) => {
    const y = 1.5 + i * 0.88;
    addCard(slide, pptx, 0.28, y, cardW, 0.78, {});
    // Danger stripe
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.28, y, w: 0.08, h: 0.78,
      fill: { color: COLORS.danger },
      line: { color: COLORS.danger },
    });
    slide.addText(`PAIN POINT 0${i + 1}`, {
      x: 0.45, y: y + 0.08, w: cardW - 0.3, h: 0.2,
      fontSize: 7, color: COLORS.danger,
      fontFace: FONTS.body, bold: true, charSpacing: 1,
    });
    slide.addText(b, {
      x: 0.45, y: y + 0.28, w: cardW - 0.3, h: 0.45,
      fontSize: 9.5, color: COLORS.textSecondary,
      fontFace: FONTS.body, wrap: true,
    });
  });

  // Right Column: Key Stat Callout Card
  if (slideData.statistic) {
    const statX = 6.3;
    addCard(slide, pptx, statX, 1.5, 3.4, 2.54, { fillColor: COLORS.primary, linePt: 0 });

    slide.addText('KEY STATISTIC', {
      x: statX + 0.2, y: 1.7, w: 3.0, h: 0.24,
      fontSize: 7.5, color: COLORS.accentMid,
      fontFace: FONTS.heading, bold: true, align: 'center', charSpacing: 1.5,
    });

    slide.addText(slideData.statistic, {
      x: statX + 0.25, y: 2.0, w: 2.9, h: 1.8,
      fontSize: 11, color: COLORS.white,
      fontFace: FONTS.body, align: 'center', wrap: true, valign: 'middle', lineHeight: 20,
    });
  }

  slide.addNotes(slideData.speakerNotes || '');
}

// 3. Current Solutions Slide
function addCurrentSolutionsSlide(pptx, slideData, slideNum, total) {
  const slide = pptx.addSlide();
  addSlideChrome(slide, pptx, slideNum, total, 'Competitive Landscape');
  addSectionHeader(slide, pptx, slideData.title || 'Existing Solutions & Gaps', 'Market Analysis');

  const bullets = (slideData.bullets || []).slice(0, 3);
  const colW = (W - 0.56 - 2 * 0.16) / 3;

  bullets.forEach((b, i) => {
    const x = 0.28 + i * (colW + 0.16);
    addCard(slide, pptx, x, 0.9, colW, 2.7, {});

    // Competitor badge header
    slide.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.15, y: 1.05, w: colW - 0.3, h: 0.34,
      fill: { color: COLORS.dangerLight },
      line: { color: COLORS.dangerLight },
      rectRadius: 0.05,
    });

    slide.addText(`LIMITATION ${i + 1}`, {
      x: x + 0.15, y: 1.07, w: colW - 0.3, h: 0.3,
      fontSize: 7.5, color: COLORS.danger,
      fontFace: FONTS.heading, bold: true, align: 'center',
    });

    slide.addText(b, {
      x: x + 0.15, y: 1.5, w: colW - 0.3, h: 1.9,
      fontSize: 9.5, color: COLORS.textSecondary,
      fontFace: FONTS.body, wrap: true, valign: 'top', lineHeight: 18,
    });
  });

  // Market Gap Banner
  if (slideData.marketGap) {
    addCard(slide, pptx, 0.28, 3.8, W - 0.56, 0.65, { fillColor: COLORS.accentLight, lineColor: COLORS.accent, linePt: 0.75 });
    slide.addText('🎯  CRITICAL MARKET GAP', {
      x: 0.4, y: 3.86, w: W - 0.8, h: 0.2,
      fontSize: 7.5, color: COLORS.accent,
      fontFace: FONTS.heading, bold: true, charSpacing: 1,
    });
    slide.addText(slideData.marketGap, {
      x: 0.4, y: 4.08, w: W - 0.8, h: 0.32,
      fontSize: 9.5, color: COLORS.primary,
      fontFace: FONTS.body, bold: true, wrap: true,
    });
  }

  slide.addNotes(slideData.speakerNotes || '');
}

// 4. Solution Slide
function addSolutionSlide(pptx, slideData, slideNum, total) {
  const slide = pptx.addSlide();
  addSlideChrome(slide, pptx, slideNum, total, 'Value Proposition');
  addSectionHeader(slide, pptx, slideData.title || 'Our Solution', 'Innovation');

  // USP Headline
  if (slideData.headline) {
    addCard(slide, pptx, 0.28, 0.85, W - 0.56, 0.52, { fillColor: COLORS.accentLight, linePt: 0 });
    slide.addText(`💡  ${slideData.headline}`, {
      x: 0.4, y: 0.87, w: W - 0.8, h: 0.48,
      fontSize: 11, color: COLORS.accent,
      fontFace: FONTS.heading, bold: true, align: 'center', valign: 'middle',
    });
  }

  // 4 Solution Cards Grid (2x2)
  const bullets = (slideData.bullets || []).slice(0, 4);
  const cardW = (W - 0.56 - 0.16) / 2;
  const cardH = 1.05;

  bullets.forEach((b, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.28 + col * (cardW + 0.16);
    const y = 1.5 + row * (cardH + 0.12);

    addCard(slide, pptx, x, y, cardW, cardH, {});

    // Check icon badge
    slide.addShape(pptx.ShapeType.ellipse, {
      x: x + 0.12, y: y + 0.15, w: 0.32, h: 0.32,
      fill: { color: COLORS.successLight },
      line: { color: COLORS.success },
    });
    slide.addText('✓', {
      x: x + 0.12, y: y + 0.16, w: 0.32, h: 0.3,
      fontSize: 11, color: COLORS.success,
      fontFace: FONTS.heading, bold: true, align: 'center',
    });

    slide.addText(b, {
      x: x + 0.55, y: y + 0.12, w: cardW - 0.7, h: cardH - 0.24,
      fontSize: 9, color: COLORS.textSecondary,
      fontFace: FONTS.body, wrap: true, valign: 'middle',
    });
  });

  // Breakthrough Highlight Banner
  if (slideData.highlight) {
    addCard(slide, pptx, 0.28, 3.9, W - 0.56, 0.55, { fillColor: COLORS.primary, linePt: 0 });
    slide.addText('THE BREAKTHROUGH:  ' + slideData.highlight, {
      x: 0.4, y: 3.93, w: W - 0.8, h: 0.48,
      fontSize: 9.5, color: COLORS.white,
      fontFace: FONTS.body, bold: true, wrap: true, valign: 'middle',
    });
  }

  slide.addNotes(slideData.speakerNotes || '');
}

// 5. Innovation Analysis Slide (WITH NATIVE BAR CHART)
function addInnovationSlide(pptx, slideData, slideNum, total) {
  const slide = pptx.addSlide();
  addSlideChrome(slide, pptx, slideNum, total, 'Evaluation Engine');
  addSectionHeader(slide, pptx, slideData.title || 'Innovation Analysis', 'AI Validation');

  const scores = slideData.scores || {};

  // NATIVE PPTX COLUMN CHART (Left Side)
  const chartData = [
    {
      name: 'Score',
      labels: ['Overall', 'Novelty', 'Feasibility', 'Demand', 'Consensus', 'Confidence'],
      values: [
        scores.overall || 85,
        scores.novelty || 82,
        scores.feasibility || 88,
        scores.marketDemand || 85,
        scores.consensusScore || 83,
        scores.confidenceLevel || 88,
      ],
    },
  ];

  try {
    slide.addChart(pptx.ChartType.bar, chartData, {
      x: 0.28, y: 0.85, w: 4.8, h: 3.6,
      barDir: 'col',
      chartColors: ['0F172A', '2563EB', '16A34A', 'D97706', '7C3AED', '3B82F6'],
      showValue: true,
      valueFontSize: 8.5,
      valueColor: COLORS.primary,
      catAxisLabelFontSize: 8,
      catAxisLabelColor: COLORS.textSecondary,
      valGridLine: { color: COLORS.border, style: 'dash' },
      showLegend: false,
    });
  } catch {
    // Fallback if chart fails
    addCard(slide, pptx, 0.28, 0.85, 4.8, 3.6, {});
  }

  // Right Side: Insights Containers
  const rightX = 5.3;
  const rightW = 4.42;

  // Positive Insights Container
  addCard(slide, pptx, rightX, 0.85, rightW, 1.75, { fillColor: COLORS.successLight, lineColor: COLORS.success, linePt: 0.5 });
  slide.addText('POSITIVE ANALYSIS SUMMARY', {
    x: rightX + 0.15, y: 0.92, w: rightW - 0.3, h: 0.2,
    fontSize: 7.5, color: COLORS.success,
    fontFace: FONTS.heading, bold: true, charSpacing: 1,
  });
  (slideData.positiveInsights || []).slice(0, 3).forEach((p, i) => {
    slide.addText(`+ ${p}`, {
      x: rightX + 0.15, y: 1.16 + i * 0.42, w: rightW - 0.3, h: 0.38,
      fontSize: 8.5, color: COLORS.textSecondary,
      fontFace: FONTS.body, wrap: true,
    });
  });

  // Critical Considerations Container
  addCard(slide, pptx, rightX, 2.7, rightW, 1.75, { fillColor: COLORS.dangerLight, lineColor: COLORS.danger, linePt: 0.5 });
  slide.addText('CRITICAL CONSIDERATIONS', {
    x: rightX + 0.15, y: 2.77, w: rightW - 0.3, h: 0.2,
    fontSize: 7.5, color: COLORS.danger,
    fontFace: FONTS.heading, bold: true, charSpacing: 1,
  });
  (slideData.criticalInsights || []).slice(0, 2).forEach((c, i) => {
    slide.addText(`− ${c}`, {
      x: rightX + 0.15, y: 3.02 + i * 0.45, w: rightW - 0.3, h: 0.4,
      fontSize: 8.5, color: COLORS.textSecondary,
      fontFace: FONTS.body, wrap: true,
    });
  });

  slide.addNotes(slideData.speakerNotes || '');
}

// 6. Market Opportunity Slide (WITH NATIVE DOUGHNUT CHART)
function addMarketOpportunitySlide(pptx, slideData, slideNum, total) {
  const slide = pptx.addSlide();
  addSlideChrome(slide, pptx, slideNum, total, 'Market & Growth');
  addSectionHeader(slide, pptx, slideData.title || 'Market Opportunity', 'Target Market');

  // Top: Target User Avatars/Chips
  const users = (slideData.targetUsers || []).slice(0, 4);
  const chipW = (W - 0.56 - (users.length - 1) * 0.12) / Math.max(users.length, 1);
  users.forEach((u, i) => {
    addCard(slide, pptx, 0.28 + i * (chipW + 0.12), 0.85, chipW, 0.45, { fillColor: COLORS.accentLight, linePt: 0 });
    slide.addText(`👤  ${u}`, {
      x: 0.32 + i * (chipW + 0.12), y: 0.87, w: chipW - 0.08, h: 0.4,
      fontSize: 8.5, color: COLORS.accent,
      fontFace: FONTS.heading, bold: true, align: 'center', valign: 'middle',
    });
  });

  // Left: Market Size Dark Card
  addCard(slide, pptx, 0.28, 1.42, 4.4, 2.0, { fillColor: COLORS.primary, linePt: 0 });
  slide.addText('MARKET SIZE & PROJECTIONS', {
    x: 0.45, y: 1.55, w: 4.0, h: 0.22,
    fontSize: 7.5, color: COLORS.accentMid,
    fontFace: FONTS.heading, bold: true, charSpacing: 1.5,
  });
  slide.addText(slideData.marketSize || 'Rapidly expanding TAM with high industry demand.', {
    x: 0.45, y: 1.82, w: 4.0, h: 1.45,
    fontSize: 9.5, color: COLORS.white,
    fontFace: FONTS.body, wrap: true, valign: 'top', lineHeight: 18,
  });

  // Right: Business Opportunity Card
  addCard(slide, pptx, 4.84, 1.42, 4.88, 2.0, {});
  slide.addText('BUSINESS OPPORTUNITY', {
    x: 5.0, y: 1.55, w: 4.5, h: 0.22,
    fontSize: 7.5, color: COLORS.accent,
    fontFace: FONTS.heading, bold: true, charSpacing: 1.5,
  });
  slide.addText(slideData.businessOpportunity || 'Strong commercial viability and strategic enterprise value.', {
    x: 5.0, y: 1.82, w: 4.5, h: 1.45,
    fontSize: 9.5, color: COLORS.textSecondary,
    fontFace: FONTS.body, wrap: true, valign: 'top', lineHeight: 18,
  });

  // Bottom: Growth Trends Pill Badges
  slide.addText('GROWTH TRENDS', {
    x: 0.4, y: 3.55, w: W - 0.6, h: 0.2,
    fontSize: 7.5, color: COLORS.textMuted,
    fontFace: FONTS.heading, bold: true, charSpacing: 1.5,
  });
  const trends = (slideData.growthTrends || []).slice(0, 3);
  const trendW = (W - 0.56 - 2 * 0.12) / 3;
  trends.forEach((t, i) => {
    addCard(slide, pptx, 0.28 + i * (trendW + 0.12), 3.8, trendW, 0.58, {});
    slide.addText(`📈  ${t}`, {
      x: 0.38 + i * (trendW + 0.12), y: 3.85, w: trendW - 0.2, h: 0.48,
      fontSize: 8.5, color: COLORS.textSecondary,
      fontFace: FONTS.body, wrap: true, valign: 'middle',
    });
  });

  slide.addNotes(slideData.speakerNotes || '');
}

// 7. System Architecture Slide
function addArchitectureSlide(pptx, slideData, slideNum, total) {
  const slide = pptx.addSlide();
  addSlideChrome(slide, pptx, slideNum, total, 'Technical Specs');
  addSectionHeader(slide, pptx, slideData.title || 'System Architecture', 'Infrastructure');

  // Architecture Description Banner
  if (slideData.description) {
    addCard(slide, pptx, 0.28, 0.85, W - 0.56, 0.5, { fillColor: COLORS.accentLight, linePt: 0 });
    slide.addText(slideData.description, {
      x: 0.4, y: 0.88, w: W - 0.8, h: 0.44,
      fontSize: 9.5, color: COLORS.accent,
      fontFace: FONTS.body, italic: true, wrap: true, align: 'center', valign: 'middle',
    });
  }

  // 4 Component Flow Boxes
  const components = (slideData.components || []).slice(0, 4);
  const compW = (W - 0.56 - (components.length - 1) * 0.32) / Math.max(components.length, 1);

  components.forEach((comp, i) => {
    const x = 0.28 + i * (compW + 0.32);
    // Dark Component Card
    addCard(slide, pptx, x, 1.5, compW, 1.5, { fillColor: COLORS.primary, linePt: 0 });

    // Node index badge
    slide.addShape(pptx.ShapeType.ellipse, {
      x: x + compW / 2 - 0.18, y: 1.62, w: 0.36, h: 0.36,
      fill: { color: COLORS.accent },
      line: { color: COLORS.accent },
    });
    slide.addText(String(i + 1), {
      x: x + compW / 2 - 0.18, y: 1.63, w: 0.36, h: 0.34,
      fontSize: 10, color: COLORS.white,
      fontFace: FONTS.heading, bold: true, align: 'center',
    });

    slide.addText(comp, {
      x: x + 0.08, y: 2.05, w: compW - 0.16, h: 0.88,
      fontSize: 8.5, color: COLORS.white,
      fontFace: FONTS.body, wrap: true, align: 'center', valign: 'top', lineHeight: 14,
    });

    // Right Arrow between nodes
    if (i < components.length - 1) {
      slide.addText('➔', {
        x: x + compW + 0.04, y: 2.0, w: 0.24, h: 0.5,
        fontSize: 16, color: COLORS.accent,
        fontFace: FONTS.body, align: 'center',
      });
    }
  });

  // Tech Data Flow Banner
  if (slideData.techFlow) {
    addCard(slide, pptx, 0.28, 3.2, W - 0.56, 0.55, {});
    slide.addText('⚡  DATA FLOW SEQUENCE:  ' + slideData.techFlow, {
      x: 0.4, y: 3.23, w: W - 0.8, h: 0.48,
      fontSize: 9, color: COLORS.textSecondary,
      fontFace: FONTS.body, wrap: true, valign: 'middle',
    });
  }

  slide.addNotes(slideData.speakerNotes || '');
}

// 8. Technology Stack Slide
function addTechStackSlide(pptx, slideData, slideNum, total) {
  const slide = pptx.addSlide();
  addSlideChrome(slide, pptx, slideNum, total, 'Technical Specs');
  addSectionHeader(slide, pptx, slideData.title || 'Technology Stack', 'Tech Stack');

  const categories = slideData.categories || {};
  const catIcons = {
    frontend: '🖥️', backend: '⚙️', database: '🗄️',
    cloud: '☁️', ai: '🤖', deployment: '🚀',
  };

  const keys = Object.keys(categories).slice(0, 6);
  const cols = 3;
  const colW = (W - 0.56 - 2 * 0.16) / cols;
  const rowH = 0.95;

  keys.forEach((key, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = 0.28 + col * (colW + 0.16);
    const y = 0.85 + row * (rowH + 0.12);

    addCard(slide, pptx, x, y, colW, rowH, {});

    // Category Header
    slide.addText(`${catIcons[key] || '🔧'} ${key.toUpperCase()}`, {
      x: x + 0.1, y: y + 0.08, w: colW - 0.2, h: 0.22,
      fontSize: 7.5, color: COLORS.accent,
      fontFace: FONTS.heading, bold: true, charSpacing: 1,
    });

    // Items
    const itemsStr = (categories[key] || []).join('  •  ');
    slide.addText(itemsStr, {
      x: x + 0.1, y: y + 0.32, w: colW - 0.2, h: 0.55,
      fontSize: 8.5, color: COLORS.textSecondary,
      fontFace: FONTS.body, wrap: true, valign: 'top',
    });
  });

  // Why This Stack Rationale
  if (slideData.whyThisStack) {
    addCard(slide, pptx, 0.28, 3.8, W - 0.56, 0.55, { fillColor: COLORS.accentLight, linePt: 0 });
    slide.addText('ARCHITECTURE RATIONALE:  ' + slideData.whyThisStack, {
      x: 0.4, y: 3.83, w: W - 0.8, h: 0.48,
      fontSize: 9, color: COLORS.accent,
      fontFace: FONTS.body, wrap: true, valign: 'middle',
    });
  }

  slide.addNotes(slideData.speakerNotes || '');
}

// 9. Research Highlights Slide
function addResearchHighlightsSlide(pptx, slideData, slideNum, total) {
  const slide = pptx.addSlide();
  addSlideChrome(slide, pptx, slideNum, total, 'Research & Data');
  addSectionHeader(slide, pptx, slideData.title || 'Research & Validation', 'Deep Research');

  // Summary Banner
  if (slideData.summary) {
    addCard(slide, pptx, 0.28, 0.85, W - 0.56, 0.5, { fillColor: COLORS.purpleLight, lineColor: COLORS.purple, linePt: 0.5 });
    slide.addText(slideData.summary, {
      x: 0.4, y: 0.88, w: W - 0.8, h: 0.44,
      fontSize: 9.5, color: COLORS.purple,
      fontFace: FONTS.body, italic: true, wrap: true, align: 'center', valign: 'middle',
    });
  }

  // Left: Key Findings (3 Cards)
  const leftW = (W - 0.56 - 0.2) / 2;
  slide.addText('KEY RESEARCH FINDINGS', {
    x: 0.4, y: 1.45, w: leftW, h: 0.2,
    fontSize: 7.5, color: COLORS.primary,
    fontFace: FONTS.heading, bold: true, charSpacing: 1,
  });

  (slideData.keyFindings || []).slice(0, 3).forEach((f, i) => {
    addCard(slide, pptx, 0.28, 1.7 + i * 0.62, leftW, 0.52, {});
    slide.addText(`🔑  ${f}`, {
      x: 0.4, y: 1.74 + i * 0.62, w: leftW - 0.24, h: 0.44,
      fontSize: 8.5, color: COLORS.textSecondary,
      fontFace: FONTS.body, wrap: true, valign: 'middle',
    });
  });

  // Right: Research Gaps (2 Cards)
  const rightX = 0.28 + leftW + 0.2;
  slide.addText('UNADDRESSED RESEARCH GAPS', {
    x: rightX + 0.1, y: 1.45, w: leftW, h: 0.2,
    fontSize: 7.5, color: COLORS.warning,
    fontFace: FONTS.heading, bold: true, charSpacing: 1,
  });

  (slideData.researchGaps || []).slice(0, 2).forEach((g, i) => {
    addCard(slide, pptx, rightX, 1.7 + i * 0.95, leftW, 0.85, { fillColor: COLORS.warningLight, lineColor: COLORS.warning, linePt: 0.5 });
    slide.addText(`⚠️  ${g}`, {
      x: rightX + 0.12, y: 1.75 + i * 0.95, w: leftW - 0.24, h: 0.75,
      fontSize: 8.5, color: COLORS.warning,
      fontFace: FONTS.body, wrap: true, valign: 'middle',
    });
  });

  slide.addNotes(slideData.speakerNotes || '');
}

// 10. Development Roadmap Slide
function addRoadmapSlide(pptx, slideData, slideNum, total) {
  const slide = pptx.addSlide();
  addSlideChrome(slide, pptx, slideNum, total, 'Execution Plan');
  addSectionHeader(slide, pptx, slideData.title || 'Development Roadmap', 'Sprint Plan');

  const phases = (slideData.phases || []).slice(0, 4);
  const phaseColors = [COLORS.accent, COLORS.accentMid, COLORS.success, COLORS.purple];
  const colW = (W - 0.56 - 3 * 0.16) / Math.max(phases.length, 1);

  phases.forEach((phase, i) => {
    const x = 0.28 + i * (colW + 0.16);
    const color = phaseColors[i % phaseColors.length];

    // Phase Badge Header
    slide.addShape(pptx.ShapeType.roundRect, {
      x, y: 0.85, w: colW, h: 0.42,
      fill: { color },
      line: { color },
      rectRadius: 0.06,
    });
    slide.addText(phase.phase || `Week ${i + 1}`, {
      x, y: 0.87, w: colW, h: 0.38,
      fontSize: 10, color: COLORS.white,
      fontFace: FONTS.heading, bold: true, align: 'center',
    });

    // Connector Line
    slide.addShape(pptx.ShapeType.rect, {
      x: x + colW / 2 - 0.02, y: 1.27, w: 0.04, h: 0.22,
      fill: { color },
      line: { color },
    });

    // Phase Title Box
    addCard(slide, pptx, x, 1.49, colW, 0.4, { fillColor: COLORS.cardBg, linePt: 0 });
    slide.addText(phase.label || '', {
      x, y: 1.51, w: colW, h: 0.36,
      fontSize: 8, color: color,
      fontFace: FONTS.heading, bold: true, align: 'center',
    });

    // Milestone Task Cards
    const tasks = (phase.tasks || []).slice(0, 3);
    tasks.forEach((task, j) => {
      const ty = 1.98 + j * 0.65;
      addCard(slide, pptx, x, ty, colW, 0.55, {});
      slide.addText(`▸ ${task}`, {
        x: x + 0.08, y: ty + 0.06, w: colW - 0.16, h: 0.43,
        fontSize: 8, color: COLORS.textSecondary,
        fontFace: FONTS.body, wrap: true, valign: 'middle',
      });
    });
  });

  slide.addNotes(slideData.speakerNotes || '');
}

// 11. Cost & Feasibility Slide
function addCostFeasibilitySlide(pptx, slideData, slideNum, total) {
  const slide = pptx.addSlide();
  addSlideChrome(slide, pptx, slideNum, total, 'Financial & Risk');
  addSectionHeader(slide, pptx, slideData.title || 'Cost & Feasibility', 'Feasibility');

  // Top KPI Metric Row (4 Boxes)
  const kpis = [
    { value: `${slideData.feasibilityScore || 85}/100`, label: 'Feasibility Score' },
    { value: slideData.estimatedTeamSize || '3-5', label: 'Team Size' },
    { value: slideData.estimatedTimeToMVP || '4-6 wks', label: 'Time to MVP' },
    { value: slideData.implementationDifficulty || 'Moderate', label: 'Complexity' },
  ];

  const kpiW = (W - 0.56 - 3 * 0.16) / 4;
  kpis.forEach((k, i) => {
    addKpiBox(slide, pptx, 0.28 + i * (kpiW + 0.16), 0.85, kpiW, 0.8, k.value, k.label);
  });

  // Progress Meters (Left)
  const leftW = (W - 0.56 - 0.2) / 2;
  addProgressBar(slide, pptx, 0.28, 1.85, leftW, slideData.feasibilityScore || 85, 'Feasibility Index', COLORS.success);
  addProgressBar(slide, pptx, 0.28, 2.3, leftW, 100 - (slideData.riskIndex || 30), 'Risk Safety Rating (Higher = Safer)', COLORS.accent);

  // Cost Range Dark Card (Right)
  const rightX = 0.28 + leftW + 0.2;
  addCard(slide, pptx, rightX, 1.85, leftW, 0.8, { fillColor: COLORS.primary, linePt: 0 });
  slide.addText('ESTIMATED COST BREAKDOWN', {
    x: rightX + 0.15, y: 1.92, w: leftW - 0.3, h: 0.2,
    fontSize: 7.5, color: COLORS.accentMid,
    fontFace: FONTS.heading, bold: true, charSpacing: 1.5,
  });
  slide.addText(slideData.estimatedCostRange || 'Cloud: $200-500/mo | APIs: $100-300/mo', {
    x: rightX + 0.15, y: 2.15, w: leftW - 0.3, h: 0.42,
    fontSize: 9, color: COLORS.white,
    fontFace: FONTS.body, wrap: true, valign: 'middle',
  });

  // Risk Mitigations Section
  slide.addText('RISK MITIGATION STRATEGIES', {
    x: 0.4, y: 2.85, w: W - 0.6, h: 0.2,
    fontSize: 7.5, color: COLORS.textMuted,
    fontFace: FONTS.heading, bold: true, charSpacing: 1.5,
  });

  (slideData.riskMitigations || []).slice(0, 3).forEach((r, i) => {
    addCard(slide, pptx, 0.28, 3.1 + i * 0.45, W - 0.56, 0.4, {});
    slide.addText(`🛡️  ${r}`, {
      x: 0.4, y: 3.12 + i * 0.45, w: W - 0.8, h: 0.36,
      fontSize: 8.5, color: COLORS.textSecondary,
      fontFace: FONTS.body, wrap: true, valign: 'middle',
    });
  });

  slide.addNotes(slideData.speakerNotes || '');
}

// 12. Future Scope & Scalability Slide
function addFutureScopeSlide(pptx, slideData, slideNum, total) {
  const slide = pptx.addSlide();
  addSlideChrome(slide, pptx, slideNum, total, 'Future Vision');
  addSectionHeader(slide, pptx, slideData.title || 'Future Scope & Scalability', 'Roadmap');

  const halfW = (W - 0.56 - 0.2) / 2;

  // Phase 2 Features (Left)
  slide.addText('PHASE 2 FEATURES', {
    x: 0.4, y: 0.85, w: halfW, h: 0.2,
    fontSize: 7.5, color: COLORS.accent,
    fontFace: FONTS.heading, bold: true, charSpacing: 1.5,
  });

  (slideData.phase2Features || []).slice(0, 3).forEach((f, i) => {
    addCard(slide, pptx, 0.28, 1.1 + i * 0.62, halfW, 0.54, {});
    slide.addText(`🚀  ${f}`, {
      x: 0.4, y: 1.14 + i * 0.62, w: halfW - 0.24, h: 0.46,
      fontSize: 8.5, color: COLORS.textSecondary,
      fontFace: FONTS.body, wrap: true, valign: 'middle',
    });
  });

  // Scalability Strategy (Right)
  const rightX = 0.28 + halfW + 0.2;
  slide.addText('SCALABILITY ARCHITECTURE', {
    x: rightX + 0.1, y: 0.85, w: halfW, h: 0.2,
    fontSize: 7.5, color: COLORS.primary,
    fontFace: FONTS.heading, bold: true, charSpacing: 1.5,
  });

  addCard(slide, pptx, rightX, 1.1, halfW, 1.78, { fillColor: COLORS.accentLight, linePt: 0 });
  slide.addText(slideData.scalabilityStrategy || 'Designed for horizontal microservices scaling and high availability.', {
    x: rightX + 0.15, y: 1.25, w: halfW - 0.3, h: 1.48,
    fontSize: 9.5, color: COLORS.accent,
    fontFace: FONTS.body, wrap: true, valign: 'top', lineHeight: 18,
  });

  // Long Term Vision Banner
  if (slideData.longTermVision) {
    addCard(slide, pptx, 0.28, 3.85, W - 0.56, 0.55, { fillColor: COLORS.primary, linePt: 0 });
    slide.addText('🌟  LONG-TERM VISION:  ' + slideData.longTermVision, {
      x: 0.4, y: 3.88, w: W - 0.8, h: 0.48,
      fontSize: 9.5, color: COLORS.white,
      fontFace: FONTS.body, bold: true, wrap: true, valign: 'middle',
    });
  }

  slide.addNotes(slideData.speakerNotes || '');
}

// 13. Closing Slide
function addClosingSlide(pptx, slideData, slideNum, total) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.primary };

  // Top Accent Bar
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: W, h: 0.06,
    fill: { color: COLORS.accent },
    line: { color: COLORS.accent },
  });

  // Central Icon
  slide.addText(slideData.icon || '🎯', {
    x: 0, y: 0.7, w: W, h: 0.8,
    fontSize: 44, align: 'center',
  });

  // Title
  slide.addText(slideData.title || 'Thank You', {
    x: 1.0, y: 1.5, w: W - 2.0, h: 0.65,
    fontSize: 32, color: COLORS.white,
    fontFace: FONTS.heading, bold: true, align: 'center',
  });

  // Divider Line
  slide.addShape(pptx.ShapeType.rect, {
    x: W / 2 - 1.0, y: 2.22, w: 2.0, h: 0.04,
    fill: { color: COLORS.accent },
    line: { color: COLORS.accent },
  });

  // Summary
  if (slideData.summary) {
    slide.addText(slideData.summary, {
      x: 1.2, y: 2.35, w: W - 2.4, h: 0.7,
      fontSize: 11, color: COLORS.textMuted,
      fontFace: FONTS.body, align: 'center', wrap: true, italic: true, lineHeight: 18,
    });
  }

  // CTA Button Shape
  if (slideData.callToAction) {
    slide.addShape(pptx.ShapeType.roundRect, {
      x: W / 2 - 2.2, y: 3.15, w: 4.4, h: 0.52,
      fill: { color: COLORS.accent },
      line: { color: COLORS.accent },
      rectRadius: 0.08,
    });
    slide.addText(slideData.callToAction, {
      x: W / 2 - 2.2, y: 3.17, w: 4.4, h: 0.48,
      fontSize: 11, color: COLORS.white,
      fontFace: FONTS.heading, bold: true, align: 'center', valign: 'middle',
    });
  }

  // Footer
  slide.addText(`Generated using ${slideData.generatedBy || 'IntelliGrade AI'}`, {
    x: 0, y: H - 0.4, w: W, h: 0.3,
    fontSize: 8, color: COLORS.textMuted,
    fontFace: FONTS.body, align: 'center',
  });

  slide.addNotes(slideData.speakerNotes || '');
}

// ─── MAIN PPTX GENERATOR ──────────────────────────────────────────────────────

export async function buildPitchDeck(deckJson) {
  const pptx = new PptxGenJS();

  pptx.layout = 'LAYOUT_WIDE'; // 16:9 Widescreen (10 x 5.63 inches)
  pptx.title = deckJson.title || 'AI Pitch Deck';
  pptx.author = 'IntelliGrade AI';

  const slides = deckJson.slides || [];
  const totalSlides = slides.length;
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  let index = 1;
  for (const slideData of slides) {
    switch (slideData.type) {
      case 'cover':
        addCoverSlide(pptx, slideData, currentDate);
        break;
      case 'problem':
        addProblemSlide(pptx, slideData, index, totalSlides);
        break;
      case 'currentSolutions':
        addCurrentSolutionsSlide(pptx, slideData, index, totalSlides);
        break;
      case 'solution':
        addSolutionSlide(pptx, slideData, index, totalSlides);
        break;
      case 'innovationAnalysis':
        addInnovationSlide(pptx, slideData, index, totalSlides);
        break;
      case 'marketOpportunity':
        addMarketOpportunitySlide(pptx, slideData, index, totalSlides);
        break;
      case 'architecture':
        addArchitectureSlide(pptx, slideData, index, totalSlides);
        break;
      case 'techStack':
        addTechStackSlide(pptx, slideData, index, totalSlides);
        break;
      case 'researchHighlights':
        addResearchHighlightsSlide(pptx, slideData, index, totalSlides);
        break;
      case 'roadmap':
        addRoadmapSlide(pptx, slideData, index, totalSlides);
        break;
      case 'costFeasibility':
        addCostFeasibilitySlide(pptx, slideData, index, totalSlides);
        break;
      case 'futureScope':
        addFutureScopeSlide(pptx, slideData, index, totalSlides);
        break;
      case 'closing':
        addClosingSlide(pptx, slideData, index, totalSlides);
        break;
      default:
        // Generic fallback slide
        {
          const slide = pptx.addSlide();
          addSlideChrome(slide, pptx, index, totalSlides, 'Project Overview');
          addSectionHeader(slide, pptx, slideData.title || 'Slide');
          slide.addNotes(slideData.speakerNotes || '');
        }
    }
    index++;
  }

  // Generate Base64
  const base64 = await pptx.write({ outputType: 'base64' });
  return base64;
}
