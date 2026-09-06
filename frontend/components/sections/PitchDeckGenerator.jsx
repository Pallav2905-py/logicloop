'use client';

import { useState, useEffect } from 'react';
import { Card, Badge, FadeIn, Button } from '@/components/ui';
import { Download, PlayCircle, Loader2, FileText, CheckCircle2, Clock, Presentation } from 'lucide-react';

export default function PitchDeckGenerator({ project }) {
  const [deckData, setDeckData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [activeScript, setActiveScript] = useState('twoMinutes');

  useEffect(() => {
    if (project?._id) {
      fetchDeckPreview();
    }
  }, [project?._id]);

  const fetchDeckPreview = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${project._id}/pitch-deck`);
      if (!res.ok) throw new Error('Failed to load pitch deck preview');
      const data = await res.json();
      setDeckData(data.deckJson);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPptx = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/projects/${project._id}/pitch-deck`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deckJson: deckData }),
      });
      if (!res.ok) throw new Error('Failed to generate PPTX');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(project.title || 'pitch-deck').replace(/[^a-z0-9]/gi, '-').toLowerCase()}-pitch-deck.pptx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      setError('Failed to download PPTX');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-[#94A3B8]">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563EB] mb-4" />
        <p className="text-sm font-medium">Analyzing project and generating McKinsey-style pitch deck...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-center">
        <p className="text-[#DC2626] font-medium">{error}</p>
        <Button onClick={fetchDeckPreview} className="mt-4" variant="outline">Try Again</Button>
      </div>
    );
  }

  if (!deckData) return null;

  const scripts = deckData.pitchScripts || {};

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <Card className="p-6 bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <Badge className="bg-[#2563EB] text-white border-none mb-2">Pitch Deck Studio</Badge>
            <h2 className="text-2xl font-bold tracking-tight">Executive Presentation Ready</h2>
            <p className="text-sm text-[#CBD5E1] mt-1">13-slide premium investor deck with custom AI visuals.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={fetchDeckPreview} 
              disabled={isGenerating}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Regenerate Data
            </Button>
            <Button 
              onClick={handleDownloadPptx} 
              disabled={isGenerating}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white border-none shadow-lg shadow-blue-900/50 flex items-center gap-2"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isGenerating ? 'Rendering PPTX...' : 'Download PPTX'}
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scripts Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4 border-b border-[#E2E8F0] pb-3">
              <PlayCircle className="w-5 h-5 text-[#2563EB]" />
              <h3 className="font-bold text-[#0F172A]">Pitch Scripts</h3>
            </div>
            
            <div className="flex gap-2 mb-4">
              <button 
                onClick={() => setActiveScript('thirtySeconds')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md flex-1 transition-colors ${activeScript === 'thirtySeconds' ? 'bg-[#2563EB] text-white' : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'}`}
              >
                30 Sec
              </button>
              <button 
                onClick={() => setActiveScript('twoMinutes')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md flex-1 transition-colors ${activeScript === 'twoMinutes' ? 'bg-[#2563EB] text-white' : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'}`}
              >
                2 Min
              </button>
              <button 
                onClick={() => setActiveScript('fiveMinutes')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md flex-1 transition-colors ${activeScript === 'fiveMinutes' ? 'bg-[#2563EB] text-white' : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'}`}
              >
                5 Min
              </button>
            </div>
            
            <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
              <p className="text-sm text-[#0F172A] leading-relaxed italic">
                "{scripts[activeScript] || 'Script not available.'}"
              </p>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4 border-b border-[#E2E8F0] pb-3">
              <Presentation className="w-5 h-5 text-[#2563EB]" />
              <h3 className="font-bold text-[#0F172A]">Deck Composition</h3>
            </div>
            <ul className="space-y-3 text-sm text-[#475569]">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#16A34A]" /> 13 Premium Layouts</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#16A34A]" /> Native Data Charts</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#16A34A]" /> AI Image Prompts (Placeholder mapped)</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#16A34A]" /> Integrated Speaker Notes</li>
            </ul>
          </Card>
        </div>

        {/* Outline Preview */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6 border-b border-[#E2E8F0] pb-4">
              <FileText className="w-5 h-5 text-[#0F172A]" />
              <h3 className="font-bold text-[#0F172A] text-lg">Presentation Outline Preview</h3>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {deckData.slides && Object.entries(deckData.slides).map(([key, slide], index) => (
                <FadeIn key={key} delay={index * 0.05}>
                  <div className="flex items-start gap-4 p-4 rounded-xl border border-[#E2E8F0] bg-white hover:border-[#BFDBFE] transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-[#F8FAFC] flex items-center justify-center font-black text-[#94A3B8] border border-[#E2E8F0] flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-[#0F172A]">{slide.title || slide.headline}</h4>
                        <Badge variant="outline" className="text-[10px]">Slide {index + 1}</Badge>
                      </div>
                      
                      {slide.imagePrompt && (
                        <div className="px-3 py-1.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded text-[11px] text-[#2563EB] font-medium">
                          🖼️ Visual: {slide.imagePrompt}
                        </div>
                      )}
                      
                      {slide.speakerNotes && (
                        <div className="p-3 bg-[#F8FAFC] border-l-2 border-[#94A3B8] rounded-r">
                          <p className="text-[11px] font-bold text-[#94A3B8] uppercase mb-1">Speaker Notes</p>
                          <p className="text-xs text-[#475569]">{slide.speakerNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
