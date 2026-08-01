'use client';

/**
 * components/sections/AIPitchStudio.jsx
 *
 * AI Pitch Studio — flagship module for IntelliGrade AI.
 * Renders the full pitch video generation UI inline on the dashboard.
 *
 * Pipeline:
 *   Project Data → Storyboard (Gemini) → Images (Gemini/SVG) → TTS/WebSpeech → FFmpeg MP4
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video, Loader2, CheckCircle2, Clock, ChevronRight, Play, Pause,
  Download, RefreshCw, Mic, Image as ImageIcon, Film, Sparkles,
  Wand2, Volume2, Monitor, User, FileText, AlertCircle, ZapIcon,
} from 'lucide-react';
import { Card, Badge, FadeIn } from '@/components/ui';

// ─── Progress Steps ──────────────────────────────────────────────────────────

const STEPS = [
  { id: 'storyboard', label: 'Storyboard', icon: FileText, description: 'AI writes 8-scene script' },
  { id: 'images',     label: 'Images',     icon: ImageIcon, description: 'Generating scene illustrations' },
  { id: 'voice',      label: 'Voice',      icon: Mic,       description: 'Synthesizing narration' },
  { id: 'rendering',  label: 'Rendering',  icon: Film,      description: 'FFmpeg compositing video' },
  { id: 'complete',   label: 'Complete',   icon: CheckCircle2, description: 'Your video is ready' },
];

// ─── Web Speech TTS Engine ────────────────────────────────────────────────────

function useSpeechSynthesis() {
  const utteranceRef = useRef(null);
  const [speaking, setSpeaking] = useState(false);

  const speak = useCallback((text, { rate = 0.92, pitch = 0.9, volume = 1 } = {}) => {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) { resolve(); return; }
      window.speechSynthesis.cancel();

      const utt = new SpeechSynthesisUtterance(text);
      utt.rate = rate;
      utt.pitch = pitch;
      utt.volume = volume;

      // Prefer a male, en-US voice
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Male'))
      ) || voices.find((v) => v.lang.startsWith('en')) || voices[0];
      if (preferred) utt.voice = preferred;

      utt.onstart = () => setSpeaking(true);
      utt.onend = () => { setSpeaking(false); resolve(); };
      utt.onerror = () => { setSpeaking(false); resolve(); };

      utteranceRef.current = utt;
      window.speechSynthesis.speak(utt);
    });
  }, []);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  return { speak, stop, speaking };
}

// ─── Canvas Recorder for client-side video capture ───────────────────────────

function useCanvasRecorder() {
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = useCallback((canvas, audioStream = null) => {
    chunksRef.current = [];
    const streams = [canvas.captureStream(25)];
    if (audioStream) streams.push(audioStream);

    // Merge streams
    const tracks = streams.flatMap((s) => s.getTracks());
    const combined = new MediaStream(tracks);

    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';

    const recorder = new MediaRecorder(combined, { mimeType, videoBitsPerSecond: 5_000_000 });
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorderRef.current = recorder;
    recorder.start(100);
  }, []);

  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      const recorder = recorderRef.current;
      if (!recorder) { resolve(null); return; }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        resolve(blob);
      };
      recorder.stop();
    });
  }, []);

  return { startRecording, stopRecording };
}

// ─── Cinematic Canvas Renderer ────────────────────────────────────────────────

function CinematicCanvas({ scenes, images, currentScene, isPlaying }) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const startTimeRef = useRef(null);
  const imgCacheRef = useRef({});

  useEffect(() => {
    if (!canvasRef.current || !scenes?.length) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const scene = scenes[currentScene];
    if (!scene) return;

    const imageData = images?.[currentScene];

    // Load image
    const draw = (progress) => {
      ctx.clearRect(0, 0, 1920, 1080);

      // Background
      const bg = ctx.createLinearGradient(0, 0, 1920, 1080);
      bg.addColorStop(0, '#0F172A');
      bg.addColorStop(1, '#1E293B');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 1920, 1080);

      // Draw image with Ken Burns effect
      if (imgCacheRef.current[currentScene]) {
        const img = imgCacheRef.current[currentScene];
        const motion = scene.cameraMotion || 'static';
        let scale = 1.0;
        let tx = 0;
        let ty = 0;

        if (motion === 'zoom_in') scale = 1.0 + progress * 0.15;
        else if (motion === 'zoom_out') scale = 1.15 - progress * 0.15;
        else if (motion === 'pan_left') { scale = 1.1; tx = progress * -80; }
        else if (motion === 'pan_right') { scale = 1.1; tx = progress * 80; }

        ctx.save();
        ctx.translate(960 + tx, 540 + ty);
        ctx.scale(scale, scale);
        ctx.drawImage(img, -960, -540, 1920, 1080);
        ctx.restore();
      }

      // Vignette overlay
      const vignette = ctx.createRadialGradient(960, 540, 300, 960, 540, 900);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.65)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, 1920, 1080);

      // Bottom scrim
      const scrim = ctx.createLinearGradient(0, 750, 0, 1080);
      scrim.addColorStop(0, 'rgba(15,23,42,0)');
      scrim.addColorStop(1, 'rgba(15,23,42,0.95)');
      ctx.fillStyle = scrim;
      ctx.fillRect(0, 0, 1920, 1080);

      // Fade in/out
      const fadeIn = Math.min(progress * 5, 1);
      const fadeOut = progress > 0.85 ? Math.max(0, 1 - (progress - 0.85) * 6.67) : 1;
      const alpha = fadeIn * fadeOut;

      ctx.globalAlpha = alpha;

      // Scene number badge
      ctx.font = 'bold 18px system-ui';
      ctx.fillStyle = '#2563EB';
      ctx.letterSpacing = '3px';
      ctx.fillText(`SCENE ${String(scene.index).padStart(2, '0')}`, 60, 70);

      // Scene title
      ctx.font = 'bold 52px system-ui';
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.letterSpacing = '-1px';
      const titleW = ctx.measureText(scene.title).width;
      ctx.fillText(scene.title, (1920 - titleW) / 2, 940);

      // Caption
      ctx.font = '28px system-ui';
      ctx.fillStyle = 'rgba(148,163,184,0.9)';
      ctx.letterSpacing = '0px';
      const capW = ctx.measureText(scene.caption).width;
      ctx.fillText(scene.caption, (1920 - capW) / 2, 988);

      // Progress bar
      ctx.globalAlpha = 0.4 * alpha;
      ctx.fillStyle = '#2563EB';
      ctx.fillRect(0, 1070, 1920 * progress, 10);

      ctx.globalAlpha = 1;
    };

    // Load or use cached image
    if (!imgCacheRef.current[currentScene] && imageData) {
      const img = new Image();
      img.onload = () => {
        imgCacheRef.current[currentScene] = img;
      };
      img.src = imageData;
    }

    // Animation loop
    const animate = (ts) => {
      if (!startTimeRef.current) startTimeRef.current = ts;
      const elapsed = (ts - startTimeRef.current) / 1000;
      const progress = Math.min(elapsed / (scene.duration || 7), 1);
      draw(isPlaying ? progress : 0.2);
      if (progress < 1) animFrameRef.current = requestAnimationFrame(animate);
    };

    startTimeRef.current = null;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(animate);

    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [currentScene, scenes, images, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      width={1920}
      height={1080}
      className="w-full rounded-xl"
      style={{ aspectRatio: '16/9', background: '#0F172A' }}
    />
  );
}

// ─── Progress Timeline ────────────────────────────────────────────────────────

function ProgressTimeline({ completedSteps, currentStep }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const isComplete = completedSteps.includes(step.id);
        const isCurrent = currentStep === step.id;
        const isPending = !isComplete && !isCurrent;
        const Icon = step.icon;

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <motion.div
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                  opacity: isPending ? 0.4 : 1,
                }}
                transition={{ duration: 0.3 }}
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                  isComplete
                    ? 'bg-emerald-500 border-emerald-500'
                    : isCurrent
                    ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-500/40'
                    : 'bg-[#1E293B] border-[#334155]'
                }`}
              >
                {isComplete ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <Icon className="w-4 h-4 text-[#475569]" />
                )}
              </motion.div>
              <span className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                isComplete ? 'text-emerald-400' : isCurrent ? 'text-blue-400' : 'text-[#475569]'
              }`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-12 h-0.5 mx-1 mb-4 transition-colors duration-500 ${
                completedSteps.includes(STEPS[i + 1].id) || isComplete
                  ? 'bg-emerald-500'
                  : 'bg-[#334155]'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Scene Storyboard Card ────────────────────────────────────────────────────

function SceneCard({ scene, image, isActive, onClick, onRegenImage, isRegenerating }) {
  const palette = ['#2563EB', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899', '#8B5CF6'];
  const accent = palette[(scene.index - 1) % palette.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (scene.index - 1) * 0.06 }}
      onClick={onClick}
      className={`relative rounded-xl border cursor-pointer overflow-hidden transition-all duration-200 ${
        isActive
          ? 'border-blue-500 shadow-lg shadow-blue-500/20'
          : 'border-[#334155] hover:border-[#475569]'
      }`}
      style={{ background: '#0F172A' }}
    >
      {/* Image thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        {image ? (
          <img src={image} alt={scene.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: '#1E293B' }}>
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: accent }} />
          </div>
        )}
        {/* Scene number overlay */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold"
          style={{ background: accent + '33', color: accent, border: `1px solid ${accent}55` }}>
          {String(scene.index).padStart(2, '0')}
        </div>
        {/* Duration overlay */}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-mono">
          {scene.duration}s
        </div>
        {/* Active indicator */}
        {isActive && (
          <div className="absolute inset-0 border-2 rounded-xl" style={{ borderColor: accent }} />
        )}
        {/* Regen button */}
        {image && (
          <button
            onClick={(e) => { e.stopPropagation(); onRegenImage(); }}
            disabled={isRegenerating}
            className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/70 border border-white/10 hover:bg-black/90 transition-all"
            title="Regenerate image"
          >
            {isRegenerating ? (
              <Loader2 className="w-3 h-3 text-white animate-spin" />
            ) : (
              <RefreshCw className="w-3 h-3 text-white" />
            )}
          </button>
        )}
      </div>

      {/* Scene info */}
      <div className="p-3">
        <p className="font-bold text-white text-sm truncate">{scene.title}</p>
        <p className="text-[#94A3B8] text-xs mt-0.5 line-clamp-2 leading-relaxed">{scene.narration}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] px-1.5 py-0.5 rounded border" style={{ color: accent, borderColor: accent + '44', background: accent + '11' }}>
            {scene.cameraMotion?.replace('_', ' ')}
          </span>
          <span className="text-[10px] text-[#475569]">{scene.transition}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── AI Presenter Card ────────────────────────────────────────────────────────

