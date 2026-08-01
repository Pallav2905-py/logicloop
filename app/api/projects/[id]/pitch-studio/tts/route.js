/**
 * app/api/projects/[id]/pitch-studio/tts/route.js
 *
 * POST — Synthesize narration audio for all scenes.
 * Body: { scenes: Scene[] }
 * Returns: { audio: TTSResult[], provider: string }
 */

import { NextResponse } from 'next/server';
import { synthesizeNarrations, getTTSProvider } from '@/lib/pitchStudio/tts';

export async function POST(request, { params }) {
  try {
    const body = await request.json();
    const { scenes } = body;

    if (!scenes || !Array.isArray(scenes)) {
      return NextResponse.json({ error: 'scenes array is required.' }, { status: 400 });
    }

    const provider = getTTSProvider();
    const audio = await synthesizeNarrations(scenes);

    return NextResponse.json({ audio, provider });
  } catch (error) {
    console.error('[pitch-studio/tts POST]', error);
    return NextResponse.json({ error: error.message || 'Failed to synthesize narration.' }, { status: 500 });
  }
}
