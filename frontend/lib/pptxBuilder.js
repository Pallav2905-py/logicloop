/**
 * pptxBuilder.js
 *
 * Generates a McKinsey-style premium investor pitch deck using pptxgenjs.
 * Enforces strict 13-slide layout with typography, colors, charts, and shapes.
 */

import pptxgen from 'pptxgenjs';

export async function generatePitchDeck(project, deckJson) {
  const pptx = new pptxgen();

  // 1. GLOBAL SETTINGS & TOKENS
  pptx.author = 'IntelliGrade AI';
  pptx.company = 'IntelliGrade';
  pptx.title = deckJson.slides?.slide1_cover?.title || 'Pitch Deck';
  pptx.layout = 'LAYOUT_16x9';

  // McKinsey / Stripe / Premium Dark aesthetic
  const COLORS = {
    bg: '0F172A',
    surface: '1E293B',
    surfaceHighlight: '334155',
    primary: '2563EB',
    accent: '38BDF8',
    textMain: 'F8FAFC',
    textMuted: '94A3B8',
    success: '10B981',
    warning: 'F59E0B'
  };

  const FONTS = {
    title: 'Helvetica Neue',
    body: 'Arial'
  };

  // Master Slide Setup
  pptx.defineSlideMaster({
    title: 'MASTER_SLIDE',
    background: { color: COLORS.bg },
    objects: [
      { rect: { x: 0, y: 0, w: '100%', h: 0.1, fill: { color: COLORS.primary } } },
      { text: { text: 'IntelliGrade AI', options: { x: '90%', y: '94%', w: '10%', fontSize: 8, color: COLORS.textMuted, fontFace: FONTS.body } } }
    ]
  });

  const slides = deckJson.slides || {};

  // Helper function to create premium headers
  const addSlideHeader = (slide, title) => {
    slide.addText(title.toUpperCase(), {
      x: 0.5, y: 0.4, w: '80%', h: 0.5,
      fontSize: 12, fontFace: FONTS.title, color: COLORS.accent, bold: true, charSpacing: 2
    });
    slide.addShape(pptx.ShapeType.line, { x: 0.5, y: 0.9, w: 0.5, h: 0, line: { color: COLORS.primary, width: 2 } });
  };

  // ---------------------------------------------------------
  // SLIDE 1: COVER
  // ---------------------------------------------------------
  const s1 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
  if (slides.slide1_cover?.speakerNotes) s1.addNotes(slides.slide1_cover.speakerNotes);

  s1.addShape(pptx.ShapeType.rect, { x: 5, y: 0, w: 5, h: '100%', fill: { color: COLORS.surface } });
  s1.addText('PITCH DECK', { x: 0.8, y: 2, w: 4, h: 0.5, fontSize: 12, color: COLORS.accent, bold: true, charSpacing: 3 });
  s1.addText(slides.slide1_cover?.title || 'Project Title', { x: 0.8, y: 2.5, w: 4, h: 1.5, fontSize: 44, color: COLORS.textMain, fontFace: FONTS.title, bold: true });
  s1.addText(slides.slide1_cover?.subtitle || 'Compelling Tagline', { x: 0.8, y: 4, w: 4, h: 1, fontSize: 16, color: COLORS.textMuted, fontFace: FONTS.body });
  
  // Placeholder for AI Image
  s1.addShape(pptx.ShapeType.rect, { x: 5.5, y: 1.5, w: 4, h: 4.5, fill: { color: COLORS.surfaceHighlight } });
  s1.addText('AI GENERATED\\nVISUALIZATION', { x: 5.5, y: 1.5, w: 4, h: 4.5, align: 'center', color: COLORS.textMuted, fontSize: 12 });

  // ---------------------------------------------------------
  // SLIDE 2: PROBLEM
  // ---------------------------------------------------------
  const s2 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
  addSlideHeader(s2, 'The Problem');
  if (slides.slide2_problem?.speakerNotes) s2.addNotes(slides.slide2_problem.speakerNotes);

  s2.addText(slides.slide2_problem?.headline || 'Core Problem', { x: 0.5, y: 1.2, w: '50%', h: 1, fontSize: 28, color: COLORS.textMain, bold: true, fontFace: FONTS.title });
  
  const bullets = slides.slide2_problem?.bullets || [];
  bullets.forEach((b, i) => {
    s2.addShape(pptx.ShapeType.rect, { x: 0.5, y: 2.5 + (i * 1.2), w: '45%', h: 0.8, fill: { color: COLORS.surface }, line: { color: COLORS.surfaceHighlight }, rectRadius: 0.1 });
    s2.addText(b, { x: 0.7, y: 2.5 + (i * 1.2), w: '41%', h: 0.8, fontSize: 14, color: COLORS.textMain, fontFace: FONTS.body });
  });

  // Image placeholder right side
  s2.addShape(pptx.ShapeType.rect, { x: 5.5, y: 1.2, w: 4, h: 5, fill: { color: COLORS.surfaceHighlight }, rectRadius: 0.2 });
  s2.addText('PROBLEM VISUALIZATION', { x: 5.5, y: 1.2, w: 4, h: 5, align: 'center', color: COLORS.bg, bold: true });

  // ---------------------------------------------------------
  // SLIDE 3: MARKET OPPORTUNITY (WITH CHART)
  // ---------------------------------------------------------
  const s3 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
  addSlideHeader(s3, 'Market Opportunity');
  if (slides.slide3_market?.speakerNotes) s3.addNotes(slides.slide3_market.speakerNotes);

  s3.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.2, w: 2.8, h: 1.5, fill: { color: COLORS.surface }, rectRadius: 0.1 });
  s3.addText('MARKET SIZE', { x: 0.5, y: 1.3, w: 2.8, h: 0.3, align: 'center', fontSize: 10, color: COLORS.textMuted });
  s3.addText(slides.slide3_market?.marketSize || '$10B+', { x: 0.5, y: 1.6, w: 2.8, h: 0.8, align: 'center', fontSize: 36, color: COLORS.primary, bold: true });

  s3.addShape(pptx.ShapeType.rect, { x: 3.5, y: 1.2, w: 2.8, h: 1.5, fill: { color: COLORS.surface }, rectRadius: 0.1 });
  s3.addText('GROWTH (CAGR)', { x: 3.5, y: 1.3, w: 2.8, h: 0.3, align: 'center', fontSize: 10, color: COLORS.textMuted });
  s3.addText(slides.slide3_market?.growthRate || '15%', { x: 3.5, y: 1.6, w: 2.8, h: 0.8, align: 'center', fontSize: 36, color: COLORS.accent, bold: true });

  s3.addText('Target Users:', { x: 0.5, y: 3.2, w: 3, h: 0.4, color: COLORS.textMain, bold: true });
  (slides.slide3_market?.targetUsers || []).forEach((u, i) => {
    s3.addText(`• ${u}`, { x: 0.5, y: 3.8 + (i * 0.4), w: 3, h: 0.4, color: COLORS.textMuted, fontSize: 14 });
  });

  // Chart
  const chartData = slides.slide3_market?.chartData || [{name:'24', value:10}, {name:'25', value:20}, {name:'26', value:40}];
  s3.addChart(pptx.ChartType.bar, 
    [{ name: 'Growth', labels: chartData.map(d=>d.name), values: chartData.map(d=>d.value) }], 
    { x: 4.5, y: 3, w: 5, h: 3.5, barDir: 'col', chartColors: [COLORS.primary], showLegend: false, valAxisLabelColor: COLORS.textMuted, catAxisLabelColor: COLORS.textMuted }
  );

  // ---------------------------------------------------------
  // SLIDE 4: CURRENT SOLUTIONS
  // ---------------------------------------------------------
  const s4 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
  addSlideHeader(s4, 'Existing Solutions & Gaps');
  if (slides.slide4_currentSolutions?.speakerNotes) s4.addNotes(slides.slide4_currentSolutions.speakerNotes);

  const comps = slides.slide4_currentSolutions?.competitors || [];
  comps.forEach((c, i) => {
    const yPos = 1.5 + (i * 1.5);
    s4.addShape(pptx.ShapeType.rect, { x: 0.5, y: yPos, w: 9, h: 1.2, fill: { color: COLORS.surface }, rectRadius: 0.1 });
    s4.addText(c.name, { x: 0.8, y: yPos + 0.3, w: 2.5, h: 0.6, fontSize: 18, color: COLORS.textMain, bold: true });
    s4.addText(`Pros: ${c.pros}`, { x: 3.5, y: yPos + 0.1, w: 5, h: 0.4, fontSize: 12, color: COLORS.success });
    s4.addText(`Cons: ${c.cons}`, { x: 3.5, y: yPos + 0.6, w: 5, h: 0.4, fontSize: 12, color: COLORS.warning });
  });
  
  s4.addShape(pptx.ShapeType.rect, { x: 0.5, y: 5, w: 9, h: 1.5, fill: { color: COLORS.primary }, rectRadius: 0.1 });
  s4.addText('THE MARKET GAP', { x: 1, y: 5.2, w: 8, h: 0.3, fontSize: 10, color: 'FFFFFF', bold: true });
  s4.addText(slides.slide4_currentSolutions?.marketGap || 'No existing solution provides the required capability.', { x: 1, y: 5.5, w: 8, h: 0.8, fontSize: 16, color: 'FFFFFF' });

  // ---------------------------------------------------------
  // SLIDE 5: OUR SOLUTION
  // ---------------------------------------------------------
  const s5 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
  addSlideHeader(s5, 'Our Solution');
  if (slides.slide5_solution?.speakerNotes) s5.addNotes(slides.slide5_solution.speakerNotes);

  s5.addText(slides.slide5_solution?.usp || 'The USP goes here.', { x: 0.5, y: 1.2, w: 9, h: 0.8, fontSize: 24, color: COLORS.textMain, bold: true, align: 'center' });
  
  const feats = slides.slide5_solution?.features || [];
  feats.forEach((f, i) => {
    const xPos = 0.5 + (i % 2) * 4.5;
    const yPos = 2.5 + Math.floor(i / 2) * 1.5;
    s5.addShape(pptx.ShapeType.rect, { x: xPos, y: yPos, w: 4.2, h: 1.2, fill: { color: COLORS.surface }, rectRadius: 0.1, line: {color: COLORS.primary} });
    s5.addText(f, { x: xPos + 0.2, y: yPos + 0.2, w: 3.8, h: 0.8, fontSize: 14, color: COLORS.textMain, align: 'center' });
  });

  // ---------------------------------------------------------
  // SLIDE 6: INNOVATION ENGINE (RADAR CHART)
  // ---------------------------------------------------------
  const s6 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
  addSlideHeader(s6, 'Innovation Engine');
  if (slides.slide6_innovation?.speakerNotes) s6.addNotes(slides.slide6_innovation.speakerNotes);

  s6.addText('AI Consensus & Validation', { x: 0.5, y: 1.2, w: 4, h: 0.5, fontSize: 20, color: COLORS.textMain, bold: true });
  
  const radarData = [
    { name: 'Overall', labels: ['Novelty', 'Feasibility', 'Market', 'Confidence', 'Risk'], values: [85, 88, 85, 92, 70] }
  ];
  s6.addChart(pptx.ChartType.radar, radarData, {
    x: 0.5, y: 2, w: 4.5, h: 4.5, chartColors: [COLORS.primary], 
    valAxisLabelColor: COLORS.textMuted, catAxisLabelColor: COLORS.textMuted, radarStyle: 'standard'
  });

  s6.addText('Positive Reasoning', { x: 5.5, y: 1.2, w: 4, h: 0.4, color: COLORS.success, bold: true });
  (slides.slide6_innovation?.positiveReasoning || []).forEach((r, i) => {
    s6.addText(`✓ ${r}`, { x: 5.5, y: 1.8 + (i * 0.5), w: 4, h: 0.4, color: COLORS.textMain, fontSize: 12 });
  });

  s6.addText('Critical Constraints', { x: 5.5, y: 4, w: 4, h: 0.4, color: COLORS.warning, bold: true });
  (slides.slide6_innovation?.criticalReasoning || []).forEach((r, i) => {
    s6.addText(`! ${r}`, { x: 5.5, y: 4.6 + (i * 0.5), w: 4, h: 0.4, color: COLORS.textMain, fontSize: 12 });
  });

  // ---------------------------------------------------------
  // SLIDE 7: ARCHITECTURE
  // ---------------------------------------------------------
  const s7 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
  addSlideHeader(s7, 'System Architecture');
  if (slides.slide7_architecture?.speakerNotes) s7.addNotes(slides.slide7_architecture.speakerNotes);

  const steps = slides.slide7_architecture?.flowSteps || [];
  steps.forEach((step, i) => {
    s7.addShape(pptx.ShapeType.rect, { x: 0.5 + (i * 2.3), y: 3, w: 2, h: 1.5, fill: { color: COLORS.surfaceHighlight }, rectRadius: 0.2 });
    s7.addText(`Step ${i+1}`, { x: 0.5 + (i * 2.3), y: 3.1, w: 2, h: 0.3, align: 'center', color: COLORS.accent, fontSize: 10, bold: true });
    s7.addText(step, { x: 0.6 + (i * 2.3), y: 3.5, w: 1.8, h: 0.9, align: 'center', color: COLORS.textMain, fontSize: 12 });
    
    if (i < steps.length - 1) {
      s7.addShape(pptx.ShapeType.rightArrow, { x: 2.6 + (i * 2.3), y: 3.6, w: 0.3, h: 0.3, fill: { color: COLORS.primary } });
    }
  });

  // ---------------------------------------------------------
  // SLIDE 8: TECH STACK
  // ---------------------------------------------------------
  const s8 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
  addSlideHeader(s8, 'Technology Stack');
  if (slides.slide8_techStack?.speakerNotes) s8.addNotes(slides.slide8_techStack.speakerNotes);

  const tStack = slides.slide8_techStack || {};
  const cats = [
    { title: 'Frontend', items: tStack.frontend || [] },
    { title: 'Backend', items: tStack.backend || [] },
    { title: 'Database', items: tStack.database || [] },
    { title: 'AI & Intelligence', items: tStack.ai || [] }
  ];

  cats.forEach((cat, i) => {
    s8.addShape(pptx.ShapeType.rect, { x: 0.5 + (i * 2.3), y: 2, w: 2.1, h: 4, fill: { color: COLORS.surface }, rectRadius: 0.1 });
    s8.addText(cat.title, { x: 0.5 + (i * 2.3), y: 2.2, w: 2.1, h: 0.4, align: 'center', color: COLORS.primary, bold: true, fontSize: 14 });
    cat.items.forEach((item, j) => {
      s8.addText(item, { x: 0.6 + (i * 2.3), y: 3 + (j * 0.6), w: 1.9, h: 0.4, align: 'center', color: COLORS.textMain, fontSize: 12, fill: { color: COLORS.surfaceHighlight } });
    });
  });

  // ---------------------------------------------------------
  // SLIDE 9: BUSINESS MODEL
  // ---------------------------------------------------------
  const s9 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
  addSlideHeader(s9, 'Business Model');
  if (slides.slide9_businessModel?.speakerNotes) s9.addNotes(slides.slide9_businessModel.speakerNotes);

  s9.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.5, w: 4.2, h: 4.5, fill: { color: COLORS.surface }, line: { color: COLORS.primary } });
  s9.addText('Revenue Streams', { x: 0.8, y: 1.8, w: 3.6, h: 0.4, color: COLORS.accent, bold: true, fontSize: 18 });
  (slides.slide9_businessModel?.revenueStreams || []).forEach((rs, i) => {
    s9.addText(`• ${rs}`, { x: 0.8, y: 2.5 + (i * 0.6), w: 3.6, h: 0.5, color: COLORS.textMain, fontSize: 14 });
  });

  s9.addShape(pptx.ShapeType.rect, { x: 5.3, y: 1.5, w: 4.2, h: 4.5, fill: { color: COLORS.surface } });
  s9.addText('Commercial Strategy', { x: 5.6, y: 1.8, w: 3.6, h: 0.4, color: COLORS.primary, bold: true, fontSize: 18 });
  (slides.slide9_businessModel?.commercialStrategy || []).forEach((cs, i) => {
    s9.addText(`• ${cs}`, { x: 5.6, y: 2.5 + (i * 0.6), w: 3.6, h: 0.5, color: COLORS.textMain, fontSize: 14 });
  });

  // ---------------------------------------------------------
  // SLIDE 10: ROADMAP
  // ---------------------------------------------------------
  const s10 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
  addSlideHeader(s10, 'Development Roadmap');
  if (slides.slide10_roadmap?.speakerNotes) s10.addNotes(slides.slide10_roadmap.speakerNotes);

  const ms = slides.slide10_roadmap?.milestones || [];
  ms.forEach((m, i) => {
    s10.addShape(pptx.ShapeType.ellipse, { x: 1 + (i * 2.2), y: 3, w: 0.5, h: 0.5, fill: { color: COLORS.primary } });
    if (i < ms.length - 1) {
      s10.addShape(pptx.ShapeType.line, { x: 1.5 + (i * 2.2), y: 3.25, w: 1.7, h: 0, line: { color: COLORS.surfaceHighlight, width: 4 } });
    }
    s10.addText(m.time, { x: 0.2 + (i * 2.2), y: 2.3, w: 2, h: 0.4, align: 'center', color: COLORS.accent, bold: true, fontSize: 12 });
    s10.addText(m.goal, { x: 0.2 + (i * 2.2), y: 3.8, w: 2, h: 0.8, align: 'center', color: COLORS.textMain, fontSize: 12 });
  });

  // ---------------------------------------------------------
  // SLIDE 11: FINANCIALS
  // ---------------------------------------------------------
  const s11 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
  addSlideHeader(s11, 'Financials & Feasibility');
  if (slides.slide11_financials?.speakerNotes) s11.addNotes(slides.slide11_financials.speakerNotes);

  const fin = slides.slide11_financials || {};
  
  const finCards = [
    { label: 'Budget Required', val: fin.budgetRequired || '$50k' },
    { label: 'Team Size', val: fin.teamSize || '4 Eng' },
    { label: 'Time to Market', val: fin.timeToMarket || '3 Mo' },
    { label: 'Cloud Cost', val: fin.cloudCost || '$500/mo' }
  ];

  finCards.forEach((c, i) => {
    s11.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.5 + (i * 1.1), w: 3, h: 0.9, fill: { color: COLORS.surface }, rectRadius: 0.1 });
    s11.addText(c.label, { x: 0.6, y: 1.6 + (i * 1.1), w: 2.8, h: 0.3, color: COLORS.textMuted, fontSize: 10, bold: true });
    s11.addText(c.val, { x: 0.6, y: 1.9 + (i * 1.1), w: 2.8, h: 0.4, color: COLORS.textMain, fontSize: 16, bold: true });
  });

  // Investment Readiness Pie Chart
  s11.addChart(pptx.ChartType.pie, 
    [{ name: 'Readiness', labels: ['Ready', 'Gap'], values: [fin.investmentReadiness || 85, 100 - (fin.investmentReadiness || 85)] }],
    { x: 4.5, y: 1.5, w: 4.5, h: 4.5, dataLabelColor: 'FFFFFF', chartColors: [COLORS.primary, COLORS.surfaceHighlight] }
  );

  // ---------------------------------------------------------
  // SLIDE 12: FUTURE VISION
  // ---------------------------------------------------------
  const s12 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
  addSlideHeader(s12, 'Future Vision');
  if (slides.slide12_future?.speakerNotes) s12.addNotes(slides.slide12_future.speakerNotes);

  s12.addText('Expansion Opportunities', { x: 0.5, y: 1.5, w: 4, h: 0.5, fontSize: 20, color: COLORS.accent, bold: true });
  (slides.slide12_future?.expansionOpportunities || []).forEach((opp, i) => {
    s12.addText(`→ ${opp}`, { x: 0.5, y: 2.5 + (i * 0.8), w: 4.5, h: 0.6, fontSize: 16, color: COLORS.textMain });
  });

  // Placeholder for Vision Image
  s12.addShape(pptx.ShapeType.rect, { x: 5.5, y: 1.5, w: 4, h: 4.5, fill: { color: COLORS.surfaceHighlight } });
  s12.addText('VISION VISUALIZATION', { x: 5.5, y: 1.5, w: 4, h: 4.5, align: 'center', color: COLORS.bg, bold: true });

  // ---------------------------------------------------------
  // SLIDE 13: THANK YOU
  // ---------------------------------------------------------
  const s13 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
  if (slides.slide13_thankYou?.speakerNotes) s13.addNotes(slides.slide13_thankYou.speakerNotes);

  s13.addText('THANK YOU', { x: 0, y: 2.5, w: '100%', h: 1, align: 'center', fontSize: 50, color: COLORS.primary, bold: true, charSpacing: 4 });
  s13.addText(slides.slide13_thankYou?.contact || 'Let us build the future together.', { x: 0, y: 4, w: '100%', h: 0.5, align: 'center', fontSize: 16, color: COLORS.textMuted });
  s13.addText('Generated by IntelliGrade AI', { x: 0, y: 5, w: '100%', h: 0.5, align: 'center', fontSize: 10, color: COLORS.textMuted, bold: true });

  // ---------------------------------------------------------
  // GENERATE FILE
  // ---------------------------------------------------------
  const buffer = await pptx.write('arraybuffer');
  return buffer;
}