function AIPresenterCard({ scene, isActive, isSpeaking, projectTitle }) {
  const bars = Array.from({ length: 20 });

  return (
    <div className="relative rounded-2xl overflow-hidden border border-[#334155]"
      style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#334155]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white text-sm font-bold">AI Presenter</p>
            <p className="text-[#475569] text-[11px]">IntelliGrade AI • Pitch Mode</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-red-500 animate-pulse' : 'bg-[#334155]'}`} />
          <span className="text-[11px] text-[#475569]">{isSpeaking ? 'LIVE' : 'READY'}</span>
        </div>
      </div>

      {/* Avatar area */}
      <div className="flex flex-col items-center py-6 px-4">
        {/* Animated avatar ring */}
        <div className="relative mb-4">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
            isSpeaking ? 'ring-4 ring-blue-500/50 ring-offset-4 ring-offset-[#0F172A]' : ''
          }`}
            style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}>
            <span className="text-3xl">🤖</span>
          </div>
          {isSpeaking && (
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 animate-ping opacity-30" />
          )}
        </div>

        {/* Project branding */}
        <p className="text-white font-bold text-sm text-center">{projectTitle}</p>
        <p className="text-[#475569] text-xs text-center mt-0.5">Investor Pitch Presentation</p>

        {/* Waveform visualizer */}
        <div className="flex items-end gap-0.5 mt-4 h-12">
          {bars.map((_, i) => (
            <motion.div
              key={i}
              className="w-1 rounded-full"
              style={{ background: 'linear-gradient(to top, #2563EB, #7C3AED)' }}
              animate={isSpeaking ? {
                height: [4, 4 + Math.random() * 32, 4],
                opacity: [0.4, 1, 0.4],
              } : { height: 4, opacity: 0.2 }}
              transition={{
                duration: 0.4 + Math.random() * 0.3,
                repeat: Infinity,
                delay: i * 0.05,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Current caption */}
        {scene && (
          <div className="mt-3 px-3 py-2 rounded-lg border border-[#334155] bg-[#0F172A]/60 w-full">
            <p className="text-[#94A3B8] text-[11px] leading-relaxed text-center italic">
              "{scene.narration}"
            </p>
          </div>
        )}

        {/* Provider note */}
        <div className="mt-3 flex items-center gap-1.5 text-[10px] text-[#475569]">
          <ZapIcon className="w-3 h-3" />
          <span>Presenter · HeyGen/Tavus-ready architecture</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AIPitchStudio({ project }) {
  const [phase, setPhase] = useState('idle'); // idle | generating | preview | rendering | done | error
  const [completedSteps, setCompletedSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(null);
  const [storyboard, setStoryboard] = useState(null);
  const [images, setImages] = useState([]);
  const [audioData, setAudioData] = useState([]);
  const [ttsProvider, setTtsProvider] = useState('web_speech');
  const [videoBlob, setVideoBlob] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);
  const [activeScene, setActiveScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeTab, setActiveTab] = useState('storyboard'); // storyboard | images | script | presenter
  const [regenStates, setRegenStates] = useState({});
  const [presenterMode, setPresenterMode] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const { speak, stop: stopSpeech, speaking } = useSpeechSynthesis();
  const { startRecording, stopRecording } = useCanvasRecorder();
  const playTimerRef = useRef(null);

  const projectId = project?._id;

  // ─── Step helpers ────────────────────────────────────────────────────────

  const completeStep = (stepId) =>
    setCompletedSteps((prev) => [...new Set([...prev, stepId])]);

  // ─── Main generation pipeline ────────────────────────────────────────────

  const runPipeline = async () => {
    setPhase('generating');
    setError(null);
    setCompletedSteps([]);
    setStoryboard(null);
    setImages([]);
    setAudioData([]);
    setVideoBlob(null);
    setVideoUrl(null);
    setActiveScene(0);
    setRenderProgress(0);

    try {
      // ── Step 1: Storyboard ──────────────────────────────────────────────
      setCurrentStep('storyboard');
      const sbRes = await fetch(`/api/projects/${projectId}/pitch-studio/storyboard`, { method: 'POST' });
      if (!sbRes.ok) throw new Error(`Storyboard failed: ${(await sbRes.json()).error}`);
      const sbData = await sbRes.json();
      setStoryboard(sbData.storyboard);
      setTtsProvider(sbData.ttsProvider);
      completeStep('storyboard');

      // ── Step 2: Images ──────────────────────────────────────────────────
      setCurrentStep('images');
      const scenes = sbData.storyboard.scenes;
      const imgRes = await fetch(`/api/projects/${projectId}/pitch-studio/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenes }),
      });
      if (!imgRes.ok) throw new Error(`Images failed: ${(await imgRes.json()).error}`);
      const imgData = await imgRes.json();
      setImages(imgData.images);
      completeStep('images');

      // ── Step 3: TTS ─────────────────────────────────────────────────────
      setCurrentStep('voice');
      const ttsRes = await fetch(`/api/projects/${projectId}/pitch-studio/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenes }),
      });
      if (!ttsRes.ok) throw new Error(`TTS failed: ${(await ttsRes.json()).error}`);
      const ttsData = await ttsRes.json();
      setAudioData(ttsData.audio);
      setTtsProvider(ttsData.provider);
      completeStep('voice');

      // ── Step 4: Switch to preview mode ──────────────────────────────────
      setCurrentStep(null);
      setPhase('preview');
    } catch (err) {
      console.error('[AIPitchStudio] Pipeline error:', err);
      setError(err.message);
      setPhase('error');
    }
  };

  // ─── Server-side render ──────────────────────────────────────────────────

  const renderServerSide = async () => {
    if (!storyboard || !images.length) return;

    setPhase('rendering');
    setCurrentStep('rendering');
    setRenderProgress(0);

    // Fake progress
    const progressInterval = setInterval(() => {
      setRenderProgress((p) => Math.min(p + 2, 90));
    }, 800);

    try {
      const res = await fetch(`/api/projects/${projectId}/pitch-studio/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyboard,
          images,
          audio: audioData,
          projectTitle: project.title,
        }),
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Render failed');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setVideoBlob(blob);
      setVideoUrl(url);
      setRenderProgress(100);
      completeStep('rendering');
      completeStep('complete');
      setCurrentStep('complete');
      setPhase('done');
    } catch (err) {
      clearInterval(progressInterval);
      console.error('[AIPitchStudio] Render error:', err);
      setError(err.message);
      setPhase('error');
    }
  };

  // ─── Client-side preview playback ────────────────────────────────────────

  const playClientPreview = async () => {
    if (!storyboard?.scenes?.length) return;
    setIsPlaying(true);

    for (let i = 0; i < storyboard.scenes.length; i++) {
      setActiveScene(i);
      const scene = storyboard.scenes[i];

      // Check for audio data first
      const audio = audioData[i];
      if (audio?.audioBase64) {
        // Play base64 audio
        const audioEl = new Audio(`data:audio/mp3;base64,${audio.audioBase64.replace(/^data:.*?;base64,/, '')}`);
        setIsSpeaking(true);
        await new Promise((res) => { audioEl.onended = res; audioEl.onerror = res; audioEl.play().catch(res); });
        setIsSpeaking(false);
        await new Promise((r) => setTimeout(r, 300));
      } else {
        // Web Speech API
        setIsSpeaking(true);
        await speak(scene.narration);
        setIsSpeaking(false);
        await new Promise((r) => setTimeout(r, 300));
      }
    }

    setIsPlaying(false);
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    setIsSpeaking(false);
    stopSpeech();
    if (playTimerRef.current) clearTimeout(playTimerRef.current);
  };

  // ─── Regenerate single image ─────────────────────────────────────────────

  const regenerateImage = async (sceneIdx) => {
    if (!storyboard?.scenes?.[sceneIdx]) return;
    setRegenStates((s) => ({ ...s, [sceneIdx]: true }));

    try {
      const res = await fetch(`/api/projects/${projectId}/pitch-studio/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenes: storyboard.scenes, sceneIndex: sceneIdx }),
      });
      if (!res.ok) throw new Error('Regeneration failed');
      const data = await res.json();
      setImages((prev) => {
        const next = [...prev];
        next[data.index] = data.image;
        return next;
      });
    } catch (err) {
      console.error('[AIPitchStudio] Regen image error:', err);
    } finally {
      setRegenStates((s) => ({ ...s, [sceneIdx]: false }));
    }
  };

  // ─── Regenerate script ───────────────────────────────────────────────────

  const regenerateScript = async () => {
    setPhase('generating');
    setCurrentStep('storyboard');
    setCompletedSteps([]);
    try {
      const res = await fetch(`/api/projects/${projectId}/pitch-studio/storyboard`, { method: 'POST' });
      if (!res.ok) throw new Error('Storyboard regeneration failed');
      const data = await res.json();
      setStoryboard(data.storyboard);
      completeStep('storyboard');
      setPhase('preview');
      setCurrentStep(null);
    } catch (err) {
      setError(err.message);
      setPhase('error');
    }
  };

  // ─── Download ────────────────────────────────────────────────────────────

  const downloadVideo = () => {
    if (!videoBlob) return;
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `${(project.title || 'pitch').replace(/[^a-z0-9]/gi, '-').toLowerCase()}-pitch-video.mp4`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // ─── Cleanup ─────────────────────────────────────────────────────────────

  useEffect(() => () => { if (videoUrl) URL.revokeObjectURL(videoUrl); }, [videoUrl]);

  // ─── Render ───────────────────────────────────────────────────────────────

  const totalDuration = storyboard?.totalDuration ?? 0;

  return (
    <div className="space-y-5">
      {/* ── Hero Header ── */}
      <div
        className="relative rounded-2xl overflow-hidden p-7"
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #1a1040 100%)',
          borderBottom: '1px solid #334155',
        }}
      >
        {/* Animated background grid */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(#2563EB 1px, transparent 1px), linear-gradient(90deg, #2563EB 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />
        {/* Glow blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #2563EB, transparent)' }} />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 rounded-full opacity-8 blur-3xl"
          style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}>
                <Video className="w-4 h-4 text-white" />
              </div>
              <Badge className="bg-blue-600/20 text-blue-400 border border-blue-500/30 text-[11px] font-bold tracking-wider">
                ✨ PREMIUM FEATURE
              </Badge>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">AI Pitch Studio</h2>
            <p className="text-[#94A3B8] text-sm mt-2 max-w-xl leading-relaxed">
              Transform your project into a cinematic 45–90 second investor pitch video.
              <span className="text-blue-400"> YC Demo Day quality</span>, generated in minutes.
            </p>

            {totalDuration > 0 && (
              <div className="flex items-center gap-4 mt-3">
                <span className="text-xs text-[#475569] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {totalDuration}s total duration
                </span>
                <span className="text-xs text-[#475569] flex items-center gap-1">
                  <Film className="w-3 h-3" />
                  {storyboard?.scenes?.length ?? 0} scenes
                </span>
                <span className="text-xs text-[#475569] flex items-center gap-1">
                  <Volume2 className="w-3 h-3" />
                  {ttsProvider === 'google_tts' ? 'Google Neural TTS' : 'Web Speech API'}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 flex-shrink-0">
            {phase === 'idle' && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={runPipeline}
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-white text-sm shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
                  boxShadow: '0 8px 32px rgba(37,99,235,0.4)',
                }}
              >
                <Wand2 className="w-5 h-5" />
                Generate AI Pitch Video
              </motion.button>
            )}

            {(phase === 'preview' || phase === 'done') && (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={isPlaying ? stopPlayback : playClientPreview}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm"
                    style={{ background: isPlaying ? '#EF4444' : '#2563EB' }}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isPlaying ? 'Stop Preview' : 'Preview'}
                  </motion.button>
                  {!videoUrl && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={renderServerSide}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm"
                      style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}
                    >
                      <Film className="w-4 h-4" />
                      Render MP4
                    </motion.button>
                  )}
                  {videoUrl && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={downloadVideo}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm bg-emerald-600"
                    >
                      <Download className="w-4 h-4" />
                      Download MP4
                    </motion.button>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={regenerateScript}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#94A3B8] border border-[#334155] hover:border-[#475569] hover:text-white transition-all"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Regenerate Script
                  </button>
                  <button
                    onClick={runPipeline}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#94A3B8] border border-[#334155] hover:border-[#475569] hover:text-white transition-all"
                  >
                    <Wand2 className="w-3 h-3" />
                    Regenerate All
                  </button>
                  <button
                    onClick={() => setPresenterMode((p) => !p)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      presenterMode
                        ? 'text-blue-400 border-blue-500/40 bg-blue-500/10'
                        : 'text-[#94A3B8] border-[#334155] hover:border-[#475569] hover:text-white'
                    }`}
                  >
                    <Monitor className="w-3 h-3" />
                    Presenter Mode
                  </button>
                </div>
              </div>
            )}

            {phase === 'generating' && (
              <div className="flex items-center gap-3 px-5 py-2.5 rounded-xl border border-[#334155] bg-[#0F172A]/50">
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                <span className="text-sm text-[#94A3B8] font-medium">Generating…</span>
              </div>
            )}

            {phase === 'rendering' && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 px-5 py-2.5 rounded-xl border border-[#334155] bg-[#0F172A]/50">
                  <Film className="w-5 h-5 text-violet-400 animate-pulse" />
                  <span className="text-sm text-[#94A3B8] font-medium">Rendering {renderProgress}%…</span>
                </div>
                <div className="w-full bg-[#1E293B] rounded-full h-1.5">
                  <motion.div
                    className="h-1.5 rounded-full"
                    style={{ background: 'linear-gradient(90deg, #2563EB, #7C3AED)' }}
                    animate={{ width: `${renderProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Progress Timeline */}
        {(phase === 'generating' || phase === 'rendering' || phase === 'done') && (
          <div className="relative z-10 mt-6 flex justify-center">
            <ProgressTimeline completedSteps={completedSteps} currentStep={currentStep} />
          </div>
        )}
      </div>

      {/* ── Error State ── */}
      {phase === 'error' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-5 rounded-xl border border-red-500/30 bg-red-500/10 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-400 font-semibold text-sm">Generation Failed</p>
            <p className="text-[#94A3B8] text-sm mt-1">{error}</p>
            <button
              onClick={runPipeline}
              className="mt-3 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-medium hover:bg-red-500/30 transition-all"
            >
              Try Again
            </button>
          </div>
        </motion.div>
      )}

      {/* ── Preview Area (after generation) ── */}
      <AnimatePresence>
        {(phase === 'preview' || phase === 'done' || phase === 'rendering') && storyboard && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`grid gap-5 ${presenterMode ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 lg:grid-cols-4'}`}
          >
            {/* ── Left: Cinematic Preview ── */}
            <div className={presenterMode ? 'lg:col-span-2' : 'lg:col-span-3'}>
              {/* Canvas preview player */}
              <div className="rounded-2xl overflow-hidden border border-[#334155]"
                style={{ background: '#0F172A' }}>
                <CinematicCanvas
                  scenes={storyboard.scenes}
                  images={images}
                  currentScene={activeScene}
                  isPlaying={isPlaying}
                />

                {/* Player controls bar */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-[#334155]">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={isPlaying ? stopPlayback : playClientPreview}
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                      style={{ background: isPlaying ? '#EF4444' : '#2563EB' }}
                    >
                      {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
                    </button>
                    <div>
                      <p className="text-white text-sm font-bold">
                        {storyboard.scenes[activeScene]?.title ?? ''}
                      </p>
                      <p className="text-[#475569] text-xs">
                        Scene {activeScene + 1} of {storyboard.scenes.length}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {videoUrl && (
                      <button
                        onClick={downloadVideo}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download MP4
                      </button>
                    )}
                    <span className="text-[#475569] text-xs font-mono">{totalDuration}s</span>
                  </div>
                </div>
              </div>

              {/* Downloaded Video Player */}
              {videoUrl && (
                <div className="mt-4 rounded-xl overflow-hidden border border-emerald-500/30">
                  <div className="px-4 py-2 flex items-center gap-2 border-b border-emerald-500/20"
                    style={{ background: '#0F172A' }}>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 text-sm font-bold">Rendered MP4</span>
                    <span className="text-[#475569] text-xs ml-auto">1920×1080 • H.264</span>
                  </div>
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    className="w-full"
                    style={{ background: '#000', maxHeight: '360px' }}
                  />
                </div>
              )}
            </div>

            {/* ── Right: Presenter Mode / Tab Panel ── */}
            <div className={presenterMode ? 'lg:col-span-1' : 'lg:col-span-1'}>
              {presenterMode ? (
                <AIPresenterCard
                  scene={storyboard.scenes[activeScene]}
                  isActive={isPlaying}
                  isSpeaking={isSpeaking || speaking}
                  projectTitle={project.title}
                />
              ) : (
                /* Tabs: Storyboard | Images | Script */
                <div className="rounded-2xl border border-[#334155] overflow-hidden" style={{ background: '#0F172A' }}>
                  {/* Tab bar */}
                  <div className="flex border-b border-[#334155]">
                    {[
                      { id: 'storyboard', label: 'Storyboard', icon: Film },
                      { id: 'script', label: 'Script', icon: FileText },
                    ].map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold transition-all ${
                          activeTab === id
                            ? 'text-blue-400 border-b-2 border-blue-500'
                            : 'text-[#475569] hover:text-[#94A3B8]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Tab content */}
                  <div className="p-3 max-h-[480px] overflow-y-auto">
                    {activeTab === 'storyboard' && (
                      <div className="space-y-2">
                        {storyboard.scenes.map((scene, i) => (
                          <button
                            key={scene.index}
                            onClick={() => setActiveScene(i)}
                            className={`w-full text-left p-3 rounded-xl border transition-all ${
                              activeScene === i
                                ? 'border-blue-500/50 bg-blue-500/10'
                                : 'border-[#334155] hover:border-[#475569] bg-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-bold text-[#475569]">
                                {String(scene.index).padStart(2,'0')}
                              </span>
                              <span className={`text-xs font-bold ${activeScene === i ? 'text-blue-400' : 'text-white'}`}>
                                {scene.title}
                              </span>
                              <span className="ml-auto text-[10px] text-[#475569] font-mono">{scene.duration}s</span>
                            </div>
                            <p className="text-[11px] text-[#475569] leading-relaxed line-clamp-2">{scene.narration}</p>
                          </button>
                        ))}
                      </div>
                    )}

                    {activeTab === 'script' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[#94A3B8] text-xs font-bold uppercase tracking-wider">Full Presenter Script</p>
                          <span className="text-[10px] text-[#475569]">{totalDuration}s</span>
                        </div>
                        <div className="p-3 rounded-xl border border-[#334155] bg-[#0F172A]/60">
                          <p className="text-[#94A3B8] text-xs leading-relaxed italic whitespace-pre-wrap">
                            {storyboard.presenterScript}
                          </p>
                        </div>
                        <div className="space-y-2">
                          {storyboard.scenes.map((scene) => (
                            <div key={scene.index} className="p-2.5 rounded-lg border border-[#334155]">
                              <p className="text-blue-400 text-[10px] font-bold uppercase mb-1">
                                Scene {scene.index}: {scene.title}
                              </p>
                              <p className="text-[#94A3B8] text-xs leading-relaxed">{scene.narration}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Scene Image Gallery ── */}
      <AnimatePresence>
        {(phase === 'preview' || phase === 'done') && storyboard && images.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-bold flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-400" />
                Scene Gallery
              </h3>
              <span className="text-[#475569] text-xs">{images.length} scenes generated</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3">
              {storyboard.scenes.map((scene, i) => (
                <SceneCard
                  key={scene.index}
                  scene={scene}
                  image={images[i]}
                  isActive={activeScene === i}
                  onClick={() => setActiveScene(i)}
                  onRegenImage={() => regenerateImage(i)}
                  isRegenerating={!!regenStates[i]}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Idle placeholder ── */}
      {phase === 'idle' && (
        <div
          className="rounded-2xl border border-dashed border-[#334155] flex flex-col items-center justify-center py-16 px-8"
          style={{ background: 'rgba(15,23,42,0.5)' }}
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'linear-gradient(135deg, #2563EB22, #7C3AED22)', border: '1px solid #334155' }}>
            <Sparkles className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">Ready to go cinematic?</h3>
          <p className="text-[#475569] text-sm text-center max-w-sm leading-relaxed">
            Click <span className="text-blue-400 font-semibold">Generate AI Pitch Video</span> above.
            Your project data is already loaded — the entire pipeline runs automatically.
          </p>
          <div className="flex items-center gap-6 mt-6">
            {[
              { icon: FileText, label: 'AI Storyboard', color: '#2563EB' },
              { icon: ImageIcon, label: 'Scene Images', color: '#7C3AED' },
              { icon: Mic, label: 'Voice Narration', color: '#10B981' },
              { icon: Film, label: '1080p MP4', color: '#F59E0B' },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-[#334155]"
                  style={{ background: color + '15' }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <span className="text-[10px] text-[#475569] text-center">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
